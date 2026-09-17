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
  const [loading, setLoading] = useState(true);
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
        const [villageData, programData] = await Promise.all([
          fetchVillage(vid),
          fetchScoredPrograms(vid),
        ]);
        setVillage(villageData);
        setPrograms([...programData].sort((a, b) => b.priority_score - a.priority_score));
      } catch (loadError) {
        console.error('Failed to load public portal data:', loadError);
        setError('Data desa belum dapat dimuat. Periksa koneksi lalu coba lagi.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [vid]);

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);

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
    return (
      <div role="alert" className="min-h-screen bg-[#fdfcf8] flex flex-col items-center justify-center gap-3 p-6 text-stone-800">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="text-teal-800 font-bold underline">Coba lagi</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-stone-900 pb-16">
      <header className="bg-white border-t-[3px] border-t-teal-800 border-b border-b-stone-300 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-bold text-lg text-stone-900 leading-tight">Portal Transparansi Warga</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Publik · Hanya baca</span>
              </div>
              <p className="text-xs text-stone-500">Pemerintah {village?.name || 'Desa'} · {village?.kecamatan} · {village?.kabupaten}</p>
            </div>
          </div>
          <Link to="/" className="inline-flex self-start items-center text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-md border border-stone-300">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Dasbor Pemdes
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="order-2 lg:order-1 lg:col-span-2 min-w-0">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-800">Urutan terbuka</p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-stone-900">Prioritas usulan desa</h2>
                <p className="text-xs text-stone-500 mt-1">Diurutkan dari lima komponen penilaian yang dapat diperiksa.</p>
              </div>
              <span className="text-xs font-mono text-stone-500">{programs.length} PROGRAM</span>
            </div>

            <div className="border-y border-stone-300 divide-y divide-stone-200 bg-white">
              {programs.map((program, index) => {
                const isTop = index === 0;
                return (
                  <article key={program.id} className={isTop ? 'bg-amber-50/50' : ''}>
                    <div className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-4">
                      <span className="font-mono text-xs text-stone-400">{String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h3 className="font-bold text-stone-900 text-sm">{program.name}</h3>
                        <p className="text-[11px] text-stone-500">{program.kategori} · {program.jumlah_penerima} warga · urgensi {program.breakdown.urgency.toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <span className="hidden sm:block font-mono text-xs text-stone-500">{formatRupiah(program.biaya)}</span>
                        <span className="block mt-0.5 font-mono font-bold text-teal-900">{program.priority_score.toFixed(1)}</span>
                      </div>
                    </div>
                    {isTop && (
                      <div className="border-t border-amber-200 px-3 py-2.5 text-xs text-amber-950">
                        <strong>Prioritas pertama:</strong> skor tertinggi dari lima komponen, termasuk kesenjangan {program.breakdown.development_gap.toFixed(1)}/100 dan jangkauan {program.jumlah_penerima} warga.
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-6 space-y-5">
            <div className="p-4 bg-amber-50 border-l-4 border-amber-600 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h2 className="font-bold text-amber-950 uppercase tracking-wider">Batas kewenangan</h2>
                <p className="mt-1 leading-relaxed text-amber-900">Hasil ini berasal dari perhitungan data simulasi, bukan keputusan final. Penetapan APBDes tetap melalui Musyawarah Desa bersama Kepala Desa dan BPD.</p>
              </div>
            </div>

            <div className="bg-white border border-stone-300">
              <h2 className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">Kondisi pada dataset simulasi</h2>
              <dl className="divide-y divide-stone-200 text-xs">
                {[
                  ['Indeks sosial', village?.skor_sosial],
                  ['Indeks ekonomi', village?.skor_ekonomi],
                  ['Indeks lingkungan', village?.skor_lingkungan],
                  ['Air bersih (IDM)', village?.skor_idm_air_bersih],
                ].map(([label, value], index) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-3 ${index === 3 ? 'bg-amber-50 text-amber-950' : ''}`}>
                    <dt>{label}</dt>
                    <dd className="font-mono text-base font-bold">{typeof value === 'number' ? value.toFixed(1) : '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="border-t border-stone-300 pt-3 text-[10px] font-mono leading-relaxed text-stone-500">
              Rumus terbuka · validitas data perlu diverifikasi warga dan BPD
            </p>
          </aside>
        </div>

        <footer className="mt-10 pt-5 border-t border-stone-300 text-center text-xs text-stone-500">
          RekaDesa · Sistem Pendukung Keputusan Pembangunan Desa
        </footer>
      </main>
    </div>
  );
};
