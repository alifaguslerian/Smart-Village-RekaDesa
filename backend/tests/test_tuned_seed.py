"""
Tuned seed — assert PER-KOMPONEN (anti-canceling bug).
Kalau cuma assert total 92.0, DG -2 & CE +2 bisa saling nutupin.
Seed canonical: PA 96.0 via (187-43)/(193-43)*100, CE ~90 via min/max ratio, DI 90.0 via (100+79.91)/2.
Jangan ubah angka tanpa re-validate.
"""
import sys, os
import pytest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.core.scoring import ProgramInput, score_all_programs, min_max_normalize
from app.core.config import DEFAULT_WEIGHTS


def get_canonical_programs():
    """8 program — Air Bersih anchor 92.0 exact."""
    return [
        ProgramInput(name="Air Bersih Dusun II", biaya=90_000_000, jumlah_penerima=187, urgency=88, di_kategori="Tinggi", skor_idm_dimensi=7, total_kebutuhan_dimensi=234),
        ProgramInput(name="Beasiswa Anak Kurang Mampu", biaya=75_000_000, jumlah_penerima=43, urgency=80, di_kategori="Tinggi", skor_idm_dimensi=35, total_kebutuhan_dimensi=60),
        ProgramInput(name="Perbaikan Drainase Lingkungan", biaya=155_000_000, jumlah_penerima=193, urgency=75, di_kategori="Sedang", skor_idm_dimensi=25, total_kebutuhan_dimensi=280),
        ProgramInput(name="Jalan Usaha Tani Dusun I", biaya=150_000_000, jumlah_penerima=80, urgency=65, di_kategori="Sedang", skor_idm_dimensi=45, total_kebutuhan_dimensi=300),
        ProgramInput(name="Penyuluhan PHBS & Sanitasi", biaya=40_000_000, jumlah_penerima=90, urgency=55, di_kategori="Rendah", skor_idm_dimensi=60, total_kebutuhan_dimensi=200),
        ProgramInput(name="Rehabilitasi Posyandu Balita", biaya=120_000_000, jumlah_penerima=110, urgency=72, di_kategori="Tinggi", skor_idm_dimensi=30, total_kebutuhan_dimensi=150),
        ProgramInput(name="Pelatihan UMKM Olahan Pangan", biaya=70_000_000, jumlah_penerima=65, urgency=58, di_kategori="Sedang", skor_idm_dimensi=55, total_kebutuhan_dimensi=200),
        ProgramInput(name="Bank Sampah & Pengelolaan Limbah", biaya=100_000_000, jumlah_penerima=100, urgency=45, di_kategori="Rendah", skor_idm_dimensi=50, total_kebutuhan_dimensi=180),
    ]


def test_canonical_per_component():
    programs = get_canonical_programs()
    scored = score_all_programs(programs, DEFAULT_WEIGHTS)
    air = next(s for s in scored if s.name == "Air Bersih Dusun II")

    assert round(air.breakdown.development_gap, 1) == 93.0
    assert round(air.contributions["development_gap"], 1) == 27.9

    assert round(air.breakdown.people_affected, 1) == 96.0
    assert round(air.contributions["people_affected"], 1) == 24.0

    assert round(air.breakdown.urgency, 1) == 88.0
    assert round(air.contributions["urgency"], 1) == 17.6

    assert round(air.breakdown.development_impact, 1) == 90.0
    assert round(air.contributions["development_impact"], 1) == 13.5

    assert round(air.breakdown.cost_efficiency, 1) == 90.0
    assert round(air.contributions["cost_efficiency"], 1) == 9.0

    assert round(air.priority_score, 1) == 92.0


def test_min_max_fallback_neutral():
    """max==min -> 50 netral, bukan 100. Kalau semua kandidat sama, metrik tidak membedakan."""
    assert min_max_normalize(100, 100, 100) == 50.0
    assert min_max_normalize(0, 0, 0) == 50.0
    prog = ProgramInput(name="Solo", biaya=100_000_000, jumlah_penerima=100, urgency=50, di_kategori="Sedang", skor_idm_dimensi=50, total_kebutuhan_dimensi=200)
    scored = score_all_programs([prog])
    assert scored[0].breakdown.people_affected == 50.0
    assert scored[0].breakdown.cost_efficiency == 50.0


def test_single_program_contributions():
    prog = ProgramInput(name="Solo", biaya=100_000_000, jumlah_penerima=100, urgency=50, di_kategori="Sedang", skor_idm_dimensi=30, total_kebutuhan_dimensi=200)
    scored = score_all_programs([prog])
    s = scored[0]
    assert round(s.breakdown.development_gap, 1) == 70.0
    assert round(s.contributions["development_gap"], 1) == 21.0
    assert s.breakdown.people_affected == 50.0
    assert round(s.contributions["people_affected"], 1) == 12.5
    assert round(s.contributions["urgency"], 1) == 10.0
    assert round(s.breakdown.development_impact, 1) == 58.5
    assert round(s.contributions["development_impact"], 2) == 8.78
    assert s.breakdown.cost_efficiency == 50.0
    assert round(s.contributions["cost_efficiency"], 1) == 5.0


def test_reject_invalid_scoring_inputs():
    prog = ProgramInput(name="Rusak", biaya=0, jumlah_penerima=100, urgency=50, di_kategori="Sedang", skor_idm_dimensi=30, total_kebutuhan_dimensi=200)
    with pytest.raises(ValueError):
        score_all_programs([prog])
    prog.urgency = 50
    prog.jumlah_penerima = 0
    with pytest.raises(ValueError):
        score_all_programs([prog])
    prog.biaya = 10_000_000
    prog.urgency = 101
    with pytest.raises(ValueError):
        score_all_programs([prog])
