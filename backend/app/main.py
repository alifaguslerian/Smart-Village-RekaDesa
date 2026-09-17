from contextlib import asynccontextmanager
import os
import hmac
import time
from collections import defaultdict, deque
from threading import Lock
from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.db.session import Base, engine, PRODUCTION_MODE
from app.db.seed import seed
from app.api.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    if PRODUCTION_MODE and len(os.getenv("OPERATOR_API_KEY", "")) < 32:
        raise RuntimeError("OPERATOR_API_KEY mode production harus minimal 32 karakter")
    Base.metadata.create_all(bind=engine)
    from app.db.session import SessionLocal
    from app.models.village import Village
    db = SessionLocal()
    try:
        should_seed = not PRODUCTION_MODE and db.query(Village).count() == 0
    finally:
        db.close()
    if should_seed:
        seed()
    yield

app = FastAPI(title="RekaDesa API", version="0.1.0", lifespan=lifespan)

_allocation_calls = defaultdict(deque)
_allocation_lock = Lock()
_last_cleanup = 0.0

@app.middleware("http")
async def limit_allocation_calls(request: Request, call_next):
    global _last_cleanup
    if request.url.path == "/api/allocate":
        if PRODUCTION_MODE and not hmac.compare_digest(request.headers.get("X-Operator-Key", ""), os.getenv("OPERATOR_API_KEY", "")):
            return await call_next(request)
        client = request.client.host if request.client else "unknown"
        now = time.monotonic()
        with _allocation_lock:
            if now - _last_cleanup > 60:
                for old_client, old_calls in list(_allocation_calls.items()):
                    if not old_calls or now - old_calls[-1] > 60:
                        del _allocation_calls[old_client]
                _last_cleanup = now
            calls = _allocation_calls[client]
            while calls and now - calls[0] > 60:
                calls.popleft()
            if len(calls) >= 30:
                return JSONResponse({"detail": "Terlalu banyak simulasi; coba lagi sebentar."}, status_code=429, headers={"Retry-After": "60"})
            calls.append(now)
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),
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
