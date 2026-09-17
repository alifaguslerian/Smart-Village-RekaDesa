import React from 'react';
import type { PresetMap } from '../types';

interface BudgetComparisonProps {
  presets: PresetMap | null;
  loading: boolean;
  onApplyPreset?: (budget: number) => void;
  currentBudget?: number;
}

const budgetKeys = ['300000000', '500000000', '750000000', '1000000000'];
const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
}).format(num);

export const BudgetComparison: React.FC<BudgetComparisonProps> = ({
  presets,
  loading,
  onApplyPreset,
  currentBudget,
}) => {
  if (loading || !presets) {
    return <section id="section-presets" className="scroll-mt-20 py-10"><div className="h-48 animate-pulse rounded bg-stone-200" /></section>;
  }

  return (
    <section id="section-presets" className="scroll-mt-20 py-10">
      <div className="mb-6">
        <div className="text-[11px] font-bold tracking-[0.16em] text-teal-800 uppercase mb-1">04 / Perbandingan</div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900">Empat skenario pagu</h2>
        <p className="text-sm text-stone-600 mt-1">Bandingkan hasilnya dalam satu tabel, lalu terapkan skenario untuk melihat daftar program.</p>
      </div>

      <div className="overflow-x-auto border-y border-stone-300">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-stone-100 text-[10px] uppercase tracking-wider text-stone-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Pagu</th>
              <th className="px-4 py-3 font-semibold text-right">Program</th>
              <th className="px-4 py-3 font-semibold text-right">Belanja</th>
              <th className="px-4 py-3 font-semibold text-right">Sisa</th>
              <th className="px-4 py-3 font-semibold text-right">Skor total</th>
              <th className="px-4 py-3"><span className="sr-only">Tindakan</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {budgetKeys.map((key) => {
              const data = presets[key];
              if (!data) return null;
              const active = currentBudget === data.budget;
              return (
                <tr key={key} className={active ? 'bg-teal-50' : ''}>
                  <td className="px-4 py-3 font-mono font-bold text-stone-900">{formatRupiah(data.budget)}</td>
                  <td className="px-4 py-3 text-right font-mono">{data.selected.length}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatRupiah(data.total_cost)}</td>
                  <td className="px-4 py-3 text-right font-mono text-stone-600">{formatRupiah(data.remaining_budget)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-teal-900">{data.total_score.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right">
                    {active ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Aktif</span>
                    ) : (
                      <button type="button" onClick={() => onApplyPreset?.(data.budget)} className="text-xs font-semibold text-stone-600 underline underline-offset-4 hover:text-teal-800">Terapkan</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
