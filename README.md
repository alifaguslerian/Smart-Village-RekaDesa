# RekaDesa — APHACKATON 2026 (Smart Village)

Sistem pendukung keputusan untuk **prioritas & alokasi anggaran pembangunan desa** yang transparan & terukur.

> Golden path: kondisi desa → gap → usulan → Priority Score → alokasi optimal → alasan → bandingkan skenario → dampak.

## Status

**Phase 0–2 selesai** — scoring deterministik + DP allocation + FastAPI + dashboard React + portal warga. Seed 8 program adalah data simulasi (Air Bersih Dusun II = **92.0**). Tes backend saat ini **15/15 lulus**; skrip demo tiga menit tersedia sebagai draft Phase 3.

## Cara Jalankan (Super Cepat & Simple)

Cukup jalankan **1 perintah** saja untuk menyalakan Backend FastAPI + Frontend Vite sekaligus:

```bash
# Dari folder RakaDesa atau root workspace:
npm run dev
```

Atau di Windows, cukup **klik dua kali** file `start.bat`.

- **Dashboard Internal Pemdes**: [http://localhost:5173/](http://localhost:5173/)
- **Portal Transparansi Warga**: [http://localhost:5173/public/1](http://localhost:5173/public/1)
- **Dokumentasi API Swagger**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Perintah Tambahan (Opsional)

```bash
# Jalankan hanya backend
npm run dev:backend

# Jalankan hanya frontend
npm run dev:frontend

# Jalankan automated tests
npm run test
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
  ARCHITECTURE.md    # alur dan batas mode demo/production
  DEMO_SCRIPT.md     # draft skrip 3 menit Phase 3
```

## Aturan

- Bobot **30/25/20/15/10** fixed di demo (config-driven).
- DP bukan greedy. Unit Rp1jt (ceil, anti-overspend). Preset diskrit 4 titik. AI hanya narrative layer.
- Ranking/alokasi deterministik; Narrative Layer saat ini template demo, belum layanan AI dinamis.
- Mode lokal default `REKADESA_MODE=demo`. Mode `production` mewajibkan `DATABASE_URL` dan `OPERATOR_API_KEY`, tanpa fallback ke data demo. Detail ada di `docs/ARCHITECTURE.md`.

_Dokumen ini akan di-update tiap phase. Strategi internal tidak di-push._
