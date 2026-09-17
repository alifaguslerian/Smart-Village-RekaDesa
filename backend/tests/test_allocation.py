"""
Phase 1 — Allocation DP tests.
- DP optimal (vs brute force)
- 4 preset precompute + monotonic score
- Greedy fails (double-count CE)
- Edge: empty / zero budget / non-multiple budget
"""
import sys, os, itertools
import pytest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.core.scoring import ProgramInput, score_all_programs
from app.core.allocation import knapsack_allocate, allocate_presets
from app.core.config import BUDGET_PRESETS
from tests.test_tuned_seed import get_canonical_programs


def test_knapsack_not_greedy():
    """DP != greedy (value/biaya) — greedy double-count Cost Efficiency."""
    progs = [
        ProgramInput(name="A", biaya=100_000_000, jumlah_penerima=100, urgency=90, di_kategori="Tinggi", skor_idm_dimensi=10, total_kebutuhan_dimensi=150),
        ProgramInput(name="B", biaya=100_000_000, jumlah_penerima=90, urgency=85, di_kategori="Tinggi", skor_idm_dimensi=15, total_kebutuhan_dimensi=150),
        ProgramInput(name="C", biaya=120_000_000, jumlah_penerima=150, urgency=95, di_kategori="Tinggi", skor_idm_dimensi=5, total_kebutuhan_dimensi=180),
    ]
    scored = score_all_programs(progs)
    res = knapsack_allocate(scored, 200_000_000)
    assert res.total_cost <= 200_000_000
    # brute force optimal
    best = 0
    for r in range(len(scored)+1):
        for combo in itertools.combinations(scored, r):
            cost = sum(p.biaya for p in combo)
            if cost <= 200_000_000:
                val = sum(round(p.priority_score*10) for p in combo)
                if val > best:
                    best = val
    assert sum(round(p.priority_score*10) for p in res.selected) == best


def test_presets_precompute():
    programs = get_canonical_programs()
    scored = score_all_programs(programs)
    presets = allocate_presets(scored, BUDGET_PRESETS)
    assert set(presets.keys()) == set(BUDGET_PRESETS)
    for budget, res in presets.items():
        assert res.total_cost <= budget, f"budget {budget} exceeded: {res.total_cost}"
        print(f"Budget {budget:,} -> {len(res.selected)} programs, cost {res.total_cost:,}, score {res.total_score:.2f}: {[p.name for p in res.selected]}")
    scores = [presets[b].total_score for b in sorted(BUDGET_PRESETS)]
    for i in range(len(scores)-1):
        assert scores[i+1] >= scores[i] - 1e-6, "score harus non-decreasing dengan budget"


def test_allocation_respects_unit():
    programs = get_canonical_programs()
    scored = score_all_programs(programs)
    res = knapsack_allocate(scored, 500_000_500)
    assert res.total_cost <= 500_000_500


def test_empty_and_zero_budget():
    programs = get_canonical_programs()
    scored = score_all_programs(programs)
    res = knapsack_allocate(scored, 0)
    assert len(res.selected) == 0
    res2 = knapsack_allocate([], 500_000_000)
    assert len(res2.selected) == 0


def test_reject_invalid_money_inputs():
    scored = score_all_programs(get_canonical_programs())
    for budget in (-1, 1_000_000_001):
        with pytest.raises(ValueError):
            knapsack_allocate(scored, budget)
    scored[0].biaya = 0
    with pytest.raises(ValueError):
        knapsack_allocate(scored, 500_000_000)
    scored[0].biaya = 90_000_000
    with pytest.raises(ValueError):
        knapsack_allocate(scored, 500_000_000, unit=1)


def test_canonical_dp_optimal_500jt():
    """Canonical seed: DP optimal di 500jt (vs brute force)."""
    programs = get_canonical_programs()
    scored = score_all_programs(programs)
    res = knapsack_allocate(scored, 500_000_000)
    best = 0
    for r in range(len(scored)+1):
        for combo in itertools.combinations(scored, r):
            cost = sum(p.biaya for p in combo)
            if cost <= 500_000_000:
                val = sum(round(p.priority_score*10) for p in combo)
                best = max(best, val)
    assert sum(round(p.priority_score*10) for p in res.selected) == best


def test_decimal_budget_overspend():
    """Biaya desimal 10.4jt tidak boleh terpilih di budget 10jt (ceil)."""
    progs = [
        ProgramInput(name="Desimal", biaya=10_400_000, jumlah_penerima=50, urgency=80, di_kategori="Tinggi", skor_idm_dimensi=10, total_kebutuhan_dimensi=100),
        ProgramInput(name="Kecil", biaya=5_000_000, jumlah_penerima=20, urgency=50, di_kategori="Rendah", skor_idm_dimensi=60, total_kebutuhan_dimensi=100),
    ]
    scored = score_all_programs(progs)
    res = knapsack_allocate(scored, 10_000_000)
    names = [p.name for p in res.selected]
    assert "Desimal" not in names, "10.4jt tidak boleh masuk budget 10jt (ceil -> weight 11)"
    assert res.total_cost <= 10_000_000


def test_remaining_and_unselected():
    programs = get_canonical_programs()
    scored = score_all_programs(programs)
    res = knapsack_allocate(scored, 500_000_000)
    assert res.remaining_budget == res.budget - res.total_cost
    assert len(res.selected) + len(res.unselected) == len(scored)
    # empty case
    empty = knapsack_allocate([], 500_000_000)
    assert empty.remaining_budget == 500_000_000
    assert len(empty.unselected) == 0
