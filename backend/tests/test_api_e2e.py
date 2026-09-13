"""
Phase 1b e2e — hit endpoint beneran, assert 92.0 via JSON (bukan cuma unit test).
Cek DB → JSON rounding tidak kepotong.
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import tempfile
from fastapi.testclient import TestClient

def _client_with_temp_db():
    # temp SQLite biar tidak bentrok dengan file rekadesa.db
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
    tmp.close()
    db_url = f"sqlite:///{tmp.name}"
    os.environ["DATABASE_URL"] = db_url
    # reload session/engine dengan env baru
    import importlib
    import app.db.session as sess
    importlib.reload(sess)
    # rebind Base + seed
    from app.db.session import Base, engine, SessionLocal
    # need to recreate engine with new URL — reload already did
    # re-import models to bind to new Base
    import app.models.village  # noqa
    import app.models.program  # noqa
    Base.metadata.create_all(bind=engine)
    from app.db.seed import seed
    seed()
    # build app
    import app.main as main_mod
    importlib.reload(main_mod)
    return TestClient(main_mod.app), tmp.name

def test_e2e_92_via_scored_and_program():
    client, db_path = _client_with_temp_db()
    try:
        # GET /api/villages
        villages = client.get("/api/villages").json()
        assert len(villages) >= 1
        vid = villages[0]["id"]

        # GET /api/villages/{id}/scored — cek Air Bersih 92.0 per-komponen via JSON
        scored = client.get(f"/api/villages/{vid}/scored").json()
        air = next(p for p in scored if p["name"] == "Air Bersih Dusun II")
        assert round(air["breakdown"]["development_gap"], 1) == 93.0
        assert round(air["contributions"]["development_gap"], 1) == 27.9
        assert round(air["breakdown"]["people_affected"], 1) == 96.0
        assert round(air["contributions"]["people_affected"], 1) == 24.0
        assert round(air["breakdown"]["urgency"], 1) == 88.0
        assert round(air["contributions"]["urgency"], 1) == 17.6
        assert round(air["breakdown"]["development_impact"], 1) == 90.0
        assert round(air["contributions"]["development_impact"], 1) == 13.5
        assert round(air["breakdown"]["cost_efficiency"], 1) == 90.0
        assert round(air["contributions"]["cost_efficiency"], 1) == 9.0
        assert round(air["priority_score"], 1) == 92.0

        # GET /api/programs/{id} — jalur kedua
        prog = client.get(f"/api/programs/{air['id']}").json()
        assert round(prog["priority_score"], 1) == 92.0
        assert round(prog["contributions"]["development_gap"], 1) == 27.9

        # POST /allocate — remaining & unselected
        alloc = client.post("/api/allocate", json={"village_id": vid, "budget": 500_000_000}).json()
        assert alloc["remaining_budget"] == alloc["budget"] - alloc["total_cost"]
        assert len(alloc["selected"]) + len(alloc["unselected"]) == len(scored)
        assert alloc["total_cost"] <= alloc["budget"]

        # GET /presets
        presets = client.get(f"/api/villages/{vid}/presets").json()
        assert set(presets.keys()) == {"300000000", "500000000", "750000000", "1000000000"}
        for v in presets.values():
            assert v["remaining_budget"] == v["budget"] - v["total_cost"]
    finally:
        try:
            os.unlink(db_path)
        except:
            pass
