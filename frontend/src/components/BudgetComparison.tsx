import React from 'react';
import type { PresetMap } from '../types';

interface BudgetComparisonProps {
  presets: PresetMap | null;
  loading: boolean;
  currentBudget?: number;
}

const scenarios = [
  ['300000000', 'Rp300 juta'],
  ['500000000', 'Rp500 juta'],
  ['750000000', 'Rp750 juta'],
  ['1000000000', 'Rp1 miliar'],
] as const;

const shortRupiah = (value: number) => {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toLocaleString('id-ID')} M`;
  return `Rp${(value / 1_000_000).toLocaleString('id-ID')} jt`;
};

export const BudgetComparison: React.FC<BudgetComparisonProps> = ({
  presets,
  loading,
  currentBudget,
}) => {
  if (loading || !presets) {
    return <section id="section-presets" className="scroll-mt-20 py-10"><div className="h-72 animate-pulse rounded bg-stone-200" /></section>;
  }

  return (
    <section id="section-presets" className="scroll-mt-20 py-10 xl:pb-0">
      <div className="mb-5 xl:border-b xl:border-stone-300 xl:pb-4">
        <div className="text-[11px] font-bold tracking-[0.16em] text-teal-800 uppercase mb-1">04 / Perbandingan</div>
        <h2 className="font-serif text-2xl xl:text-xl font-bold tracking-tight text-stone-900">Perbandingan skenario</h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">Ringkasan hasil pada empat pilihan pagu.</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-3">
        {scenarios.map(([key, label]) => {
          const data = presets[key];
          if (!data) return null;
          const active = currentBudget === data.budget;
          const utilization = data.budget > 0 ? data.total_cost / data.budget * 100 : 0;

          return (
            <article
              key={key}
              className={`overflow-hidden border text-left ${active
                ? 'border-teal-800 bg-teal-950 text-white shadow-[0_8px_24px_rgba(17,94,89,0.16)]'
                : 'border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between px-4 pt-3.5">
                <span className="font-mono text-sm font-bold">{label}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-teal-300' : 'text-stone-400'}`}>
                  {active ? 'Sedang dilihat' : 'Pembanding'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 px-4 py-3 text-[10px]">
                <div>
                  <div className={active ? 'text-teal-300' : 'text-stone-400'}>Program</div>
                  <div className="mt-0.5 font-mono text-xs font-bold">{data.selected.length}</div>
                </div>
                <div>
                  <div className={active ? 'text-teal-300' : 'text-stone-400'}>Belanja</div>
                  <div className="mt-0.5 font-mono text-xs font-bold">{shortRupiah(data.total_cost)}</div>
                </div>
                <div>
                  <div className={active ? 'text-teal-300' : 'text-stone-400'}>Skor</div>
                  <div className="mt-0.5 font-mono text-xs font-bold">{data.total_score.toFixed(1)}</div>
                </div>
              </div>
              <div className={active ? 'bg-teal-900' : 'bg-stone-200'}>
                <div className={`h-1 ${active ? 'bg-teal-400' : 'bg-teal-700'}`} style={{ width: `${utilization}%` }}></div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 border-l-2 border-amber-500 bg-amber-50 px-3 py-2.5 text-[10px] leading-relaxed text-amber-950">
        Sisa anggaran tidak otomatis buruk. Sistem memilih kombinasi dengan skor total tertinggi tanpa melebihi pagu.
      </div>
    </section>
  );
};
