import React, { useState } from 'react';
import type { AllocationResult, ScoredProgram } from '../types';
import { AlertCircle, Calculator, ChevronDown, ChevronUp, XCircle } from 'lucide-react';

interface ScenarioGeneratorProps {
  villageId: number;
  onAllocate: (budget: number) => Promise<void>;
  allocationResult: AllocationResult | null;
  loading: boolean;
  onSelectProgramForDetail?: (program: ScoredProgram) => void;
  selectedDetailProgramId?: number;
}

const PRESET_AMOUNTS = [
  { label: '300 Juta', value: 300_000_000 },
  { label: '500 Juta', value: 500_000_000 },
  { label: '750 Juta', value: 750_000_000 },
  { label: '1 Miliar', value: 1_000_000_000 },
];

const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(num);

export const ScenarioGenerator: React.FC<ScenarioGeneratorProps> = ({
  onAllocate,
  allocationResult,
  loading,
  onSelectProgramForDetail,
  selectedDetailProgramId,
}) => {
  const [budgetInput, setBudgetInput] = useState(allocationResult?.budget ?? 500_000_000);
  const [showUnselected, setShowUnselected] = useState(false);

  const handlePresetClick = (amount: number) => {
    setBudgetInput(amount);
    onAllocate(amount);
  };

  const handleCustomSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (Number.isSafeInteger(budgetInput) && budgetInput >= 0 && budgetInput <= 1_000_000_000) {
      onAllocate(budgetInput);
    }
  };

  const utilization = allocationResult && allocationResult.budget > 0
    ? Math.min(100, allocationResult.total_cost / allocationResult.budget * 100)
    : 0;

  return (
    <section id="section-simulator" className="scroll-mt-20 py-10 border-b border-stone-300">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-[0.16em] text-teal-800 uppercase mb-1">02 / Alokasi Anggaran</div>
          <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">Simulasi anggaran</h2>
          <p className="text-sm text-stone-600 mt-1">Pilih pagu untuk menghitung kombinasi program dengan skor total tertinggi.</p>
        </div>
        <p className="text-[11px] font-mono text-stone-500">0/1 KNAPSACK · UNIT RP1 JUTA · DETERMINISTIK</p>
      </div>

      <div className="border border-stone-300 bg-white rounded-lg p-4 sm:p-5 mb-5">
        <div className="grid lg:grid-cols-[1fr_300px] gap-5 lg:items-end">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">Pagu simulasi</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => {
                const active = allocationResult?.budget === preset.value;
                return (
                  <button
                    type="button"
                    key={preset.value}
                    onClick={() => handlePresetClick(preset.value)}
                    disabled={loading}
                    aria-pressed={active}
                    className={`relative px-3 py-3 rounded-md border text-xs font-bold transition-all disabled:cursor-wait disabled:opacity-60 ${active
                      ? 'bg-teal-900 text-white border-teal-950 shadow-[inset_0_0_0_1px_rgba(94,234,212,0.25),0_5px_14px_rgba(17,94,89,0.18)]'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:border-teal-700 hover:bg-white'
                    }`}
                  >
                    <span className={`mx-auto mb-1 block h-1 w-5 rounded-full ${active ? 'bg-teal-300' : 'bg-stone-300'}`} aria-hidden="true" />
                    Rp {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleCustomSubmit}>
            <label htmlFor="custom-budget" className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">Nominal khusus</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-xs text-stone-500 font-mono">Rp</span>
                <input
                  id="custom-budget"
                  type="number"
                  step="1000000"
                  min="0"
                  max="1000000000"
                  value={budgetInput}
                  onChange={(event) => setBudgetInput(Number(event.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-md text-xs font-mono focus:ring-2 focus:ring-teal-700 focus:border-teal-700 bg-stone-50"
                />
              </div>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white rounded-md text-xs font-semibold hover:bg-black disabled:opacity-50">
                <Calculator className="w-4 h-4" aria-hidden="true" />
                <span>{loading ? 'Menghitung' : 'Hitung'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {allocationResult && (
        <>
          <div className="mb-6 overflow-hidden rounded-xl border border-stone-300 bg-white shadow-[0_8px_24px_rgba(28,25,23,0.05)]">
            <div className="flex flex-col gap-3 border-b border-stone-200 bg-stone-950 px-4 py-4 text-white sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-300">Komposisi pagu</div>
                <div className="mt-1 font-mono text-2xl font-bold">{utilization.toFixed(1)}%</div>
              </div>
              <div className="flex gap-5 text-[10px]">
                <div><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-teal-400" />Dialokasikan <strong className="ml-1 font-mono text-xs">{formatRupiah(allocationResult.total_cost)}</strong></div>
                <div><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-400" />Sisa <strong className="ml-1 font-mono text-xs">{formatRupiah(allocationResult.remaining_budget)}</strong></div>
              </div>
            </div>
            <div
              className="flex h-4 bg-amber-300"
              role="progressbar"
              aria-label="Pagu yang dialokasikan"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Number(utilization.toFixed(1))}
            >
              <div className="h-full bg-teal-600 transition-[width] duration-300" style={{ width: `${utilization}%` }} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-stone-300">
              {[
                ['Anggaran', formatRupiah(allocationResult.budget)],
                ['Dialokasikan', formatRupiah(allocationResult.total_cost)],
                ['Sisa', formatRupiah(allocationResult.remaining_budget)],
                ['Skor gabungan', allocationResult.total_score.toFixed(1)],
              ].map(([label, value]) => (
                <div key={label} className="p-4">
                  <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
                  <div className="mt-1 font-mono text-sm font-bold text-stone-900">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Program terpilih</h3>
                <p className="text-xs text-stone-500">{allocationResult.selected.length} program membentuk kombinasi terbaik.</p>
              </div>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider text-stone-400">Pilih program untuk melihat rincian</span>
            </div>

            <div className="border-y border-stone-300 divide-y divide-stone-200">
              {allocationResult.selected.map((program, index) => {
                const active = selectedDetailProgramId === program.id;
                return (
                  <button
                    type="button"
                    key={program.id}
                    onClick={() => onSelectProgramForDetail?.(program)}
                    className={`w-full grid grid-cols-[28px_1fr_auto] sm:grid-cols-[32px_1fr_150px_90px] items-center gap-3 px-2 py-3 text-left transition-colors ${active ? 'bg-teal-50' : 'hover:bg-stone-50'}`}
                  >
                    <span className="font-mono text-xs text-stone-400">{String(index + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="block text-sm font-semibold text-stone-900">{program.name}</span>
                      <span className="block text-[11px] text-stone-500">{program.kategori} · {program.jumlah_penerima} warga</span>
                    </span>
                    <span className="hidden sm:block text-right font-mono text-xs text-stone-600">{formatRupiah(program.biaya)}</span>
                    <span className="font-mono text-right text-sm font-bold text-teal-900">{program.priority_score.toFixed(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {allocationResult.unselected.length > 0 && (
            <div className="border border-stone-300 rounded-lg">
              <button type="button" onClick={() => setShowUnselected(!showUnselected)} className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-stone-700 hover:bg-stone-50">
                <span className="flex items-center gap-2"><XCircle className="w-4 h-4 text-amber-700" />{allocationResult.unselected.length} program di luar kombinasi · lihat alasannya</span>
                {showUnselected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showUnselected && (
                <div className="border-t border-stone-300 divide-y divide-stone-200">
                  {allocationResult.unselected.map((program) => {
                    const deficit = program.biaya - allocationResult.remaining_budget;
                    return (
                      <div key={program.id} className="grid sm:grid-cols-[1fr_1.35fr] gap-2 p-4 text-xs">
                        <div>
                          <div className="font-semibold text-stone-900">{program.name}</div>
                          <div className="mt-1 font-mono text-stone-500">{formatRupiah(program.biaya)} · skor {program.priority_score.toFixed(1)}</div>
                        </div>
                        <div className="flex gap-2 text-amber-900">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{deficit > 0
                            ? `Melebihi sisa pagu sebesar ${formatRupiah(deficit)} setelah kombinasi terpilih.`
                            : 'Secara nominal masih muat, tetapi setelah pembulatan unit Rp1 juta kombinasi ini tidak menghasilkan skor total DP yang lebih tinggi.'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};
