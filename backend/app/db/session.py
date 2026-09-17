import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("rekadesa.db")
REKADESA_MODE = os.getenv("REKADESA_MODE", "demo").lower()
if REKADESA_MODE not in {"demo", "production"}:
    raise RuntimeError("REKADESA_MODE harus demo atau production")
PRODUCTION_MODE = REKADESA_MODE == "production"

# Default ke SQLite untuk demo lokal / evaluasi juri yang instan & zero-config.
# Untuk produksi, set DATABASE_URL (misal: mysql+pymysql://user:pass@host/rekadesa).
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rekadesa.db")
if PRODUCTION_MODE and not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL wajib di mode production")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
    # Quick sanity check connection
    with engine.connect() as conn:
        pass
except Exception:
    if PRODUCTION_MODE:
        logger.error("[DB] Koneksi database production gagal; startup dibatalkan.")
        raise RuntimeError("Koneksi database production gagal") from None
    logger.warning("[DB] Koneksi database demo gagal; beralih ke SQLite lokal.")
    DATABASE_URL = "sqlite:///./rekadesa.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
