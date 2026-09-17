import React from 'react';
import type { Village } from '../types';
import { AlertTriangle, ChevronDown } from 'lucide-react';

interface VillageProfileProps {
  village: Village | null;
  loading?: boolean;
}

export const VillageProfile: React.FC<VillageProfileProps> = ({ village, loading }) => {
  if (loading || !village) {
    return (
      <div className="animate-pulse space-y-4 py-10">
        <div className="h-8 bg-stone-200 rounded w-1/3"></div>
        <div className="h-40 bg-stone-200 rounded"></div>
      </div>
    );
  }

  const gapAirBersih = 100 - village.skor_idm_air_bersih;
  const indices = [
    ['Sosial', 'IKS', village.skor_sosial, 'Sedang'],
    ['Ekonomi', 'IKE', village.skor_ekonomi, 'Perlu penguatan'],
    ['Lingkungan', 'IKL', village.skor_lingkungan, 'Rentan'],
  ] as const;

  return (
    <section id="section-profile" className="scroll-mt-20 py-10 border-b border-stone-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-[0.16em] text-teal-800 uppercase mb-1">
            01 / Kondisi Desa
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900">
            Kondisi dan kesenjangan desa
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            {village.name} · {village.kecamatan} · {village.kabupaten}
          </p>
        </div>
        <div className="text-[11px] text-stone-500 font-mono">
          DESA #{village.id.toString().padStart(4, '0')} · DATA SIMULASI
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 border border-stone-300 bg-white rounded-lg overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-stone-200">
        {indices.map(([label, code, value, status]) => (
          <div key={code} className="p-4">
            <div className="flex items-start justify-between gap-2 text-[10px] uppercase tracking-wider text-stone-500">
              <span>Indeks {label}</span>
              <span className="font-mono">{code}</span>
            </div>
            <div className="mt-3 text-3xl font-bold font-mono text-stone-900">{value.toFixed(1)}</div>
            <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600">{status}</div>
          </div>
        ))}

        <div className="p-4 bg-amber-50 border-amber-300">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-900">
            <AlertTriangle className="w-4 h-4" />
            Kesenjangan utama
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono text-amber-950">{gapAirBersih.toFixed(1)}</span>
            <span className="text-xs text-amber-800">/ 100</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-amber-950">Akses air bersih</p>
          <p className="mt-1 text-xs text-amber-800">Skor indikator saat ini: {village.skor_idm_air_bersih.toFixed(1)}</p>
        </div>
      </div>

      <details className="group mt-3 border-b border-stone-300">
        <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-xs font-semibold text-stone-600 hover:text-stone-900">
          <span>Dasar data simulasi dan catatan lapangan</span>
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
        </summary>
        <div className="pb-4 grid md:grid-cols-[1fr_auto] gap-3 text-xs text-stone-600">
          <blockquote className="border-l-2 border-teal-800 pl-3 leading-relaxed">{village.catatan_podes}</blockquote>
          <p className="font-mono text-[10px] text-stone-500 md:text-right">
            Gap = 100 − skor indikator<br />Bukan rekaman resmi SID/IDM
          </p>
        </div>
      </details>
    </section>
  );
};
