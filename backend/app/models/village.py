from sqlalchemy import Column, Integer, String, Float, Text
from app.db.session import Base

class Village(Base):
    __tablename__ = "villages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    kecamatan = Column(String(100), default="")
    kabupaten = Column(String(100), default="")
    skor_sosial = Column(Float, nullable=False)
    skor_ekonomi = Column(Float, nullable=False)
    skor_lingkungan = Column(Float, nullable=False)
    skor_idm_air_bersih = Column(Float, nullable=False, default=7.0)
    catatan_podes = Column(Text, default="")
