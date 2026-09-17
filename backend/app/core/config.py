"""
Scoring weights — config-driven (Scalability 15%).
Default 30/25/20/15/10 FIXED sepanjang demo (ATURAN KERAS §0).
Tapi disimpan sebagai config yang BISA diubah via code/env — bukti klaim proposal.
JANGAN expose edit di golden path.
"""
from dataclasses import dataclass

@dataclass(frozen=True)
class ScoringWeights:
    development_gap: float = 30.0
    people_affected: float = 25.0
    urgency: float = 20.0
    development_impact: float = 15.0
    cost_efficiency: float = 10.0

    def as_dict(self):
        return {
            "development_gap": self.development_gap,
            "people_affected": self.people_affected,
            "urgency": self.urgency,
            "development_impact": self.development_impact,
            "cost_efficiency": self.cost_efficiency,
        }

    def total(self) -> float:
        return sum(self.as_dict().values())

DEFAULT_WEIGHTS = ScoringWeights()
assert abs(DEFAULT_WEIGHTS.total() - 100.0) < 1e-6, "Bobot harus total 100"

# Development Impact kategori — DESIGN PARAMETER (bukan standar pemerintah)
DI_KATEGORI_MAP = {
    "Rendah": 33,
    "Sedang": 67,
    "Tinggi": 100,
}

# Urgency anchor deskriptif — hanya panduan UI, nilai aktual bebas 0-100
URGENCY_ANCHORS = {
    (0, 39): "Rendah",
    (40, 69): "Sedang",
    (70, 89): "Tinggi",
    (90, 100): "Darurat",
}

# Budget preset diskrit — BUKAN slider kontinu (ATURAN KERAS)
BUDGET_PRESETS = [300_000_000, 500_000_000, 750_000_000, 1_000_000_000]
MAX_DEMO_BUDGET = 1_000_000_000

# Knapsack unit — Rp1jt = zero rounding loss (lock reviewer approved)
KNAPSACK_UNIT = 1_000_000
