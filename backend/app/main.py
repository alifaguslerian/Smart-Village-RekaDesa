from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import Base, engine
from app.db.seed import seed
from app.api.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    from app.db.session import SessionLocal
    from app.models.village import Village
    db = SessionLocal()
    try:
        if db.query(Village).count() == 0:
            db.close()
            seed()
        else:
            db.close()
    except Exception as e:
        print(f"[lifespan] seed check failed: {e}")
        try:
            db.close()
        except:
            pass
    yield

app = FastAPI(title="RekaDesa API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "service": "RekaDesa API"}

@app.get("/health")
def health():
    return {"status": "healthy"}
