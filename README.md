# RekaDesa — APHACKATON 2026 (Smart Village)

Sistem pendukung keputusan untuk **prioritas & alokasi anggaran pembangunan desa** yang transparan & terukur.

> Golden path: kondisi desa → gap → usulan → Priority Score → alokasi optimal → alasan → bandingkan skenario → dampak.

## Status

**Phase 0, 0b, 1, 1b selesai** — scoring deterministik + DP allocation + FastAPI + seed 8 program (valid: Air Bersih Dusun II = **92.0** per-komponen + e2e via API ✅ 11/11 tests). Frontend menyusul Phase 2.

## Cara Jalankan

### Backend only (Phase 0-1 tanpa DB)

```bash
pip install -r backend/requirements.txt
PYTHONPATH=backend pytest backend/tests/test_tuned_seed.py backend/tests/test_allocation.py -v
# 10 passed (canonical 92.0 + DP + ceil edge)
```

### Backend + DB (Phase 1b — SQLite fallback, tanpa Docker)

```powershell
pip install -r backend/requirements.txt

# PowerShell (Windows):
$env:PYTHONPATH="backend"; $env:DATABASE_URL="sqlite:///./rekadesa.db"
python -m app.db.seed
python -m pytest backend/tests -v          # 11 passed (tambah e2e 92.0 via /scored & /programs/:id)
python -m uvicorn app.main:app --reload --port 8000
# buka http://localhost:8000/docs — coba GET /api/villages/1/scored → Air Bersih 92.0
```

> `DATABASE_URL` default MySQL (`mysql+pymysql://rekadesa:rekadesa123@localhost:3306/rekadesa`). SQLite fallback hanya safety net hari H via env var — memanfaatkan abstraksi SQLAlchemy, **primary tetap MySQL** (via `docker compose up` kalau ada).

```bash
# CMD:
set PYTHONPATH=backend && set DATABASE_URL=sqlite:///./rekadesa.db && python -m pytest backend/tests -v
```

## Struktur

```
backend/app/core/
  config.py          # weights 30/25/20/15/10 (config-driven, default fixed)
  scoring.py         # 5 komponen + clamp/fallback, fallback min_max 50 netral
  allocation.py      # DP 0/1 knapsack, unit Rp1jt (ceil), remaining+unselected
  canonical_seed.py  # 8 program canonical (single source, PA 96 / CE 90 exact)
backend/app/{db,models,api,schemas}  # Session (MySQL/SQLite), Village/Program, routes, schemas
backend/tests/
  test_tuned_seed.py # 92.0 per-komponen 27.9/24.0/17.6/13.5/9.0
  test_allocation.py # DP vs brute, 4 preset, ceil edge 10.4jt
  test_api_e2e.py    # e2e via /scored & /programs/:id + remaining/unselected
docs/
  FORMULA.md         # formula & design params
  ARCHITECTURE.md    # alur (menyusul Phase 2)
  DEMO_SCRIPT.md     # skrip 3 menit (menyusul Phase 3)
```

## Aturan

- Bobot **30/25/20/15/10** fixed di demo (config-driven).
- DP bukan greedy. Unit Rp1jt (ceil, anti-overspend). Preset diskrit 4 titik. AI hanya narrative layer.
- Label UI pisah: `Priority Engine — Deterministic` vs `AI Explanation` (Phase 2/3).

_Dokumen ini akan di-update tiap phase. Strategi internal tidak di-push._
