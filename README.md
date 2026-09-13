# RekaDesa — APHACKATON 2026 (Smart Village)

Sistem pendukung keputusan untuk **prioritas & alokasi anggaran pembangunan desa** yang transparan & terukur.

> Golden path: kondisi desa → gap → usulan → Priority Score → alokasi optimal → alasan → bandingkan skenario → dampak.

## Status

**Phase 0/0b selesai** — scoring engine deterministik + seed 8 program (valid: Air Bersih Dusun II = **92.0**). Backend & frontend menyusul per phase.

## Cara Jalankan (Phase 0)

```bash
# 1) install
pip install -r backend/requirements.txt

# 2) test — wajib hijau sebelum lanjut phase
PYTHONPATH=backend pytest backend/tests/test_tuned_seed.py -v
# harap: 3 passed (27.9/24.0/17.6/13.5/9.0 → 92.0)

# 3) cek manual
PYTHONPATH=backend python -c "from app.core.canonical_seed import CANONICAL_PROGRAMS; from app.core.scoring import score_all_programs; s=score_all_programs(CANONICAL_PROGRAMS); air=[x for x in s if x.name=='Air Bersih Dusun II'][0]; print([round(v,1) for v in air.contributions.values()], round(air.priority_score,1))"
```

> Catatan Windows PowerShell: `set PYTHONPATH=backend` kalau pakai CMD. `$env:PYTHONPATH="backend"` untuk PowerShell — set tiap buka terminal baru.

## Struktur

```
backend/app/core/
  config.py          # weights 30/25/20/15/10 (config-driven, default fixed di demo)
  scoring.py         # 5 komponen deterministik, fallback min_max → 50 netral
  canonical_seed.py  # 8 program canonical (single source of truth)
backend/tests/
  test_tuned_seed.py # assert per-komponen 92.0 (anti-canceling bug)
docs/
  FORMULA.md         # formula & design parameters
  ARCHITECTURE.md    # alur sistem (menyusul Phase 2)
  DEMO_SCRIPT.md     # skrip 3 menit (menyusul Phase 3)
```

## Aturan

- Bobot **30/25/20/15/10** fixed sepanjang demo (tapi config-driven — bisa diubah di code).
- DP bukan greedy. Preset diskrit 4 titik. AI hanya narrative layer.

_Dokumen ini akan di-update tiap phase. Detail strategi internal tidak di-push._
