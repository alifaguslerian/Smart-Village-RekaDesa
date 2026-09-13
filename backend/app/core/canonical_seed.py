"""
Canonical 8 program — reverse-engineered agar Air Bersih Dusun II = 92.0 exact.

Derivasi:
- PA 96.0 = (187-43)/(193-43)*100  → min 43 (Beasiswa), max 193 (Drainase)
- CE 90.0 = (187/90jt - 80/150jt)/(90/40jt - 80/150jt)*100 ≈ 89.97 → 90.0
          → min ratio 80/150jt (Jalan Tani), max 90/40jt (PHBS)
- DI 90.0 = (100 + 187/234*100)/2 = (100+79.91)/2 = 89.96 → 90.0
- Gap 93 = 100-7, Urgency 88 langsung.

Jangan ubah angka tanpa re-validate test_tuned_seed.py.
"""
from app.core.scoring import ProgramInput

CANONICAL_PROGRAMS: list[ProgramInput] = [
    ProgramInput(name="Air Bersih Dusun II", biaya=90_000_000, jumlah_penerima=187, urgency=88, di_kategori="Tinggi", skor_idm_dimensi=7, total_kebutuhan_dimensi=234),
    ProgramInput(name="Beasiswa Anak Kurang Mampu", biaya=75_000_000, jumlah_penerima=43, urgency=80, di_kategori="Tinggi", skor_idm_dimensi=35, total_kebutuhan_dimensi=60),
    ProgramInput(name="Perbaikan Drainase Lingkungan", biaya=155_000_000, jumlah_penerima=193, urgency=75, di_kategori="Sedang", skor_idm_dimensi=25, total_kebutuhan_dimensi=280),
    ProgramInput(name="Jalan Usaha Tani Dusun I", biaya=150_000_000, jumlah_penerima=80, urgency=65, di_kategori="Sedang", skor_idm_dimensi=45, total_kebutuhan_dimensi=300),
    ProgramInput(name="Penyuluhan PHBS & Sanitasi", biaya=40_000_000, jumlah_penerima=90, urgency=55, di_kategori="Rendah", skor_idm_dimensi=60, total_kebutuhan_dimensi=200),
    ProgramInput(name="Rehabilitasi Posyandu Balita", biaya=120_000_000, jumlah_penerima=110, urgency=72, di_kategori="Tinggi", skor_idm_dimensi=30, total_kebutuhan_dimensi=150),
    ProgramInput(name="Pelatihan UMKM Olahan Pangan", biaya=70_000_000, jumlah_penerima=65, urgency=58, di_kategori="Sedang", skor_idm_dimensi=55, total_kebutuhan_dimensi=200),
    ProgramInput(name="Bank Sampah & Pengelolaan Limbah", biaya=100_000_000, jumlah_penerima=100, urgency=45, di_kategori="Rendah", skor_idm_dimensi=50, total_kebutuhan_dimensi=180),
]

# Metadata untuk seed DB nanti (kategori UI + dimensi terkait)
CANONICAL_META = {
    "Air Bersih Dusun II": ("Air & Sanitasi", "Akses Air Bersih"),
    "Beasiswa Anak Kurang Mampu": ("Pendidikan", "Pendidikan"),
    "Perbaikan Drainase Lingkungan": ("Lingkungan", "Lingkungan"),
    "Jalan Usaha Tani Dusun I": ("Infrastruktur", "Infrastruktur"),
    "Penyuluhan PHBS & Sanitasi": ("Kesehatan", "Kesehatan"),
    "Rehabilitasi Posyandu Balita": ("Kesehatan", "Kesehatan"),
    "Pelatihan UMKM Olahan Pangan": ("Ekonomi", "Ekonomi"),
    "Bank Sampah & Pengelolaan Limbah": ("Lingkungan", "Lingkungan"),
}
