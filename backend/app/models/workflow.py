from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from app.db.session import Base


def utc_now():
    return datetime.now(timezone.utc)


class ProposalSubmission(Base):
    __tablename__ = "proposal_submissions"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False, index=True)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=True)
    name = Column(String(200), nullable=False)
    kategori = Column(String(50), nullable=False)
    lokasi = Column(String(150), nullable=False)
    masalah = Column(Text, nullable=False)
    jumlah_penerima = Column(Integer, nullable=False)
    alasan_urgensi = Column(Text, nullable=False)
    sumber_data = Column(Text, nullable=False)
    pengusul = Column(String(120), nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)
    catatan_review = Column(Text, default="")
    reviewed_by = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)


class BudgetRecord(Base):
    __tablename__ = "budget_records"

    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False, unique=True, index=True)
    fiscal_year = Column(Integer, nullable=False)
    amount = Column(Integer, nullable=False)
    source = Column(Text, nullable=False)
    verified = Column(Boolean, nullable=False, default=False)
    verified_by = Column(String(120), nullable=True)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)
