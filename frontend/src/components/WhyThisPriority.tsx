import React, { useState } from 'react';
import type { ScoredProgram } from '../types';
import { ShieldAlert } from 'lucide-react';

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
    ['Kesenjangan pembangunan', 30, program.breakdown.development_gap, program.contributions.development_gap],
    ['Warga terdampak', 25, program.breakdown.people_affected, program.contributions.people_affected],
    ['Kedaruratan', 20, program.breakdown.urgency, program.contributions.urgency],
    ['Dampak pembangunan', 15, program.breakdown.development_impact, program.contributions.development_impact],
    ['Efisiensi biaya', 10, program.breakdown.cost_efficiency, program.contributions.cost_efficiency],
  ] as const;
  const isTop = allPrograms.every((item) => item.priority_score <= program.priority_score);
  const auditSum = components.map((component) => component[3].toFixed(1)).join(' + ');

  return (
    <section id="section-why" className="scroll-mt-20 py-10 border-b border-stone-300">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-[0.16em] text-teal-800 uppercase mb-1">03 / Dasar Penilaian</div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900">Rincian skor</h2>
          <p className="text-sm text-stone-600 mt-1">Setiap poin dapat ditelusuri ke lima komponen tetap.</p>
        </div>

        <div className="inline-flex self-start rounded-md border border-stone-300 p-0.5 bg-stone-100">
          <button type="button" onClick={() => setViewMode('internal')} className={`px-3 py-1.5 rounded text-xs font-semibold ${viewMode === 'internal' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600'}`}>Perhitungan</button>
          <button type="button" onClick={() => setViewMode('public')} className={`px-3 py-1.5 rounded text-xs font-semibold ${viewMode === 'public' ? 'bg-teal-800 text-white' : 'text-stone-600'}`}>Bahasa warga</button>
        </div>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_240px] gap-4 mb-4">
        <div>
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
        <div className="border-l-4 border-teal-800 bg-stone-100 px-4 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-stone-500">Skor prioritas</div>
          <div className="font-mono text-2xl font-bold text-teal-900">{program.priority_score.toFixed(1)} <span className="text-xs font-normal text-stone-500">/ 100</span></div>
        </div>
      </div>

      <div className="border border-stone-300 rounded-lg bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-stone-300 bg-stone-50">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">{program.name}</h3>
            <p className="text-xs text-stone-500">{program.kategori} · Rp {program.biaya.toLocaleString('id-ID')} · {program.jumlah_penerima} warga</p>
          </div>
          <span className="text-[10px] font-mono text-stone-400">ID #{program.id}</span>
        </div>

        {viewMode === 'internal' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Komponen</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Nilai</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Bobot</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Kontribusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {components.map(([label, weight, value, contribution]) => (
                  <tr key={label}>
                    <td className="px-4 py-3 font-medium text-stone-800">{label}</td>
                    <td className="px-4 py-3 text-right font-mono text-stone-600">{value.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right font-mono text-stone-600">{weight}%</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-teal-900">+{contribution.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-stone-300 bg-teal-50/50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-stone-600">{auditSum}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-teal-950">{program.priority_score.toFixed(1)}</td>
                </tr>
              </tfoot>
            </table>
            <p className="px-4 py-2 text-[10px] text-stone-400 border-t border-stone-100">Kontribusi dibulatkan untuk tampilan; total dihitung dari nilai asli.</p>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Ini rekomendasi sistem dari data simulasi, bukan keputusan final. Penetapan APBDes tetap melalui Musyawarah Desa bersama Kades dan BPD.</p>
            </div>
            <dl className="mt-4 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 border-y border-stone-200">
              <div className="py-3 sm:px-4 sm:first:pl-0"><dt className="text-[10px] uppercase text-stone-500">Kesenjangan</dt><dd className="mt-1 font-mono font-bold">{program.breakdown.development_gap.toFixed(1)} / 100</dd></div>
              <div className="py-3 sm:px-4"><dt className="text-[10px] uppercase text-stone-500">Penerima manfaat</dt><dd className="mt-1 font-mono font-bold">{program.jumlah_penerima} warga</dd></div>
              <div className="py-3 sm:px-4"><dt className="text-[10px] uppercase text-stone-500">Kedaruratan</dt><dd className="mt-1 font-mono font-bold">{program.breakdown.urgency.toFixed(0)} / 100</dd></div>
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
