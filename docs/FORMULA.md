# Formula — RekaDesa (Phase 0)

Semua komponen dinormalisasi 0–100 sebelum × bobot. Bobot default **30/25/20/15/10** (config-driven, dapat dikonfigurasi — tapi fixed sepanjang demo).

## Komponen

| Komponen | Bobot | Formula |
|---|---|---|
| Development Gap | 30% | `100 - skor_IDM_subdimensi` |
| People Affected | 25% | `min_max_normalize(jumlah_penerima)` relatif ke kandidat periode sama |
| Urgency | 20% | input 0–100 bebas + anchor deskriptif (0–39 rendah, 40–69 sedang, 70–89 tinggi, 90–100 darurat) |
| Development Impact | 15% | `(kategori + cakupan)/2`, kategori Rendah=33 Sedang=67 Tinggi=100 (**design parameter**), cakupan=`penerima/total_kebutuhan*100` |
| Cost Efficiency | 10% | `min_max_normalize(penerima/biaya)` relatif |

`min_max = (x-min)/(max-min)*100`, fallback **50** netral kalau `max==min` (metrik tidak membedakan → 50 jujur, bukan 100).

People Affected vs DI-cakupan beda denominator (reach vs depth) — bukan double counting.

## Worked Example (validasi)

**Air Bersih Dusun II:** Gap 93×30%=27.9, PA 96×25%=24.0, Urgency 88×20%=17.6, DI 90×15%=13.5, CE 90×10%=9.0 → **92.0/100**

> `PA 96 = (187-43)/(193-43)*100`, `CE 90 ≈ (187/90jt - 80/150jt)/(90/40jt - 80/150jt)*100`, `DI 90 = (100+79.91)/2`

_Akan diperluas saat Phase 1 (knapsack) & Phase 2 (alur). 33/67/100 & anchor urgency adalah design parameter — disebutkan eksplisit di sini._
