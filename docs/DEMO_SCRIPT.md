# Skrip demo RekaDesa — draft 3 menit

Rekam pada mode demo lokal dengan `npm run dev`. Gunakan Desa Suka Maju sebagai **dataset simulasi**. Jangan menyebut RekaDesa sebagai pengganti Musyawarah Desa, sistem pencairan dana, atau alat yang menjamin input bebas manipulasi.

| Waktu | Aksi layar | Narasi yang dibacakan |
| --- | --- | --- |
| 00:00–00:20 | Tampilkan sampul dashboard dan lima tahap alur. | “Musrenbangdes harus memilih banyak kebutuhan dalam pagu terbatas. RekaDesa adalah sistem pendukung keputusan yang mencatat usulan, memeriksa datanya, menghitung prioritas secara terbuka, lalu mencari kombinasi program terbaik tanpa melampaui anggaran.” |
| 00:20–00:42 | Buka `/submit/1`; sorot masalah, warga terdampak, pengusul, dan sumber data. | “Usulan warga atau hasil Musdus masuk melalui form ini. Usulan belum memperoleh skor dan belum dianggap benar. Sistem menyimpannya sebagai data yang menunggu pemeriksaan.” |
| 00:42–01:02 | Kembali ke dashboard, sorot bagian Data Masuk dan kartu pagu. | “Operator mencocokkan sumber, RAB, jumlah penerima, urgensi, serta kondisi bidang. Hanya usulan yang disetujui menjadi kandidat program. Pagu juga dicatat bersama tahun dan sumber dokumennya, sehingga simulasi tidak dapat melebihi dana yang tersedia.” |
| 01:02–01:27 | Profil desa; sorot skor air bersih 7 dan gap 93. | “Pada dataset simulasi Desa Suka Maju, indikator air bersih bernilai 7 dari 100, sehingga kesenjangannya 93. Angka ini harus berasal dari data resmi dan verifikasi lapangan; RekaDesa tidak menciptakan datanya sendiri.” |
| 01:27–01:55 | Simulator Rp500 juta; sorot dana terserap, sisa, program terpilih, dan Why NOT. | “Lima komponen berbobot 30, 25, 20, 15, dan 10 persen menghasilkan skor prioritas. Knapsack 0/1 kemudian mencari kombinasi dengan total manfaat tertinggi pada unit biaya satu juta rupiah. Program yang belum masuk tetap terlihat beserta alasan komputasionalnya.” |
| 01:55–02:20 | Pilih Air Bersih Dusun II; tampilkan lima kontribusi dan skor 92,00. | “Air Bersih Dusun II memperoleh 92 poin. Kontribusi setiap komponen dapat diperiksa dan dijumlahkan ulang. Ranking dan alokasi sepenuhnya deterministik; narasi hanya menjelaskan hasil, bukan mengambil keputusan.” |
| 02:20–02:38 | Sorot perbandingan preset di kanan. | “Perangkat desa dapat membandingkan beberapa skenario yang masih berada di bawah pagu tercatat. Saat anggaran berubah, kombinasi program dan jangkauan penerima ikut dihitung ulang.” |
| 02:38–03:00 | Buka `/public/1`; sorot daftar prioritas dan batas kewenangan. | “Warga melihat halaman terpisah yang hanya menampilkan urutan dan dasar penilaian. RekaDesa memberi rekomendasi yang bisa diaudit. Keputusan APBDes tetap ditetapkan melalui Musyawarah Desa bersama Kepala Desa dan BPD.” |

Sebelum merekam, jalankan tes, pastikan seed menampilkan skor 92,00, dan kosongkan usulan percobaan yang tidak ingin tampil. Jangan melakukan persetujuan usulan secara langsung saat rekaman; tampilkan alurnya agar demo tetap aman di bawah tiga menit.
