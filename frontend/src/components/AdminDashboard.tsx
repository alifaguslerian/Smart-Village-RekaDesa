import React, { useEffect, useRef, useState } from 'react';
import { Header } from './Header';
import { VillageProfile } from './VillageProfile';
import { ScenarioGenerator } from './ScenarioGenerator';
import { WhyThisPriority } from './WhyThisPriority';
import { BudgetComparison } from './BudgetComparison';
import { fetchVillage, fetchPresets, runAllocation, fetchScoredPrograms, ApiError, setOperatorKey, clearOperatorKey, hasOperatorKey } from '../api/client';
import type { Village, AllocationResult, PresetMap, ScoredProgram } from '../types';

export const AdminDashboard: React.FC = () => {
  const [village, setVillage] = useState<Village | null>(null);
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [presets, setPresets] = useState<PresetMap | null>(null);
  const [allPrograms, setAllPrograms] = useState<ScoredProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ScoredProgram | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allocating, setAllocating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [needsKey, setNeedsKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const requestId = useRef(0);

  // Inisialisasi data desa dan alokasi awal (default Rp 500 Juta)
  useEffect(() => {
    let alive = true;
    const initId = ++requestId.current;
    async function initData() {
      try {
        setLoading(true);
        setError(null);
        const [vData, pData, scoredList, initAlloc] = await Promise.all([
          fetchVillage(1),
          fetchPresets(1),
          fetchScoredPrograms(1),
          runAllocation(1, 500_000_000),
        ]);
        if (!alive) return;
        setVillage(vData);
        setPresets(pData);
        setAllPrograms(scoredList);
        if (initId === requestId.current) setAllocationResult(initAlloc);

        // Pilih program dengan skor tertinggi secara default (Air Bersih Dusun II = 92.0)
        if (scoredList.length > 0) {
          const topProg = [...scoredList].sort((a, b) => b.priority_score - a.priority_score)[0];
          setSelectedProgram(topProg);
        }
      } catch (err) {
        console.error('Failed to initialize dashboard:', err);
        if (!alive) return;
        if (err instanceof ApiError && err.status === 401) {
          setNeedsKey(true);
          setError('Masukkan kunci operator untuk membuka simulator internal.');
        } else {
          setError('Backend belum terhubung. Periksa layanan lalu muat ulang halaman.');
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    initData();
    return () => {
      alive = false;
    };
  }, []);

  // Handler saat user memilih budget baru / preset
  const handleAllocate = async (budget: number) => {
    const currentId = ++requestId.current;
    try {
      setAllocating(true);
      setError(null);
      const res = await runAllocation(1, budget);
      if (currentId === requestId.current) setAllocationResult(res);
    } catch (err) {
      console.error('Failed to run allocation:', err);
      if (currentId === requestId.current) {
        if (err instanceof ApiError && err.status === 401) {
          setNeedsKey(true);
          setError('Kunci operator tidak valid atau belum diisi.');
        } else if (err instanceof ApiError && err.status === 429) {
          setError('Terlalu banyak simulasi. Coba lagi setelah satu menit.');
        } else {
          setError('Simulasi gagal. Periksa koneksi backend dan coba lagi.');
        }
      }
    } finally {
      if (currentId === requestId.current) setAllocating(false);
    }
  };

  const handleSelectProgram = (prog: ScoredProgram) => {
    setSelectedProgram(prog);
    // Smooth scroll to Why This Priority section
    const el = document.getElementById('section-why');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-stone-900 flex flex-col selection:bg-teal-100 selection:text-teal-900">
      {/* Header Sticky dengan Clickable Anchor Rail */}
      <Header villageName={village?.name} />

      {/* Main Content: Single-Scroll Narrative */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {error && (
          <div role="alert" className="mt-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-sm text-amber-950 flex items-center justify-between gap-4">
            <span>{error}</span>
            {!needsKey && <button onClick={() => window.location.reload()} className="font-bold underline shrink-0">Coba lagi</button>}
          </div>
        )}
        {needsKey && <form onSubmit={e => { e.preventDefault(); if (keyInput.trim()) { setOperatorKey(keyInput.trim()); window.location.reload(); } }} className="mt-3 p-4 bg-white border border-stone-300 rounded-xl flex flex-wrap gap-2 items-center">
          <label htmlFor="operator-key" className="text-sm font-bold">Kunci operator</label>
          <input id="operator-key" type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)} autoComplete="off" className="border border-stone-300 rounded px-3 py-2 text-sm" />
          <button type="submit" className="bg-teal-800 text-white px-4 py-2 rounded text-sm font-bold">Buka simulator</button>
        </form>}
        {hasOperatorKey() && !needsKey && <button onClick={() => { clearOperatorKey(); window.location.reload(); }} className="mt-3 text-xs text-stone-600 underline">Hapus kunci operator dari sesi ini</button>}

        {/* Sampul ringkas: satu visual anchor untuk menjelaskan alur RekaDesa */}
        <section className="grid lg:grid-cols-[1.45fr_0.75fr] border border-stone-300 mt-8 mb-1 overflow-hidden shadow-[0_12px_32px_rgba(28,25,23,0.06)]">
          <div className="ledger-cover relative px-6 py-8 sm:px-8 sm:py-10 border-l-4 border-teal-800">
            <div className="absolute right-5 top-4 font-mono text-[10px] tracking-[0.18em] text-stone-400">LEMBAR ANALISIS / 001</div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-800">RekaDesa · Smart Village Technology</p>
            <h1 className="mt-3 max-w-2xl font-serif text-3xl sm:text-4xl font-bold leading-[1.08] tracking-tight text-stone-950">
              Setiap rupiah punya alasan.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
              RekaDesa mengubah data kebutuhan menjadi skor yang dapat ditelusuri dan kombinasi program yang tidak melampaui pagu.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-stone-700">
              <span className="before:mr-2 before:text-teal-700 before:content-['●']">Perhitungan tetap</span>
              <span className="before:mr-2 before:text-teal-700 before:content-['●']">Kombinasi optimal</span>
              <span className="before:mr-2 before:text-teal-700 before:content-['●']">Hasil terbuka</span>
            </div>
          </div>

          <aside className="official-panel bg-teal-950 px-6 py-7 text-stone-100">
            <div className="flex items-center justify-between border-b border-teal-700 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-200">
              <span>Alur keputusan</span>
              <span className="font-mono">4 tahap</span>
            </div>
            <ol className="divide-y divide-teal-800/80 text-xs">
              {[
                ['01', 'Ukur kebutuhan desa'],
                ['02', 'Hitung prioritas'],
                ['03', 'Susun kombinasi'],
                ['04', 'Publikasikan hasil'],
              ].map(([number, label]) => (
                <li key={number} className="flex items-center gap-4 py-3">
                  <span className="font-mono text-teal-400">{number}</span>
                  <span className="font-semibold">{label}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-end justify-between gap-3">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-teal-300">Bobot penilaian</div>
                <div className="mt-1 font-mono text-sm font-bold tracking-wider">30 · 25 · 20 · 15 · 10</div>
              </div>
              <div className="rotate-[-3deg] border border-teal-400 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-teal-200">
                Terbuka
              </div>
            </div>
          </aside>
        </section>

        <div className="xl:grid xl:grid-cols-[156px_minmax(0,1fr)_304px] xl:gap-7 xl:items-start">
          <aside className="hidden xl:block sticky top-24 pt-10">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">Alur analisis</div>
            <nav aria-label="Navigasi tahapan analisis" className="mt-4 border-l border-stone-300">
              {[
                ['01', 'Kondisi desa', 'section-profile'],
                ['02', 'Simulasi', 'section-simulator'],
                ['03', 'Perhitungan', 'section-why'],
                ['04', 'Perbandingan', 'section-presets'],
              ].map(([number, label, target]) => (
                <button
                  type="button"
                  key={target}
                  onClick={() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })}
                  className="group flex w-full items-center gap-3 border-l-2 border-transparent py-2.5 pl-3 text-left text-xs text-stone-500 hover:border-teal-800 hover:text-stone-900"
                >
                  <span className="font-mono text-[10px] text-teal-700">{number}</span>
                  <span className="font-semibold">{label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-8 border-t border-stone-300 pt-4 text-[10px] leading-relaxed text-stone-500">
              <div className="font-mono font-bold text-stone-700">DP 0/1</div>
              Unit Rp1 juta<br />Tanpa keputusan AI
            </div>
          </aside>

          <div className="min-w-0">
            <VillageProfile village={village} loading={loading} />
            <ScenarioGenerator
              key={allocationResult?.budget ?? 'initial'}
              villageId={1}
              onAllocate={handleAllocate}
              allocationResult={allocationResult}
              loading={allocating}
              onSelectProgramForDetail={handleSelectProgram}
              selectedDetailProgramId={selectedProgram?.id}
            />
            <WhyThisPriority
              program={selectedProgram}
              allPrograms={allPrograms}
              onSelectProgram={setSelectedProgram}
            />
          </div>

          <aside className="xl:sticky xl:top-20">
            <BudgetComparison
              presets={presets}
              loading={loading}
              currentBudget={allocationResult?.budget}
            />
          </aside>
        </div>
      </main>

      {/* Footer identitas metodologi */}
      <footer className="border-t border-stone-300 bg-stone-100/80 py-8 text-xs text-stone-600">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-stone-900">RekaDesa SPK Prioritas Pembangunan Desa</div>
            <div className="text-stone-500 text-[11px] mt-0.5">
              Dikembangkan oleh Tim BDCA? Hhhe iya (Universitas Bina Darma) — APHACKATON 2026
            </div>
          </div>
          <div className="text-stone-500 text-[11px] text-right font-mono">
            Deterministik • Perhitungan Terbuka • Data Simulasi
          </div>
        </div>
      </footer>
    </div>
  );
};
