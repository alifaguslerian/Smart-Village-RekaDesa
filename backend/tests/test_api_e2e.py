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

def test_e2e_92_via_scored_and_program(monkeypatch):
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
        for invalid_budget in (-1, 1_000_000_001):
            assert client.post("/api/allocate", json={"village_id": vid, "budget": invalid_budget}).status_code == 422

        # GET /presets
        presets = client.get(f"/api/villages/{vid}/presets").json()
        assert set(presets.keys()) == {"300000000", "500000000", "750000000", "1000000000"}
        for v in presets.values():
            assert v["remaining_budget"] == v["budget"] - v["total_cost"]

        # Alur usulan: warga mengirim -> operator memeriksa -> baru masuk scoring.
        before_count = len(scored)
        submitted = client.post(f"/api/villages/{vid}/proposals", json={
            "name": "Perbaikan Jembatan Dusun III",
            "kategori": "Infrastruktur",
            "lokasi": "Dusun III",
            "masalah": "Jembatan rusak menghambat akses warga menuju kebun dan sekolah.",
            "jumlah_penerima": 75,
            "alasan_urgensi": "Kerusakan bertambah saat hujan dan membahayakan pengguna.",
            "sumber_data": "Berita Acara Musdus III tanggal 10 Agustus 2026",
            "pengusul": "Perwakilan Dusun III",
        })
        assert submitted.status_code == 201
        proposal = submitted.json()
        assert proposal["status"] == "pending"
        assert len(client.get(f"/api/villages/{vid}/scored").json()) == before_count
        invalid_text = client.post(f"/api/villages/{vid}/proposals", json={
            "name": "     ",
            "kategori": "Infrastruktur",
            "lokasi": "Dusun III",
            "masalah": "              ",
            "jumlah_penerima": 75,
            "alasan_urgensi": "              ",
            "sumber_data": "   ",
            "pengusul": "   ",
        })
        assert invalid_text.status_code == 422

        reviewed = client.post(f"/api/proposals/{proposal['id']}/review", json={
            "decision": "approve",
            "reviewed_by": "Tim Verifikasi Desa",
            "catatan_review": "Data Musdus dan estimasi awal telah diperiksa.",
            "biaya": 60_000_000,
            "urgency": 78,
            "di_kategori": "Tinggi",
            "skor_idm_dimensi": 40,
            "total_kebutuhan_dimensi": 100,
            "dimensi_terkait": "Infrastruktur",
        })
        assert reviewed.status_code == 200
        assert reviewed.json()["status"] == "approved"
        assert len(client.get(f"/api/villages/{vid}/scored").json()) == before_count + 1
        assert client.post(f"/api/proposals/{proposal['id']}/review", json={
            "decision": "reject",
            "reviewed_by": "Tim Verifikasi Desa",
            "catatan_review": "Tidak boleh diperiksa dua kali.",
        }).status_code == 409

        rejected_submission = client.post(f"/api/villages/{vid}/proposals", json={
            "name": "Usulan Tanpa Bukti Lapangan",
            "kategori": "Infrastruktur",
            "lokasi": "Dusun I",
            "masalah": "Usulan perlu diperiksa karena bukti kondisi awal belum tersedia.",
            "jumlah_penerima": 20,
            "alasan_urgensi": "Pengusul meminta pembahasan pada Musyawarah Desa berikutnya.",
            "sumber_data": "Catatan awal pengusul",
            "pengusul": "Perwakilan Dusun I",
        }).json()
        rejected = client.post(f"/api/proposals/{rejected_submission['id']}/review", json={
            "decision": "reject",
            "reviewed_by": "Tim Verifikasi Desa",
            "catatan_review": "Bukti lapangan dan berita acara belum tersedia.",
        })
        assert rejected.status_code == 200
        assert rejected.json()["status"] == "rejected"
        assert len(client.get(f"/api/villages/{vid}/scored").json()) == before_count + 1

        # Pagu tercatat menjadi batas maksimum simulasi.
        budget = client.get(f"/api/villages/{vid}/budget").json()
        assert budget["amount"] == 1_000_000_000
        updated_budget = client.put(f"/api/villages/{vid}/budget", json={
            "fiscal_year": 2026,
            "amount": 300_000_000,
            "source": "Dokumen pagu simulasi yang telah diperiksa untuk pengujian.",
            "verified": True,
            "verified_by": "BPD Desa",
        })
        assert updated_budget.status_code == 200
        assert client.post("/api/allocate", json={"village_id": vid, "budget": 500_000_000}).status_code == 422
        assert set(client.get(f"/api/villages/{vid}/presets").json().keys()) == {"300000000"}

        with monkeypatch.context() as env:
            env.setenv("REKADESA_MODE", "production")
            env.setenv("OPERATOR_API_KEY", "test-secret-operator-key-32-characters")
            protected_proposal = client.post(f"/api/villages/{vid}/proposals", json={
                "name": "Penerangan Jalan Dusun I",
                "kategori": "Infrastruktur",
                "lokasi": "Dusun I",
                "masalah": "Jalur utama belum memiliki penerangan yang memadai pada malam hari.",
                "jumlah_penerima": 40,
                "alasan_urgensi": "Aktivitas malam dan keselamatan warga saat ini terganggu.",
                "sumber_data": "Berita Acara Musdus I",
                "pengusul": "Perwakilan Dusun I",
            }).json()
            assert client.get(f"/api/villages/{vid}/scored").status_code == 200
            assert client.get(f"/api/villages/{vid}/presets").status_code == 401
            assert client.get(f"/api/villages/{vid}/proposals").status_code == 401
            assert client.post(f"/api/proposals/{protected_proposal['id']}/review", json={
                "decision": "reject",
                "reviewed_by": "Tim Verifikasi",
                "catatan_review": "Sumber belum cukup.",
            }).status_code == 401
            assert client.put(f"/api/villages/{vid}/budget", json={
                "fiscal_year": 2026,
                "amount": 300_000_000,
                "source": "Dokumen pengujian mode produksi.",
                "verified": False,
                "verified_by": None,
            }).status_code == 401
            assert client.post("/api/allocate", json={"village_id": vid, "budget": 0}).status_code == 401
            assert client.post("/api/allocate", json={"village_id": vid, "budget": 0}, headers={"X-Operator-Key": "test-secret-operator-key-32-characters"}).status_code == 200
        statuses = [client.post("/api/allocate", json={"village_id": vid, "budget": 0}).status_code for _ in range(30)]
        assert 429 in statuses
    finally:
        try:
            os.unlink(db_path)
        except:
            pass
