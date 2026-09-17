# Formula — RekaDesa (Phase 1b)

Semua komponen dinormalisasi 0–100 sebelum × bobot. Bobot default **30/25/20/15/10** (config-driven, dapat dikonfigurasi — tapi fixed sepanjang demo).

## Komponen

| Komponen | Bobot | Formula |
|---|---|---|
| Development Gap | 30% | `100 - skor_IDM` (input IDM di luar 0–100 ditolak) |
| People Affected | 25% | `min_max_normalize(jumlah_penerima)` relatif ke kandidat periode sama |
| Urgency | 20% | nilai input 0–100; di luar rentang ditolak. Anchor (0–39 rendah, 40–69 sedang, 70–89 tinggi, 90–100 darurat) adalah panduan |
| Development Impact | 15% | `(kategori + cakupan)/2`, kategori Rendah=33 Sedang=67 Tinggi=100 (**design parameter**), cakupan=`clamp(penerima/total_kebutuhan*100,0,100)`; kategori tidak dikenal ditolak |
| Cost Efficiency | 10% | `min_max_normalize(penerima/biaya)` relatif; biaya dan penerima harus positif |

`min_max = (x-min)/(max-min)*100`, fallback **50** netral kalau `max==min`.
Usulan dengan nol penerima ditolak; fallback 50 hanya berlaku saat semua kandidat valid memiliki nilai sama.

People Affected vs DI-cakupan beda denominator (reach vs depth) — bukan double counting.

## Alokasi (Knapsack)

- `weight = ceil(biaya / 1_000_000)` — **ceil** agar 10.4jt → 11 unit, tidak pernah overspend di kasus desimal.
- `value = round(score*10)`, `capacity = budget // 1_000_000`, `O(n×capacity)` instant untuk n=8.
- Output: `selected` + `unselected` + `total_cost` + `remaining_budget = budget - total_cost`.
- Preset diskrit 300/500/750/1000 jt precompute (`allocate_presets`), monotonic score.

## Worked Example (validasi)

**Air Bersih Dusun II:** Gap 93×30%=27.9, PA 96×25%=24.0, Urgency 88×20%=17.6, DI 90×15%=13.5, CE 90×10%=9.0 → **92.0/100**

> `PA 96 = (187-43)/(193-43)*100`, `CE 90 ≈ (187/90jt - 80/150jt)/(90/40jt - 80/150jt)*100`, `DI 90 = (100+79.91)/2` — semua sudah assert per-komponen + e2e via JSON `/scored` & `/programs/:id`.

_33/67/100 & anchor urgency adalah design parameter — disebutkan eksplisit di sini._
