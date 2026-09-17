"""
0/1 Knapsack allocation — Dynamic Programming, BUKAN greedy.
Unit Rp1jt (KNAPSACK_UNIT), value = round(priority_score * 10).
Optimalitas hanya pada model diskret (BUILD_CONTEXT §3).
"""
from __future__ import annotations
from dataclasses import dataclass
from typing import List

import math

from app.core.config import KNAPSACK_UNIT, MAX_DEMO_BUDGET
from app.core.scoring import ScoredProgram


@dataclass
class AllocationResult:
    budget: int  # rupiah
    selected: List[ScoredProgram]
    total_score: float
    total_cost: int
    unit: int = KNAPSACK_UNIT
    remaining_budget: int = 0
    unselected: List[ScoredProgram] = None  # type: ignore

    def __post_init__(self):
        if self.unselected is None:
            self.unselected = []  # type: ignore
        # remaining computed di knapsack_allocate, tapi jaga konsistensi
        if self.remaining_budget == 0 and self.budget != 0:
            self.remaining_budget = self.budget - self.total_cost


def knapsack_allocate(
    scored_programs: List[ScoredProgram],
    budget: int,
    unit: int = KNAPSACK_UNIT,
) -> AllocationResult:
    """
    Standard 0/1 knapsack DP, O(n × capacity). n=8, capacity~1000 -> instant.
    weight = max(1, ceil(biaya/unit)); biaya nonpositif ditolak
    value  = round(priority_score * 10) — presisi 1 desimal
    capacity = budget // unit
    """
    if unit <= 0:
        raise ValueError("Unit diskretisasi harus positif")
    if unit != KNAPSACK_UNIT:
        raise ValueError("Simulasi memakai unit tetap Rp 1 juta")
    if budget < 0:
        raise ValueError("Pagu anggaran tidak boleh negatif")
    if budget > MAX_DEMO_BUDGET:
        raise ValueError("Pagu anggaran melebihi batas simulasi Rp 1 miliar")
    if any(p.biaya <= 0 for p in scored_programs):
        raise ValueError("Biaya program harus positif")
    n = len(scored_programs)
    if n == 0 or budget <= 0:
        return AllocationResult(
            budget=budget,
            selected=[],
            total_score=0.0,
            total_cost=0,
            unit=unit,
            remaining_budget=budget,
            unselected=list(scored_programs),
        )

    weights = []
    for p in scored_programs:
        weights.append(max(1, math.ceil(p.biaya / unit)))
    values = [round(p.priority_score * 10) for p in scored_programs]
    capacity = budget // unit

    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        wi = weights[i - 1]
        vi = values[i - 1]
        for w in range(capacity + 1):
            if wi <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - wi] + vi)
            else:
                dp[i][w] = dp[i - 1][w]

    selected: List[ScoredProgram] = []
    w = capacity
    for i in range(n, 0, -1):
        if dp[i][w] != dp[i - 1][w]:
            selected.append(scored_programs[i - 1])
            w -= weights[i - 1]

    selected.reverse()
    total_score = sum(p.priority_score for p in selected)
    total_cost = sum(p.biaya for p in selected)
    selected_ids = {id(p) for p in selected}
    unselected = [p for p in scored_programs if id(p) not in selected_ids]

    return AllocationResult(
        budget=budget,
        selected=selected,
        total_score=total_score,
        total_cost=total_cost,
        unit=unit,
        remaining_budget=budget - total_cost,
        unselected=unselected,
    )


def allocate_presets(
    scored_programs: List[ScoredProgram],
    budgets: List[int],
    unit: int = KNAPSACK_UNIT,
) -> dict[int, AllocationResult]:
    """Precompute DP untuk 4 preset budget (BUILD_CONTEXT §3)."""
    return {b: knapsack_allocate(scored_programs, b, unit) for b in budgets}
