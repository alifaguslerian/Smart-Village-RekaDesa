import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { submitProposal } from '../api/client';
import type { ProposalCreate } from '../types';

const INITIAL_FORM: ProposalCreate = {
  name: '',
  kategori: 'Infrastruktur',
  lokasi: '',
  masalah: '',
  jumlah_penerima: 1,
  alasan_urgensi: '',
  sumber_data: '',
  pengusul: '',
};

export const ProposalForm: React.FC = () => {
  const { village_id } = useParams<{ village_id: string }>();
  const villageId = Number(village_id);
  const [form, setForm] = useState<ProposalCreate>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof ProposalCreate, value: string | number) => {
    setForm(current => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!Number.isSafeInteger(villageId) || villageId <= 0) {
      setError('ID desa tidak valid.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await submitProposal(villageId, form);
      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch {
      setError('Usulan belum berhasil dikirim. Periksa isian dan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#fdfcf8] px-4 py-16 text-stone-900">
        <div className="mx-auto max-w-xl border border-stone-300 bg-white p-6 sm:p-8">
          <CheckCircle2 className="h-8 w-8 text-teal-800" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold">Usulan sudah tercatat</h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Usulan belum masuk perhitungan. Perangkat desa harus memeriksa sumber data, biaya, kondisi bidang, dan dampaknya terlebih dahulu.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <button type="button" onClick={() => setSubmitted(false)} className="bg-stone-900 px-4 py-2 text-white">Ajukan usulan lain</button>
            <Link to={`/public/${villageId}`} className="border border-stone-300 px-4 py-2 text-stone-700">Kembali ke portal warga</Link>
          </div>
        </div>
      </main>
    );
  }

  const fieldClass = 'mt-1 w-full border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-100';
  return (
    <div className="min-h-screen bg-[#fdfcf8] text-stone-900">
      <header className="border-b border-stone-300 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <div className="text-xs font-bold text-teal-800">REKADESA</div>
            <div className="font-semibold">Form usulan pembangunan</div>
          </div>
          <Link to={`/public/${villageId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900">
            <ArrowLeft className="h-4 w-4" /> Portal warga
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="text-sm leading-relaxed text-stone-600">
            <h1 className="text-2xl font-semibold leading-tight text-stone-950">Catat kebutuhan yang akan dibahas desa</h1>
            <p className="mt-3">Form ini mencatat usulan, bukan langsung menyetujui program atau memberikan skor.</p>
            <div className="mt-6 border-t border-stone-300 pt-4 text-xs">
              <strong className="text-stone-900">Setelah dikirim</strong>
              <ol className="mt-2 space-y-2">
                <li>1. Operator memeriksa data.</li>
                <li>2. RAB dan kondisi bidang dilengkapi.</li>
                <li>3. Usulan yang disetujui masuk perhitungan.</li>
              </ol>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="border border-stone-300 bg-white p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
                Nama usulan
                <input required minLength={5} maxLength={200} value={form.name} onChange={e => update('name', e.target.value)} className={fieldClass} placeholder="Contoh: Perbaikan saluran air Dusun III" />
              </label>
              <label className="text-xs font-semibold text-stone-700">
                Kategori
                <select value={form.kategori} onChange={e => update('kategori', e.target.value)} className={fieldClass}>
                  {['Infrastruktur', 'Air & Sanitasi', 'Kesehatan', 'Pendidikan', 'Ekonomi', 'Lingkungan'].map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-stone-700">
                Dusun atau lokasi
                <input required minLength={3} maxLength={150} value={form.lokasi} onChange={e => update('lokasi', e.target.value)} className={fieldClass} />
              </label>
              <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
                Masalah yang ingin diselesaikan
                <textarea required minLength={10} maxLength={1500} rows={4} value={form.masalah} onChange={e => update('masalah', e.target.value)} className={fieldClass} placeholder="Jelaskan kondisi yang terjadi, siapa yang terdampak, dan sejak kapan." />
              </label>
              <label className="text-xs font-semibold text-stone-700">
                Perkiraan warga terdampak
                <input required type="number" min={1} max={1000000} value={form.jumlah_penerima} onChange={e => update('jumlah_penerima', Number(e.target.value))} className={fieldClass} />
              </label>
              <label className="text-xs font-semibold text-stone-700">
                Pengusul
                <input required minLength={3} maxLength={120} value={form.pengusul} onChange={e => update('pengusul', e.target.value)} className={fieldClass} placeholder="Nama kelompok, RT, atau dusun" />
              </label>
              <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
                Mengapa mendesak?
                <textarea required minLength={10} maxLength={1000} rows={3} value={form.alasan_urgensi} onChange={e => update('alasan_urgensi', e.target.value)} className={fieldClass} />
              </label>
              <label className="text-xs font-semibold text-stone-700 sm:col-span-2">
                Sumber data awal
                <textarea required minLength={3} maxLength={1000} rows={2} value={form.sumber_data} onChange={e => update('sumber_data', e.target.value)} className={fieldClass} placeholder="Contoh: Berita Acara Musdus II, 12 Agustus 2026; pendataan RT 03." />
              </label>
            </div>
            {error && <p role="alert" className="mt-4 border border-red-300 bg-red-50 p-3 text-xs text-red-900">{error}</p>}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-stone-200 pt-5">
              <p className="max-w-sm text-[11px] leading-relaxed text-stone-500">Jangan masukkan NIK, nomor telepon, atau data pribadi penerima manfaat.</p>
              <button type="submit" disabled={submitting} className="shrink-0 bg-teal-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {submitting ? 'Mengirim…' : 'Kirim usulan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
