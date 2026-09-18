import React from 'react';
import type { Village } from '../types';
import { AlertTriangle, ChevronDown, Leaf, TrendingUp, Users } from 'lucide-react';

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

  const gapAirBersih = Math.max(0, Math.min(100, 100 - village.skor_idm_air_bersih));
  const indices = [
    ['Sosial', 'IKS', village.skor_sosial, 'Sedang', Users],
    ['Ekonomi', 'IKE', village.skor_ekonomi, 'Perlu penguatan', TrendingUp],
    ['Lingkungan', 'IKL', village.skor_lingkungan, 'Rentan', Leaf],
  ] as const;

  return (
    <section id="section-profile" className="scroll-mt-20 py-10 border-b border-stone-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-[11px] font-bold tracking-[0.16em] text-teal-800 uppercase mb-1">
            01 / Kondisi Desa
          </div>
          <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">
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

      <div className="grid overflow-hidden rounded-xl border border-stone-300 bg-white md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex items-center gap-5 bg-amber-50/70 p-5 sm:p-6">
          <div className="relative h-36 w-36 shrink-0" role="img" aria-label={`Kesenjangan akses air bersih ${gapAirBersih.toFixed(1)} dari 100`}>
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="49" fill="none" stroke="#e7e5e4" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="49"
                fill="none"
                pathLength="100"
                stroke="#b45309"
                strokeDasharray={`${gapAirBersih} ${100 - gapAirBersih}`}
                strokeLinecap="round"
                strokeWidth="10"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold text-amber-950">{gapAirBersih.toFixed(0)}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800">gap / 100</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-900">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              Kesenjangan utama
            </div>
            <h3 className="mt-2 text-lg font-semibold leading-tight text-stone-950">Akses air bersih</h3>
            <p className="mt-2 text-xs leading-relaxed text-amber-950/75">
              Indikator saat ini baru <span className="font-mono font-bold">{village.skor_idm_air_bersih.toFixed(1)}</span>. Semakin besar gap, semakin besar kontribusi kebutuhan pada skor prioritas.
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-200">
          {indices.map(([label, code, value, status, Icon]) => (
            <div key={code} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-800">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <div className="text-xs font-bold text-stone-900">Indeks {label}</div>
                <div className="mt-0.5 text-[10px] text-stone-500">{code} · {status}</div>
              </div>
              <div className="font-mono text-xl font-semibold text-stone-900">{value.toFixed(1)}</div>
            </div>
          ))}
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
