from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator
from app.core.config import MAX_DEMO_BUDGET

class ProgramOut(BaseModel):
    id: int
    village_id: int
    name: str
    kategori: str
    biaya: int
    jumlah_penerima: int
    urgency: float
    di_kategori: str
    skor_idm_dimensi: float
    total_kebutuhan_dimensi: int
    dimensi_terkait: str
    class Config:
        from_attributes = True

class VillageOut(BaseModel):
    id: int
    name: str
    kecamatan: str
    kabupaten: str
    skor_sosial: float
    skor_ekonomi: float
    skor_lingkungan: float
    skor_idm_air_bersih: float
    catatan_podes: str
    class Config:
        from_attributes = True

class ScoredProgramOut(BaseModel):
    id: int
    name: str
    kategori: str
    biaya: int
    jumlah_penerima: int
    breakdown: dict
    contributions: dict
    priority_score: float

class AllocateRequest(BaseModel):
    village_id: int = Field(gt=0)
    budget: int = Field(ge=0, le=MAX_DEMO_BUDGET, strict=True)

class AllocationOut(BaseModel):
    budget: int
    total_cost: int
    total_score: float
    remaining_budget: int
    selected: list[ScoredProgramOut]
    unselected: list[ScoredProgramOut] = []


class ProposalCreate(BaseModel):
    name: str = Field(min_length=5, max_length=200)
    kategori: str = Field(min_length=3, max_length=50)
    lokasi: str = Field(min_length=3, max_length=150)
    masalah: str = Field(min_length=10, max_length=1500)
    jumlah_penerima: int = Field(gt=0, le=1_000_000)
    alasan_urgensi: str = Field(min_length=10, max_length=1000)
    sumber_data: str = Field(min_length=3, max_length=1000)
    pengusul: str = Field(min_length=3, max_length=120)

    @field_validator(
        "name",
        "kategori",
        "lokasi",
        "masalah",
        "alasan_urgensi",
        "sumber_data",
        "pengusul",
        mode="before",
    )
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value


class ProposalOut(ProposalCreate):
    id: int
    village_id: int
    program_id: int | None
    status: Literal["pending", "approved", "rejected"]
    catatan_review: str
    reviewed_by: str | None
    created_at: datetime
    reviewed_at: datetime | None

    class Config:
        from_attributes = True


class ProposalReview(BaseModel):
    decision: Literal["approve", "reject"]
    reviewed_by: str = Field(min_length=3, max_length=120)
    catatan_review: str = Field(min_length=3, max_length=1000)
    biaya: int | None = Field(default=None, gt=0)
    urgency: float | None = Field(default=None, ge=0, le=100)
    di_kategori: Literal["Rendah", "Sedang", "Tinggi"] | None = None
    skor_idm_dimensi: float | None = Field(default=None, ge=0, le=100)
    total_kebutuhan_dimensi: int | None = Field(default=None, gt=0)
    dimensi_terkait: str | None = Field(default=None, min_length=3, max_length=50)

    @field_validator("reviewed_by", "catatan_review", "dimensi_terkait", mode="before")
    @classmethod
    def strip_review_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def require_scoring_data_for_approval(self):
        if self.decision == "approve":
            required = (
                self.biaya,
                self.urgency,
                self.di_kategori,
                self.skor_idm_dimensi,
                self.total_kebutuhan_dimensi,
                self.dimensi_terkait,
            )
            if any(value is None for value in required):
                raise ValueError("Data biaya dan penilaian wajib lengkap untuk menyetujui usulan")
        return self


class BudgetUpdate(BaseModel):
    fiscal_year: int = Field(ge=2020, le=2100)
    amount: int = Field(gt=0, le=MAX_DEMO_BUDGET, strict=True)
    source: str = Field(min_length=5, max_length=1000)
    verified: bool = False
    verified_by: str | None = Field(default=None, max_length=120)

    @field_validator("source", "verified_by", mode="before")
    @classmethod
    def strip_budget_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def require_verifier(self):
        if self.verified and not (self.verified_by or "").strip():
            raise ValueError("Nama pemeriksa wajib diisi ketika pagu ditandai terverifikasi")
        return self


class BudgetOut(BudgetUpdate):
    id: int
    village_id: int
    updated_at: datetime

    class Config:
        from_attributes = True
