# Arsitektur RekaDesa — kondisi saat ini

```
Usulan warga / hasil Musdus masuk sebagai pending
  → operator memeriksa sumber, RAB, jangkauan, urgensi, dan kondisi bidang
  → usulan disetujui menjadi kandidat program; penolakan tetap tercatat
  → pagu dicatat bersama tahun, sumber dokumen, dan nama pemeriksa
  → FastAPI + SQLAlchemy (SQLite demo / DATABASE_URL produksi)
  → scoring deterministik 5 komponen, bobot 30/25/20/15/10
  → Priority Score dan rincian kontribusi
  → 0/1 Knapsack DP, biaya ceil ke unit Rp1 juta
  → rekomendasi, usulan belum terpilih, sisa pagu, empat preset
  → dashboard internal / portal warga terpisah di /public/:village_id
  → keputusan akhir melalui musyawarah Kepala Desa dan BPD
```

Scoring dan DP tidak memakai AI. Kotak *Narrative Layer* pada frontend saat ini memakai template teks demo yang mengikuti data program; belum ada layanan AI dinamis. Skor contoh Air Bersih Dusun II tetap 92,00. Optimalitas alokasi berlaku pada model biaya diskret Rp1 juta, bukan pada tiap rupiah. Program tanpa penerima, biaya nonpositif, dan nilai urgensi/IDM di luar 0–100 ditolak.

`REKADESA_MODE=demo` adalah default lokal: SQLite tersedia tanpa konfigurasi dan fallback SQLite diizinkan jika koneksi database demo gagal. Seed contoh hanya dibuat bila database demo kosong. `REKADESA_MODE=production` mewajibkan `DATABASE_URL` dan `OPERATOR_API_KEY` acak minimal 32 karakter; koneksi database gagal membatalkan startup dan database kosong tidak otomatis diisi contoh. Jangan menaruh nilai kunci di kode atau materi presentasi; layani mode production melalui HTTPS.

Di mode production, `X-Operator-Key` diwajibkan untuk alokasi, preset, daftar program mentah, dan rincian program tunggal. Endpoint desa dan skor untuk portal warga tetap terbuka dan baca saja. Dashboard meminta kunci operator melalui form sederhana dan menyimpannya hanya pada sesi browser. Ini adalah kontrol akses minimal, belum sistem akun/peran atau audit riwayat perubahan.

Form `/submit/:village_id` menulis ke tabel `proposal_submissions` melalui endpoint publik. Data baru tidak pernah langsung masuk scoring. Operator harus memberi keputusan dan, jika menyetujui, melengkapi biaya RAB serta seluruh input penilaian. Sistem menyimpan pengusul, sumber awal, pemeriksa, catatan, waktu, status, dan ID program hasil persetujuan. Endpoint daftar dan pemeriksaan usulan memerlukan kunci operator pada mode production. Pengiriman publik dibatasi 10 request per menit per IP pada satu proses.

Tabel `budget_records` menyimpan pagu per desa, tahun, sumber dokumen, status verifikasi, dan pemeriksa. Alokasi yang melebihi nilai ini ditolak dan preset yang lebih besar tidak ditampilkan. Verifikasi ini adalah jejak pemeriksaan manusia; RekaDesa tidak terhubung ke rekening, pencairan pusat, atau sistem keuangan pemerintah.

Pagu simulasi dibatasi sampai Rp1 miliar dan unit DP dikunci Rp1 juta. Endpoint alokasi dibatasi 30 request per menit per IP pada satu proses; request tanpa kunci yang sah tidak menghabiskan kuota operator. Bila sistem dipublikasikan dengan beberapa proses atau proxy, pembatasan laju harus dikelola di lapisan deployment. Origin CORS frontend dapat diatur melalui `FRONTEND_ORIGINS` (daftar dipisah koma).
