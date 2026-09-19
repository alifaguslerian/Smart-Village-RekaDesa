import React, { useState } from 'react';
import type { ScoredProgram } from '../types';
import { Clock3, Scale, ShieldAlert, Users } from 'lucide-react';

interface WhyThisPriorityProps {
  program: ScoredProgram | null;
  allPrograms?: ScoredProgram[];
  onSelectProgram?: (program: ScoredProgram) => void;
}

export const WhyThisPriority: React.FC<WhyThisPriorityProps> = ({
  program,
  allPrograms = [],
  onSelectProgram,
}) => {
  const [viewMode, setViewMode] = useState<'internal' | 'public'>('internal');

  if (!program) {
    return (
      <section id="section-why" className="scroll-mt-20 py-10 border-b border-stone-300">
        <p className="py-8 text-center text-sm text-stone-500">Pilih program untuk melihat rincian skornya.</p>
      </section>
    );
  }

  const components = [
    { label: 'Kesenjangan pembangunan', weight: 30, value: program.breakdown.development_gap, contribution: program.contributions.development_gap, style: 'border-emerald-200 bg-emerald-50 text-emerald-950', accent: 'text-emerald-700' },
    { label: 'Warga terdampak', weight: 25, value: program.breakdown.people_affected, contribution: program.contributions.people_affected, style: 'border-indigo-200 bg-indigo-50 text-indigo-950', accent: 'text-indigo-700' },
    { label: 'Kedaruratan', weight: 20, value: program.breakdown.urgency, contribution: program.contributions.urgency, style: 'border-amber-200 bg-amber-50 text-amber-950', accent: 'text-amber-700' },
    { label: 'Dampak pembangunan', weight: 15, value: program.breakdown.development_impact, contribution: program.contributions.development_impact, style: 'border-violet-200 bg-violet-50 text-violet-950', accent: 'text-violet-700' },
    { label: 'Efisiensi biaya', weight: 10, value: program.breakdown.cost_efficiency, contribution: program.contributions.cost_efficiency, style: 'border-rose-200 bg-rose-50 text-rose-950', accent: 'text-rose-700' },
  ] as const;
  const isTop = allPrograms.every((item) => item.priority_score <= program.priority_score);
  const auditSum = components.map((component) => component.contribution.toFixed(1)).join(' + ');
  const decisionScore = Math.round(program.priority_score * 10) / 10;

  return (
    <section id="section-why" className="scroll-mt-20 py-10 border-b border-stone-300">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-[0.16em] text-teal-800 uppercase mb-1">03 / Dasar Penilaian</div>
          <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">Rincian perhitungan</h2>
          <p className="text-sm text-stone-600 mt-1">Telusuri asal setiap poin dari lima komponen penilaian.</p>
        </div>

        <div className="inline-flex self-start rounded-md border border-stone-300 p-0.5 bg-stone-100">
          <button type="button" onClick={() => setViewMode('internal')} className={`px-3 py-1.5 rounded text-xs font-semibold ${viewMode === 'internal' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}>Angka</button>
          <button type="button" onClick={() => setViewMode('public')} className={`px-3 py-1.5 rounded text-xs font-semibold ${viewMode === 'public' ? 'bg-teal-800 text-white' : 'text-stone-600'}`}>Penjelasan warga</button>
        </div>
      </div>

      <div className="mb-4 grid overflow-hidden rounded-xl border border-stone-300 bg-white md:grid-cols-[minmax(0,1fr)_210px]">
        <div className="p-4">
          <label htmlFor="program-detail" className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">Program yang diperiksa</label>
          <select
            id="program-detail"
            value={program.id}
            onChange={(event) => {
              const selected = allPrograms.find((item) => item.id === Number(event.target.value));
              if (selected) onSelectProgram?.(selected);
            }}
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm font-semibold text-stone-900 focus:border-teal-700 focus:ring-2 focus:ring-teal-700"
          >
            {allPrograms.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.priority_score.toFixed(1)}</option>)}
          </select>
        </div>
        <div className="relative flex items-center justify-between border-t border-stone-300 bg-teal-950 px-5 py-4 text-white md:block md:border-l md:border-t-0">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-teal-300">Skor prioritas</div>
            <div className="mt-1 font-mono text-4xl font-bold text-white">{decisionScore.toFixed(2)}</div>
          </div>
          <div className="rotate-[-2deg] border border-teal-400 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider text-teal-200 md:mt-2 md:inline-block">
            Rumus terbuka
          </div>
        </div>
      </div>

      <div className="border border-stone-300 rounded-lg bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-stone-300 bg-stone-50">
          <div>
            <h3 className="text-base font-semibold text-stone-900">{program.name}</h3>
            <p className="text-xs text-stone-500">{program.kategori} · Rp {program.biaya.toLocaleString('id-ID')} · {program.jumlah_penerima} warga</p>
          </div>
          <span className="text-[10px] font-mono text-stone-400">ID #{program.id}</span>
        </div>

        {viewMode === 'internal' ? (
          <div className="p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {components.map((component) => (
                <div key={component.label} className={`min-h-32 rounded-lg border p-3 ${component.style}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold leading-tight">{component.label}</span>
                    <span className="font-mono text-[9px] opacity-65">{component.weight}%</span>
                  </div>
                  <div className={`mt-5 font-mono text-xl font-bold ${component.accent}`}>+{component.contribution.toFixed(1)}</div>
                  <div className="mt-1 text-[9px] opacity-65">Nilai dasar {component.value.toFixed(1)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-1 border-t border-dashed border-stone-300 pt-3 text-[10px] text-stone-500 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono">Kontribusi tampil: {auditSum}</span>
              <span>Skor prioritas (pembulatan 0,1; format dua digit): <strong className="font-mono text-teal-900">{decisionScore.toFixed(2)}</strong></span>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Ini rekomendasi sistem dari data simulasi, bukan keputusan final. Penetapan APBDes tetap melalui Musyawarah Desa bersama Kades dan BPD.</p>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><Scale className="h-4 w-4 text-emerald-700" aria-hidden="true" /><dt className="mt-3 text-[10px] font-bold uppercase text-emerald-800">Kondisi lapangan</dt><dd className="mt-1 font-mono text-lg font-bold text-emerald-950">Gap {program.breakdown.development_gap.toFixed(1)}</dd></div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4"><Users className="h-4 w-4 text-indigo-700" aria-hidden="true" /><dt className="mt-3 text-[10px] font-bold uppercase text-indigo-800">Jangkauan warga</dt><dd className="mt-1 font-mono text-lg font-bold text-indigo-950">{program.jumlah_penerima} warga</dd></div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><Clock3 className="h-4 w-4 text-amber-700" aria-hidden="true" /><dt className="mt-3 text-[10px] font-bold uppercase text-amber-800">Kedaruratan</dt><dd className="mt-1 font-mono text-lg font-bold text-amber-950">{program.breakdown.urgency.toFixed(0)} / 100</dd></div>
            </dl>
          </div>
        )}

        <div className="border-t border-stone-300 px-4 py-3 text-xs text-stone-600">
          <span className="font-semibold text-stone-800">Narasi penjelas · tidak memengaruhi skor:</span>{' '}
          {program.name} memperoleh {program.priority_score.toFixed(1)} poin dari lima komponen. Program ini menjangkau {program.jumlah_penerima} warga dengan biaya Rp {program.biaya.toLocaleString('id-ID')}. {isTop ? 'Nilainya tertinggi di antara usulan saat ini.' : 'Pemilihannya tetap bergantung pada kombinasi program dan pagu.'}
        </div>
      </div>
    </section>
  );
};
