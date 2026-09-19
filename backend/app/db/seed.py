"""
Seed 1 desa + 8 program — canonical, menghasilkan Air Bersih 92.0.
Jalankan: PYTHONPATH=backend DATABASE_URL=sqlite:///./rekadesa.db python -m app.db.seed
"""
from app.db.session import Base, engine, SessionLocal
from app.models.village import Village
from app.models.program import Program
from app.models.workflow import BudgetRecord, ProposalSubmission
from app.core.canonical_seed import CANONICAL_PROGRAMS, CANONICAL_META

VILLAGE_NAME = "Desa Suka Maju"

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(Village).filter(Village.name == VILLAGE_NAME).first()
        if existing:
            db.query(ProposalSubmission).filter(ProposalSubmission.village_id == existing.id).delete()
            db.query(BudgetRecord).filter(BudgetRecord.village_id == existing.id).delete()
            db.query(Program).filter(Program.village_id == existing.id).delete()
            db.delete(existing)
            db.commit()

        village = Village(
            name=VILLAGE_NAME,
            kecamatan="Kec. Sumber Rejeki",
            kabupaten="Kab. Maju Sejahtera",
            skor_sosial=62.0,
            skor_ekonomi=48.0,
            skor_lingkungan=35.0,
            skor_idm_air_bersih=7.0,
            catatan_podes="Jumlah KK 312, akses air bersih terbatas di Dusun II (sumber mata air musiman), jalan usaha tani rusak 40%, posyandu 1 unit kondisi perlu rehab, UMKM olahan pangan potensial.",
        )
        db.add(village)
        db.flush()

        for inp in CANONICAL_PROGRAMS:
            kategori, dimensi = CANONICAL_META[inp.name]
            db.add(Program(
                village_id=village.id,
                name=inp.name,
                kategori=kategori,
                biaya=inp.biaya,
                jumlah_penerima=inp.jumlah_penerima,
                urgency=inp.urgency,
                di_kategori=inp.di_kategori,
                skor_idm_dimensi=inp.skor_idm_dimensi,
                total_kebutuhan_dimensi=inp.total_kebutuhan_dimensi,
                dimensi_terkait=dimensi,
            ))
        db.add(BudgetRecord(
            village_id=village.id,
            fiscal_year=2026,
            amount=1_000_000_000,
            source="Dataset simulasi RekaDesa; ganti dengan dokumen pagu resmi saat digunakan desa.",
            verified=False,
        ))
        db.commit()
        print(f"Seeded {VILLAGE_NAME} with {len(CANONICAL_PROGRAMS)} programs (id={village.id})")
        from app.core.scoring import score_all_programs
        scored = score_all_programs(CANONICAL_PROGRAMS)
        air = next(s for s in scored if s.name == "Air Bersih Dusun II")
        print(f"Validation Air Bersih: total {round(air.priority_score,1)} (expected 92.0) contribs {[round(v,1) for v in air.contributions.values()]}")
        assert round(air.priority_score, 1) == 92.0
        print("Seed validation PASSED")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
