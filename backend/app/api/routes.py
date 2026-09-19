from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.village import Village
from app.models.program import Program
from app.models.workflow import BudgetRecord, ProposalSubmission
from app.core.scoring import ProgramInput, score_all_programs
from app.core.allocation import knapsack_allocate, allocate_presets
from app.core.config import BUDGET_PRESETS
from app.schemas.program import (
    AllocationOut,
    AllocateRequest,
    BudgetOut,
    BudgetUpdate,
    ProgramOut,
    ProposalCreate,
    ProposalOut,
    ProposalReview,
    ScoredProgramOut,
    VillageOut,
)
from app.api.security import require_operator

router = APIRouter()


def _get_village(db: Session, village_id: int) -> Village:
    village = db.query(Village).filter(Village.id == village_id).first()
    if not village:
        raise HTTPException(404, "Desa tidak ditemukan")
    return village


def _get_budget(db: Session, village_id: int) -> BudgetRecord:
    _get_village(db, village_id)
    budget = db.query(BudgetRecord).filter(BudgetRecord.village_id == village_id).first()
    if not budget:
        raise HTTPException(409, "Data pagu belum disiapkan")
    return budget

def _score_village_programs(db: Session, village_id: int):
    village = _get_village(db, village_id)
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
    try:
        scored = score_all_programs(inputs)
    except ValueError as exc:
        raise HTTPException(409, f"Data usulan perlu diperbaiki: {exc}") from exc
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
    return _get_village(db, village_id)


@router.get("/villages/{village_id}/budget", response_model=BudgetOut)
def get_budget(village_id: int, db: Session = Depends(get_db)):
    return _get_budget(db, village_id)


@router.put("/villages/{village_id}/budget", response_model=BudgetOut)
def update_budget(
    village_id: int,
    payload: BudgetUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_operator),
):
    budget = _get_budget(db, village_id)
    for field, value in payload.model_dump().items():
        setattr(budget, field, value)
    budget.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(budget)
    return budget


@router.post("/villages/{village_id}/proposals", response_model=ProposalOut, status_code=201)
def submit_proposal(village_id: int, payload: ProposalCreate, db: Session = Depends(get_db)):
    _get_village(db, village_id)
    proposal = ProposalSubmission(village_id=village_id, **payload.model_dump())
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal


@router.get("/villages/{village_id}/proposals", response_model=list[ProposalOut])
def list_proposals(
    village_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(require_operator),
):
    _get_village(db, village_id)
    return (
        db.query(ProposalSubmission)
        .filter(ProposalSubmission.village_id == village_id)
        .order_by(ProposalSubmission.created_at.desc())
        .limit(200)
        .all()
    )


@router.post("/proposals/{proposal_id}/review", response_model=ProposalOut)
def review_proposal(
    proposal_id: int,
    payload: ProposalReview,
    db: Session = Depends(get_db),
    _: None = Depends(require_operator),
):
    proposal = db.query(ProposalSubmission).filter(ProposalSubmission.id == proposal_id).first()
    if not proposal:
        raise HTTPException(404, "Usulan tidak ditemukan")
    if proposal.status != "pending":
        raise HTTPException(409, "Usulan ini sudah diperiksa")

    proposal.reviewed_by = payload.reviewed_by.strip()
    proposal.catatan_review = payload.catatan_review.strip()
    proposal.reviewed_at = datetime.now(timezone.utc)

    if payload.decision == "reject":
        proposal.status = "rejected"
    else:
        program = Program(
            village_id=proposal.village_id,
            name=proposal.name,
            kategori=proposal.kategori,
            biaya=payload.biaya,
            jumlah_penerima=proposal.jumlah_penerima,
            urgency=payload.urgency,
            di_kategori=payload.di_kategori,
            skor_idm_dimensi=payload.skor_idm_dimensi,
            total_kebutuhan_dimensi=payload.total_kebutuhan_dimensi,
            dimensi_terkait=payload.dimensi_terkait,
        )
        db.add(program)
        db.flush()
        proposal.program_id = program.id
        proposal.status = "approved"

    db.commit()
    db.refresh(proposal)
    return proposal

@router.get("/villages/{village_id}/programs", response_model=list[ProgramOut])
def list_programs(village_id: int, db: Session = Depends(get_db), _: None = Depends(require_operator)):
    _get_village(db, village_id)
    return db.query(Program).filter(Program.village_id == village_id).all()

@router.get("/villages/{village_id}/scored", response_model=list[ScoredProgramOut])
def list_scored(village_id: int, db: Session = Depends(get_db)):
    _, programs, scored = _score_village_programs(db, village_id)
    return [_to_scored_out(p, s) for p, s in zip(programs, scored)]

@router.post("/allocate", response_model=AllocationOut)
def allocate(req: AllocateRequest, db: Session = Depends(get_db), _: None = Depends(require_operator)):
    budget_record = _get_budget(db, req.village_id)
    if req.budget > budget_record.amount:
        raise HTTPException(422, f"Pagu simulasi melebihi batas tercatat Rp {budget_record.amount:,}")
    _, programs, scored = _score_village_programs(db, req.village_id)
    if not programs:
        raise HTTPException(404, "Tidak ada program untuk desa ini")
    result = knapsack_allocate(scored, req.budget)
    selected_ids = {id(s) for s in result.selected}
    order = {id(s): i for i, s in enumerate(result.selected)}
    selected_out: list[ScoredProgramOut] = []
    unselected_out: list[ScoredProgramOut] = []
    # kumpulkan dengan order agar kebal duplikat nama
    tmp_selected: list[tuple[int, ScoredProgramOut]] = []
    for p, s in zip(programs, scored):
        out = _to_scored_out(p, s)
        if id(s) in selected_ids:
            tmp_selected.append((order[id(s)], out))
        else:
            unselected_out.append(out)
    tmp_selected.sort(key=lambda x: x[0])
    selected_out = [o for _, o in tmp_selected]
    return AllocationOut(
        budget=req.budget,
        total_cost=result.total_cost,
        total_score=round(result.total_score, 2),
        remaining_budget=result.remaining_budget,
        selected=selected_out,
        unselected=unselected_out,
    )

@router.get("/villages/{village_id}/presets")
def get_presets(village_id: int, db: Session = Depends(get_db), _: None = Depends(require_operator)):
    budget_record = _get_budget(db, village_id)
    _, programs, scored = _score_village_programs(db, village_id)
    if not programs:
        raise HTTPException(404, "Tidak ada program")
    available_presets = [budget for budget in BUDGET_PRESETS if budget <= budget_record.amount]
    results = allocate_presets(scored, available_presets)
    out = {}
    for budget, res in results.items():
        sel_ids = {id(s) for s in res.selected}
        order = {id(s): i for i, s in enumerate(res.selected)}
        # kumpulkan dengan order
        tmp: list[tuple[int, ScoredProgramOut]] = []
        for p, s in zip(programs, scored):
            if id(s) in sel_ids:
                tmp.append((order[id(s)], _to_scored_out(p, s)))
        tmp.sort(key=lambda x: x[0])
        selected = [o for _, o in tmp]
        out[str(budget)] = {
            "budget": budget,
            "total_cost": res.total_cost,
            "total_score": round(res.total_score, 2),
            "remaining_budget": res.remaining_budget,
            "selected": [x.model_dump() for x in selected],
        }
    return out

@router.get("/programs/{program_id}", response_model=ScoredProgramOut)
def get_program_scored(program_id: int, db: Session = Depends(get_db), _: None = Depends(require_operator)):
    p = db.query(Program).filter(Program.id == program_id).first()
    if not p:
        raise HTTPException(404, "Program tidak ditemukan")
    _, programs, scored = _score_village_programs(db, p.village_id)
    for prog_db, s in zip(programs, scored):
        if prog_db.id == program_id:
            return _to_scored_out(prog_db, s)
    raise HTTPException(404, "Program tidak ditemukan")
