from pydantic import BaseModel

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
    village_id: int
    budget: int

class AllocationOut(BaseModel):
    budget: int
    total_cost: int
    total_score: float
    remaining_budget: int
    selected: list[ScoredProgramOut]
    unselected: list[ScoredProgramOut] = []
