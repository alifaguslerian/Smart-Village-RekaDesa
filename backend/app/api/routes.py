from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.village import Village
from app.models.program import Program
from app.core.scoring import ProgramInput, score_all_programs
from app.core.allocation import knapsack_allocate, allocate_presets
from app.core.config import BUDGET_PRESETS
from app.schemas.program import VillageOut, ProgramOut, ScoredProgramOut, AllocateRequest, AllocationOut

router = APIRouter()

def _score_village_programs(db: Session, village_id: int):
    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(404, "Desa tidak ditemukan")
    programs = db.query(Program).filter(Program.village_id == village_id).all()
    if not programs:
        return village, [], []
    inputs = [
        ProgramInput(
            name=p.name,
            biaya=p.biaya,
            jumlah_penerima=p.jumlah_penerima,
            urgency=p.urgency,
            di_kategori=p.di_kategori,
            skor_idm_dimensi=p.skor_idm_dimensi,
            total_kebutuhan_dimensi=p.total_kebutuhan_dimensi,
        )
        for p in programs
    ]
    scored = score_all_programs(inputs)
    return village, programs, scored

def _to_scored_out(prog_db: Program, scored_item):
    return ScoredProgramOut(
        id=prog_db.id,
        name=prog_db.name,
        kategori=prog_db.kategori,
        biaya=prog_db.biaya,
        jumlah_penerima=prog_db.jumlah_penerima,
        breakdown={
            "development_gap": round(scored_item.breakdown.development_gap, 2),
            "people_affected": round(scored_item.breakdown.people_affected, 2),
            "urgency": round(scored_item.breakdown.urgency, 2),
            "development_impact": round(scored_item.breakdown.development_impact, 2),
            "cost_efficiency": round(scored_item.breakdown.cost_efficiency, 2),
        },
        contributions={k: round(v, 2) for k, v in scored_item.contributions.items()},
        priority_score=round(scored_item.priority_score, 2),
    )

@router.get("/villages", response_model=list[VillageOut])
def list_villages(db: Session = Depends(get_db)):
    return db.query(Village).all()

@router.get("/villages/{village_id}", response_model=VillageOut)
def get_village(village_id: int, db: Session = Depends(get_db)):
    v = db.query(Village).filter(Village.id == village_id).first()
    if not v:
        raise HTTPException(404, "Desa tidak ditemukan")
    return v

@router.get("/villages/{village_id}/programs", response_model=list[ProgramOut])
def list_programs(village_id: int, db: Session = Depends(get_db)):
    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(404, "Desa tidak ditemukan")
    return db.query(Program).filter(Program.village_id == village_id).all()

@router.get("/villages/{village_id}/scored", response_model=list[ScoredProgramOut])
def list_scored(village_id: int, db: Session = Depends(get_db)):
    _, programs, scored = _score_village_programs(db, village_id)
    return [_to_scored_out(p, s) for p, s in zip(programs, scored)]

@router.post("/allocate", response_model=AllocationOut)
def allocate(req: AllocateRequest, db: Session = Depends(get_db)):
    _, programs, scored = _score_village_programs(db, req.village_id)
    if not programs:
        raise HTTPException(404, "Tidak ada program untuk desa ini")
    result = knapsack_allocate(scored, req.budget)
    selected_names = {s.name for s in result.selected}
    selected_out = []
    unselected_out = []
    for p, s in zip(programs, scored):
        out = _to_scored_out(p, s)
        if p.name in selected_names:
            selected_out.append(out)
        else:
            unselected_out.append(out)
    order = {name: i for i, name in enumerate([s.name for s in result.selected])}
    selected_out.sort(key=lambda x: order.get(x.name, 999))
    return AllocationOut(
        budget=req.budget,
        total_cost=result.total_cost,
        total_score=round(result.total_score, 2),
        remaining_budget=result.remaining_budget,
        selected=selected_out,
        unselected=unselected_out,
    )

@router.get("/villages/{village_id}/presets")
def get_presets(village_id: int, db: Session = Depends(get_db)):
    _, programs, scored = _score_village_programs(db, village_id)
    if not programs:
        raise HTTPException(404, "Tidak ada program")
    results = allocate_presets(scored, BUDGET_PRESETS)
    out = {}
    for budget, res in results.items():
        names = {s.name for s in res.selected}
        selected = []
        for p, s in zip(programs, scored):
            if p.name in names:
                selected.append(_to_scored_out(p, s))
        order = {n: i for i, n in enumerate([s.name for s in res.selected])}
        selected.sort(key=lambda x: order.get(x.name, 999))
        out[str(budget)] = {
            "budget": budget,
            "total_cost": res.total_cost,
            "total_score": round(res.total_score, 2),
            "remaining_budget": res.remaining_budget,
            "selected": [x.model_dump() for x in selected],
        }
    return out

@router.get("/programs/{program_id}", response_model=ScoredProgramOut)
def get_program_scored(program_id: int, db: Session = Depends(get_db)):
    p = db.query(Program).filter(Program.id == program_id).first()
    if not p:
        raise HTTPException(404, "Program tidak ditemukan")
    _, programs, scored = _score_village_programs(db, p.village_id)
    for prog_db, s in zip(programs, scored):
        if prog_db.id == program_id:
            return _to_scored_out(prog_db, s)
    raise HTTPException(404, "Program tidak ditemukan")
