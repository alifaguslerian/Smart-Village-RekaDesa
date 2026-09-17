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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
        {/* 1. Village Profile & Development Gap */}
        <VillageProfile village={village} loading={loading} />

        {/* 2. Scenario Generator (Knapsack DP + Budget Fill Gauge) */}
        <ScenarioGenerator
          key={allocationResult?.budget ?? 'initial'}
          villageId={1}
          onAllocate={handleAllocate}
          allocationResult={allocationResult}
          loading={allocating}
          onSelectProgramForDetail={handleSelectProgram}
          selectedDetailProgramId={selectedProgram?.id}
        />

        {/* 3. Why This Priority (Dual View: Internal vs Public) */}
        <WhyThisPriority
          program={selectedProgram}
          allPrograms={allPrograms}
          onSelectProgram={setSelectedProgram}
        />

        {/* 4. Budget Preset Comparison (Side-by-side 4 Column Audit Struk) */}
        <BudgetComparison
          presets={presets}
          loading={loading}
          onApplyPreset={handleAllocate}
          currentBudget={allocationResult?.budget}
        />
      </main>

      {/* Footer identitas metodologi */}
      <footer className="border-t border-stone-300 bg-stone-100/80 py-8 text-xs text-stone-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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
