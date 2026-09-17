import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchVillage, fetchScoredPrograms } from '../api/client';
import type { Village, ScoredProgram } from '../types';
import { Landmark, ShieldAlert, ArrowLeft } from 'lucide-react';

export const PublicPortal: React.FC = () => {
  const { village_id } = useParams<{ village_id: string }>();
  const vid = Number(village_id);

  const [village, setVillage] = useState<Village | null>(null);
  const [programs, setPrograms] = useState<ScoredProgram[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!Number.isSafeInteger(vid) || vid <= 0) {
        setError('ID desa tidak valid.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [vData, pData] = await Promise.all([
          fetchVillage(vid),
          fetchScoredPrograms(vid),
        ]);
        setVillage(vData);
        // Urutkan berdasarkan skor prioritas tertinggi
        const sorted = [...pData].sort((a, b) => b.priority_score - a.priority_score);
        setPrograms(sorted);
      } catch (err) {
        console.error('Failed to load public portal data:', err);
        setError('Data desa belum dapat dimuat. Periksa koneksi lalu coba lagi.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [vid]);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] flex items-center justify-center p-4">
        <div className="text-center text-stone-600 space-y-2">
          <div className="w-8 h-8 border-3 border-teal-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium font-mono">Memuat Portal Transparansi Desa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div role="alert" className="min-h-screen bg-[#fdfcf8] flex flex-col items-center justify-center gap-3 p-6 text-stone-800">
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="text-teal-800 font-bold underline">Coba lagi</button>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-stone-900 pb-16">
      {/* Top Banner Dwi-Warna / Stempel Publik */}
      <header className="bg-white border-b border-stone-300 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-bold text-lg text-stone-900 leading-tight">Portal Transparansi Warga</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  Publik • Read-Only
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Pemerintah {village?.name || 'Desa'}, {village?.kecamatan}, {village?.kabupaten}
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex self-start items-center text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-md border border-stone-300"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Mode Internal Pemdes</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* BANNER WAJIB PROPOSAL: REKOMENDASI SISTEM BUKAN KEPUTUSAN FINAL */}
        <div className="p-4 bg-amber-50 border-l-4 border-amber-600 mb-6 flex items-start space-x-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h2 className="font-bold text-amber-950 uppercase tracking-wider text-xs">
              Pemberitahuan Transparansi Publik Dana Desa
            </h2>
            <p className="mt-1 leading-relaxed text-amber-900">
              Hasil ini merupakan rekomendasi deterministik dari data simulasi, bukan keputusan final. Penetapan APBDes tetap melalui Musyawarah Desa bersama Kepala Desa dan BPD.
            </p>
          </div>
        </div>

        {/* Ringkasan Status Desa */}
        <div className="bg-white border-y border-stone-300 mb-8">
          <h3 className="px-3 pt-3 text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            Kondisi Desa pada Dataset Simulasi (Indikator IDM)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-stone-200 text-center">
            <div className="p-3">
              <div className="text-[10px] text-stone-500 uppercase">Indeks Sosial</div>
              <div className="text-xl font-bold font-mono text-stone-900 mt-0.5">{village?.skor_sosial.toFixed(1)}</div>
            </div>
            <div className="p-3">
              <div className="text-[10px] text-stone-500 uppercase">Indeks Ekonomi</div>
              <div className="text-xl font-bold font-mono text-stone-900 mt-0.5">{village?.skor_ekonomi.toFixed(1)}</div>
            </div>
            <div className="p-3">
              <div className="text-[10px] text-stone-500 uppercase">Indeks Lingkungan</div>
              <div className="text-xl font-bold font-mono text-stone-900 mt-0.5">{village?.skor_lingkungan.toFixed(1)}</div>
            </div>
            <div className="bg-amber-50 p-3">
              <div className="text-[10px] text-amber-800 font-bold uppercase">Air Bersih (IDM)</div>
              <div className="text-xl font-bold font-mono text-amber-950 mt-0.5">{village?.skor_idm_air_bersih.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Daftar Rekomendasi Program untuk Warga */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Daftar Usulan Program Berdasarkan Urutan Prioritas
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Dihitung dari kesenjangan desa, jumlah warga yang tertolong, kedaruratan, dan efisiensi biaya.
              </p>
            </div>
            <span className="text-xs font-mono bg-stone-100 px-2.5 py-1 rounded border border-stone-300 text-stone-700">
              Total {programs.length} Program
            </span>
          </div>

          <div className="border-y border-stone-300 divide-y divide-stone-200 bg-white">
            {programs.map((prog, idx) => {
              const isTop = idx === 0;
              return (
                <article key={prog.id} className={isTop ? 'bg-amber-50/50' : ''}>
                  <div className="grid grid-cols-[28px_1fr_auto] sm:grid-cols-[32px_1fr_150px_80px] items-center gap-3 px-3 py-4">
                    <span className="font-mono text-xs text-stone-400">{String(idx + 1).padStart(2, '0')}</span>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{prog.name}</h4>
                      <p className="text-[11px] text-stone-500">{prog.kategori} · {prog.jumlah_penerima} warga · urgensi {prog.breakdown.urgency.toFixed(0)}</p>
                    </div>
                    <span className="hidden sm:block text-right font-mono text-xs text-stone-600">{formatRupiah(prog.biaya)}</span>
                    <span className="text-right font-mono font-bold text-teal-900">{prog.priority_score.toFixed(1)}</span>
                  </div>
                  {isTop && (
                    <div className="border-t border-amber-200 px-3 py-2.5 text-xs text-amber-950">
                      <strong>Prioritas pertama:</strong> skor tertinggi dari lima komponen, termasuk kesenjangan {prog.breakdown.development_gap.toFixed(1)}/100 dan jangkauan {prog.jumlah_penerima} warga.
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        {/* Footer Audit Transparan */}
        <footer className="pt-6 border-t border-stone-300 text-center text-xs text-stone-500">
          <p>
            RekaDesa — Sistem Pendukung Keputusan Pembangunan Desa Transparan & Terukur.
          </p>
          <p className="mt-1 text-[11px] text-stone-400 font-mono">
            Rumus perhitungan terbuka; kebenaran data usulan tetap perlu diverifikasi warga dan BPD.
          </p>
        </footer>
      </main>
    </div>
  );
};
