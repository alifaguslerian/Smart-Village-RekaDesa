from sqlalchemy import Column, Integer, String, Float, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base

class Program(Base):
    __tablename__ = "programs"
    __table_args__ = (
        CheckConstraint("biaya > 0"),
        CheckConstraint("jumlah_penerima > 0"),
        CheckConstraint("total_kebutuhan_dimensi > 0"),
        CheckConstraint("urgency >= 0 AND urgency <= 100"),
        CheckConstraint("skor_idm_dimensi >= 0 AND skor_idm_dimensi <= 100"),
    )
    id = Column(Integer, primary_key=True, index=True)
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=False)
    name = Column(String(200), nullable=False)
    kategori = Column(String(50), nullable=False)
    biaya = Column(Integer, nullable=False)
    jumlah_penerima = Column(Integer, nullable=False)
    urgency = Column(Float, nullable=False)
    di_kategori = Column(String(20), nullable=False)
    skor_idm_dimensi = Column(Float, nullable=False)
    total_kebutuhan_dimensi = Column(Integer, nullable=False)
    dimensi_terkait = Column(String(50), default="")

    village = relationship("Village", backref="programs")
