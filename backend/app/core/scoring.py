"""
Scoring engine — 5 komponen, deterministik 100%, tanpa AI.
Formula presisi BUILD_CONTEXT §2.
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import List

from app.core.config import DEFAULT_WEIGHTS, DI_KATEGORI_MAP, ScoringWeights


def min_max_normalize(value: float, min_val: float, max_val: float) -> float:
    """
    (x - min) / (max - min) * 100
    Fallback 50 (netral) kalau max == min — metrik tidak memberi info pembeda,
    50 lebih jujur daripada 100. Lock reviewer approved.
    """
    if max_val == min_val:
        return 50.0
    return (value - min_val) / (max_val - min_val) * 100.0


@dataclass
class ProgramInput:
    name: str
    biaya: int  # rupiah
    jumlah_penerima: int
    urgency: float  # 0-100 bebas
    di_kategori: str  # Rendah/Sedang/Tinggi
    skor_idm_dimensi: float  # 0-100
    total_kebutuhan_dimensi: int


@dataclass
class ComponentBreakdown:
    development_gap: float
    people_affected: float
    urgency: float
    development_impact: float
    cost_efficiency: float


@dataclass
class ScoredProgram:
    name: str
    breakdown: ComponentBreakdown
    contributions: dict
    priority_score: float
    biaya: int
    jumlah_penerima: int


def compute_development_gap(skor_idm: float) -> float:
    skor_idm = max(0.0, min(100.0, float(skor_idm)))
    return 100.0 - skor_idm


def compute_development_impact(di_kategori: str, jumlah_penerima: int, total_kebutuhan: int) -> float:
    key = str(di_kategori).strip().capitalize()
    kategori_val = DI_KATEGORI_MAP.get(key, DI_KATEGORI_MAP["Sedang"])  # fallback 67, anti-KeyError
    cakupan = (jumlah_penerima / total_kebutuhan * 100.0) if total_kebutuhan > 0 else 0.0
    cakupan = max(0.0, min(100.0, cakupan))
    return (kategori_val + cakupan) / 2.0


def score_all_programs(
    programs: List[ProgramInput],
    weights: ScoringWeights = DEFAULT_WEIGHTS,
) -> List[ScoredProgram]:
    """
    Hitung Priority Score untuk semua kandidat desa & periode sama.
    PA & CE dinormalisasi relatif ke kandidat lain.
    """
    if not programs:
        return []

    penerima_vals = [p.jumlah_penerima for p in programs]
    pa_min, pa_max = min(penerima_vals), max(penerima_vals)

    ce_ratios = [p.jumlah_penerima / float(p.biaya) if p.biaya > 0 else 0.0 for p in programs]
    # clamp biaya <=0 tetap 0.0 ratio (tidak negatif), jadi CE tidak pernah <0
    ce_min, ce_max = min(ce_ratios), max(ce_ratios)

    results: List[ScoredProgram] = []
    for prog, ce_ratio in zip(programs, ce_ratios):
        dg = compute_development_gap(prog.skor_idm_dimensi)
        pa = min_max_normalize(float(prog.jumlah_penerima), float(pa_min), float(pa_max))
        urg = max(0.0, min(100.0, float(prog.urgency)))
        di = compute_development_impact(prog.di_kategori, prog.jumlah_penerima, prog.total_kebutuhan_dimensi)
        ce = min_max_normalize(ce_ratio, ce_min, ce_max)

        breakdown = ComponentBreakdown(
            development_gap=dg,
            people_affected=pa,
            urgency=urg,
            development_impact=di,
            cost_efficiency=ce,
        )

        w = weights.as_dict()
        contributions = {
            "development_gap": dg * w["development_gap"] / 100.0,
            "people_affected": pa * w["people_affected"] / 100.0,
            "urgency": urg * w["urgency"] / 100.0,
            "development_impact": di * w["development_impact"] / 100.0,
            "cost_efficiency": ce * w["cost_efficiency"] / 100.0,
        }
        total = sum(contributions.values())

        results.append(ScoredProgram(
            name=prog.name,
            breakdown=breakdown,
            contributions=contributions,
            priority_score=total,
            biaya=prog.biaya,
            jumlah_penerima=prog.jumlah_penerima,
        ))

    return results
