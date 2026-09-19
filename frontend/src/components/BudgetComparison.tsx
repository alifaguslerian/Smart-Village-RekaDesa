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

  const impactData = scenarios.flatMap(([key, label]) => {
    const data = presets[key];
    return data ? [{
      label: label.replace('Rp', ''),
      reach: data.selected.reduce((total, program) => total + program.jumlah_penerima, 0),
    }] : [];
  });
  const maxReach = Math.max(...impactData.map((item) => item.reach), 1);
  const impactPoints = impactData.map((item, index) => ({
    ...item,
    x: impactData.length === 1 ? 128 : 14 + index * (228 / (impactData.length - 1)),
    y: 64 - (item.reach / maxReach) * 44,
  }));
  const pointList = impactPoints.map((point) => `${point.x},${point.y}`).join(' ');

  if (impactData.length === 0) {
    return (
      <section id="section-presets" className="scroll-mt-20 py-8 xl:pb-0">
        <div className="border border-stone-300 bg-white p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-800">04 / Perbandingan</div>
          <h2 className="mt-1 text-xl font-semibold text-stone-900">Belum ada preset yang sesuai</h2>
          <p className="mt-2 text-xs leading-relaxed text-stone-600">
            Pagu tercatat lebih kecil dari Rp300 juta. Gunakan nominal khusus pada simulator tanpa melampaui batas pagu.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="section-presets" className="scroll-mt-20 py-8 xl:pb-0">
      <div className="mb-3 xl:border-b xl:border-stone-300 xl:pb-3">
        <div className="text-[11px] font-bold tracking-[0.16em] text-teal-800 uppercase mb-1">04 / Perbandingan</div>
        <h2 className="text-xl font-semibold text-stone-900">Perbandingan skenario</h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">Ringkasan skenario yang tidak melebihi batas pagu tercatat.</p>
      </div>

      <div className="mb-3 overflow-hidden rounded-lg border border-stone-300 bg-stone-950 px-3 py-3 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-teal-300">Jangkauan program</div>
            <div className="mt-1 text-xs font-semibold">Akumulasi penerima per skenario</div>
          </div>
          <span className="font-mono text-[9px] text-stone-400">DATA PRESET</span>
        </div>
        <svg className="mt-2 h-16 w-full" viewBox="0 0 256 78" role="img" aria-label="Kurva akumulasi penerima program pada skenario pagu yang tersedia">
          <path d="M14 64 H242" stroke="#57534e" strokeDasharray="3 4" />
          <polyline points={pointList} fill="none" stroke="#5eead4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {impactPoints.map((point) => (
            <g key={point.label}>
              <circle cx={point.x} cy={point.y} r="5" fill="#0f172a" stroke="#5eead4" strokeWidth="3" />
              <text x={point.x} y={point.y - 9} fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">{point.reach}</text>
            </g>
          ))}
        </svg>
        <div className="grid gap-1 text-center font-mono text-[8px] text-stone-400" style={{ gridTemplateColumns: `repeat(${Math.max(impactPoints.length, 1)}, minmax(0, 1fr))` }}>
          {impactPoints.map((point) => <span key={point.label}>{point.label}</span>)}
        </div>
        <p className="mt-2 border-t border-stone-700 pt-2 text-[9px] leading-relaxed text-stone-400">Akumulasi penerima program; bukan jumlah warga unik.</p>
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
              <div className="flex items-center justify-between px-3 pt-2.5">
                <span className="font-mono text-sm font-bold">{label}</span>
                <span className={`text-[9px] font-bold uppercase tracking-wider ${active ? 'text-teal-300' : 'text-stone-400'}`}>
                  {active ? 'Sedang dilihat' : 'Pembanding'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2 text-[10px]">
                <span className={active ? 'text-teal-200' : 'text-stone-500'}>
                  <strong className="font-mono text-xs">{data.selected.length}</strong> program · {shortRupiah(data.total_cost)}
                </span>
                <span className="shrink-0">Skor <strong className="font-mono text-xs">{data.total_score.toFixed(1)}</strong></span>
              </div>
              <div
                className={`flex h-1.5 ${active ? 'bg-amber-400' : 'bg-amber-200'}`}
                role="progressbar"
                aria-label={`Pagu ${label} yang dialokasikan`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Number(utilization.toFixed(1))}
              >
                <div className={`h-full ${active ? 'bg-teal-400' : 'bg-teal-700'}`} style={{ width: `${utilization}%` }} />
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
