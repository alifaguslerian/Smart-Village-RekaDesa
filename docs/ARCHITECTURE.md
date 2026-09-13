# Architecture — RekaDesa

**Phase 0/0b — akan diperluas per phase.**

## Saat ini

```
Usulan warga + IDM
        ↓
Scoring Engine (deterministik, 5 komponen, fallback 50)
        ↓
Priority Score 0–100
        ↓
(Phase 1) Allocation DP → kombinasi optimal
        ↓
(Phase 1b) API (FastAPI + SQLAlchemy)
        ↓
(Phase 2/3) Frontend: single-scroll golden path + /public/:id
        ↓
Keputusan: Kepala Desa/BPD (manusia)
```

- Weights config-driven (`backend/app/core/config.py` — `ScoringWeights`), tapi default fixed di demo.
- MySQL primary (rencana), SQLite fallback via `DATABASE_URL` (safety net).

_Dokumen ini akan di-update di Phase 2 (saat alur 5 tahap lengkap) & Phase 3 (label Deterministic vs AI)._
