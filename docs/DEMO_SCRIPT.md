# Skrip demo RekaDesa — draft 3 menit

Rekam pada mode demo lokal dengan `npm run dev`. Gunakan Desa Suka Maju sebagai **dataset simulasi**. Jangan menyebut template narasi sebagai hasil AI dinamis, dan jangan mengklaim rekomendasi sebagai keputusan APBDes final.

| Waktu | Aksi layar | Narasi yang dibacakan |
| --- | --- | --- |
| 00:00–00:25 | Judul RekaDesa, lalu dashboard internal. | “Dalam Musrenbangdes, usulan pembangunan harus dipilih di tengah anggaran terbatas. RekaDesa membantu perangkat desa dan warga melihat mengapa sebuah usulan diprioritaskan dan bagaimana pagu dibagi.” |
| 00:25–00:55 | Profil Desa; sorot skor air bersih 7 dan gap 93. | “Pada contoh Desa Suka Maju, indikator air bersih bernilai 7 dari 100. Sistem mengubahnya menjadi kesenjangan 93. Angka ini bukan data desa nyata; ini dataset simulasi untuk menunjukkan cara kerja.” |
| 00:55–01:25 | Simulator Rp500 juta; sorot program terpilih, belanja Rp495 juta dan sisa Rp5 juta. | “Lima komponen dengan bobot 30, 25, 20, 15, dan 10 persen menghasilkan skor prioritas. Knapsack 0/1 Dynamic Programming lalu mencari kombinasi dengan manfaat total tertinggi pada model biaya jutaan rupiah, tanpa melewati pagu. Pada Rp500 juta, enam program dipilih dengan belanja Rp495 juta.” |
| 01:25–01:50 | Pilih Air Bersih Dusun II; tampilkan rincian kontribusi dan skor 92,0. | “Air Bersih Dusun II mendapat 92 poin. Setiap kontribusi terlihat dan bisa dihitung ulang. Ranking dan alokasi ditentukan rumus deterministik; kotak narasi saat ini adalah template demo yang menerjemahkan angka, bukan AI yang mengambil keputusan.” |
| 01:50–02:10 | Buka ‘Program Cadangan / Belum Terpilih’; lihat alasan. | “Usulan yang belum masuk juga ditampilkan. Ada yang melebihi sisa pagu setelah kombinasi terpilih, dan ada yang tidak menjadi bagian dari kombinasi skor terbaik. Statusnya dapat berubah saat pagu berubah.” |
| 02:10–02:35 | Matriks empat preset; sorot Rp300 juta, Rp750 juta, Rp1 miliar. | “Perbandingan empat pagu membuat dampak perubahan dana langsung terlihat. Pada Rp300 juta belanja terpilih Rp275 juta; pada Rp750 juta Rp730 juta. Pagu Rp1 miliar dapat membiayai seluruh delapan usulan contoh dengan belanja Rp800 juta.” |
| 02:35–03:00 | Buka `/public/1`, sorot daftar prioritas dan banner rekomendasi. | “Warga punya halaman terpisah yang hanya menampilkan data dan alasan prioritas. Sistem tidak menggantikan musyawarah; keputusan akhir tetap pada Kepala Desa dan BPD. Transparansi rumus membantu mereka mempertanyakan angka input yang belum sesuai bukti lapangan.” |

Sebelum rekam: pastikan backend hidup, seed demo menampilkan skor 92,0, dan durasi pembacaan tetap di bawah tiga menit. Bagian ‘Why NOT’ perlu memperlihatkan alasan pada pagu yang sedang aktif.
