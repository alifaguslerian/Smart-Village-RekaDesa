import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardCheck, FileInput, XCircle } from 'lucide-react';
import { reviewProposal, updateBudget } from '../api/client';
import type { BudgetRecord, ProposalReview, ProposalSubmission } from '../types';

interface DataPreparationProps {
  villageId: number;
  budget: BudgetRecord | null;
  proposals: ProposalSubmission[];
  onChanged: () => Promise<void>;
}

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
}).format(value);

const emptyReview = (): ProposalReview => ({
  decision: 'approve', reviewed_by: '', catatan_review: '', biaya: 0, urgency: 0,
  di_kategori: 'Sedang', skor_idm_dimensi: 0, total_kebutuhan_dimensi: 0, dimensi_terkait: '',
});

export const DataPreparation: React.FC<DataPreparationProps> = ({ villageId, budget, proposals, onChanged }) => {
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetForm, setBudgetForm] = useState(() => budget ? { ...budget } : null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [review, setReview] = useState<ProposalReview>(emptyReview());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useMemo(() => proposals.filter(item => item.status === 'pending'), [proposals]);
  const reviewed = useMemo(() => proposals.filter(item => item.status !== 'pending').slice(0, 5), [proposals]);

  const startBudgetEdit = () => {
    if (budget) setBudgetForm({ ...budget });
    setEditingBudget(true);
  };

  const saveBudget = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!budgetForm) return;
    try {
      setSaving(true); setError(null);
      await updateBudget(villageId, {
        fiscal_year: budgetForm.fiscal_year,
        amount: budgetForm.amount,
        source: budgetForm.source,
        verified: budgetForm.verified,
        verified_by: budgetForm.verified ? budgetForm.verified_by : null,
      });
      setEditingBudget(false);
      await onChanged();
    } catch {
      setError('Data pagu belum berhasil disimpan.');
    } finally { setSaving(false); }
  };

  const sendReview = async (proposalId: number, decision: 'approve' | 'reject') => {
    if (saving) return;
    try {
      setSaving(true); setError(null);
      await reviewProposal(proposalId, { ...review, decision });
      setReviewingId(null);
      setReview(emptyReview());
      await onChanged();
    } catch {
      setError(decision === 'approve' ? 'Usulan belum dapat disetujui. Pastikan semua data penilaian terisi.' : 'Usulan belum dapat ditolak.');
    } finally { setSaving(false); }
  };

  const inputClass = 'w-full border border-stone-300 bg-white px-2.5 py-2 text-xs focus:border-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-100';
  return (
    <section id="section-data" className="scroll-mt-20 border-b border-stone-300 py-10">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-800">00 / Data Masuk</div>
          <h2 className="text-xl font-semibold text-stone-900 sm:text-2xl">Siapkan data sebelum dihitung</h2>
          <p className="mt-1 text-sm text-stone-600">Usulan belum memengaruhi skor sampai diperiksa perangkat desa.</p>
        </div>
        <Link to={`/submit/${villageId}`} className="inline-flex items-center gap-2 self-start border border-stone-400 bg-white px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-50">
          <FileInput className="h-4 w-4" /> Form pengajuan
        </Link>
      </div>

      {error && <div role="alert" className="mb-4 border border-red-300 bg-red-50 p-3 text-xs text-red-900">{error}</div>}

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="border border-stone-300 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Batas anggaran tercatat</div>
              <div className="mt-2 font-mono text-xl font-bold text-stone-950">{budget ? rupiah(budget.amount) : 'Belum tersedia'}</div>
              <div className="mt-1 text-xs text-stone-500">Tahun {budget?.fiscal_year ?? '—'}</div>
            </div>
            {budget && (
              <span className={`border px-2 py-1 text-[10px] font-bold ${budget.verified ? 'border-teal-300 bg-teal-50 text-teal-900' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
                {budget.verified ? 'TERVERIFIKASI' : 'SIMULASI'}
              </span>
            )}
          </div>
          <p className="mt-4 border-t border-stone-200 pt-3 text-xs leading-relaxed text-stone-600">{budget?.source ?? 'Sumber pagu belum dicatat.'}</p>
          {budget?.verified_by && <p className="mt-2 text-[11px] text-stone-500">Diperiksa oleh {budget.verified_by}</p>}
          {!editingBudget ? (
            <button type="button" onClick={startBudgetEdit} className="mt-4 text-xs font-bold text-teal-800 underline">Perbarui data pagu</button>
          ) : budgetForm && (
            <form onSubmit={saveBudget} className="mt-5 space-y-3 border-t border-stone-200 pt-4">
              <div className="grid grid-cols-[90px_1fr] gap-2">
                <input aria-label="Tahun anggaran" type="number" min={2020} max={2100} value={budgetForm.fiscal_year} onChange={e => setBudgetForm({ ...budgetForm, fiscal_year: Number(e.target.value) })} className={inputClass} />
                <input aria-label="Batas anggaran" type="number" min={1000000} max={1000000000} step={1000000} value={budgetForm.amount} onChange={e => setBudgetForm({ ...budgetForm, amount: Number(e.target.value) })} className={inputClass} />
              </div>
              <textarea aria-label="Sumber pagu" required minLength={5} rows={3} value={budgetForm.source} onChange={e => setBudgetForm({ ...budgetForm, source: e.target.value })} className={inputClass} />
              <label className="flex items-center gap-2 text-xs text-stone-700">
                <input type="checkbox" checked={budgetForm.verified} onChange={e => setBudgetForm({ ...budgetForm, verified: e.target.checked })} /> Sudah dicocokkan dengan dokumen
              </label>
              {budgetForm.verified && <input aria-label="Nama pemeriksa pagu" required minLength={3} placeholder="Nama pemeriksa" value={budgetForm.verified_by ?? ''} onChange={e => setBudgetForm({ ...budgetForm, verified_by: e.target.value })} className={inputClass} />}
              <div className="flex gap-2">
                <button disabled={saving} type="submit" className="bg-stone-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Simpan</button>
                <button type="button" onClick={() => setEditingBudget(false)} className="px-3 py-2 text-xs font-semibold text-stone-600">Batal</button>
              </div>
            </form>
          )}
          {reviewed.length > 0 && (
            <details className="border-t border-stone-200 px-5 py-3">
              <summary className="cursor-pointer text-xs font-semibold text-stone-700">
                Riwayat pemeriksaan terbaru ({reviewed.length})
              </summary>
              <div className="mt-3 divide-y divide-stone-200 border-t border-stone-200">
                {reviewed.map(item => (
                  <div key={item.id} className="py-3 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-stone-800">{item.name}</span>
                      <span className={item.status === 'approved' ? 'text-teal-800' : 'text-red-700'}>
                        {item.status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
                      </span>
                    </div>
                    <p className="mt-1 text-stone-500">{item.reviewed_by ?? 'Pemeriksa tidak tercatat'} · {item.catatan_review}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        <div className="border border-stone-300 bg-white">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Usulan menunggu pemeriksaan</h3>
              <p className="mt-0.5 text-xs text-stone-500">Hanya usulan yang disetujui menjadi kandidat program.</p>
            </div>
            <span className="font-mono text-sm font-bold text-stone-700">{pending.length}</span>
          </div>
          {pending.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <ClipboardCheck className="mx-auto h-6 w-6 text-stone-400" />
              <p className="mt-3 text-sm font-semibold text-stone-700">Tidak ada usulan yang menunggu.</p>
              <p className="mt-1 text-xs text-stone-500">Gunakan form pengajuan untuk mencatat hasil Musdus atau usulan warga.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {pending.map(item => (
                <article key={item.id} className="p-5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{item.name}</h4>
                      <p className="mt-1 text-xs text-stone-500">{item.lokasi} · {item.jumlah_penerima} warga · {item.pengusul}</p>
                    </div>
                    <button type="button" onClick={() => { setReviewingId(reviewingId === item.id ? null : item.id); setReview(emptyReview()); }} className="self-start text-xs font-bold text-teal-800 underline">
                      {reviewingId === item.id ? 'Tutup' : 'Periksa'}
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-stone-700">{item.masalah}</p>
                  <p className="mt-2 text-[11px] text-stone-500"><strong>Sumber:</strong> {item.sumber_data}</p>

                  {reviewingId === item.id && (
                    <div className="mt-4 border-t border-stone-200 pt-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <label className="text-[11px] font-semibold text-stone-600">Biaya berdasarkan RAB
                          <input required type="number" min={1} value={review.biaya} onChange={e => setReview({ ...review, biaya: Number(e.target.value) })} className={inputClass} />
                        </label>
                        <label className="text-[11px] font-semibold text-stone-600">Urgensi 0–100
                          <input required type="number" min={0} max={100} value={review.urgency} onChange={e => setReview({ ...review, urgency: Number(e.target.value) })} className={inputClass} />
                        </label>
                        <label className="text-[11px] font-semibold text-stone-600">Dampak
                          <select value={review.di_kategori} onChange={e => setReview({ ...review, di_kategori: e.target.value as ProposalReview['di_kategori'] })} className={inputClass}><option>Rendah</option><option>Sedang</option><option>Tinggi</option></select>
                        </label>
                        <label className="text-[11px] font-semibold text-stone-600">Skor kondisi bidang
                          <input required type="number" min={0} max={100} value={review.skor_idm_dimensi} onChange={e => setReview({ ...review, skor_idm_dimensi: Number(e.target.value) })} className={inputClass} />
                        </label>
                        <label className="text-[11px] font-semibold text-stone-600">Total kebutuhan bidang
                          <input required type="number" min={1} value={review.total_kebutuhan_dimensi} onChange={e => setReview({ ...review, total_kebutuhan_dimensi: Number(e.target.value) })} className={inputClass} />
                        </label>
                        <label className="text-[11px] font-semibold text-stone-600">Dimensi terkait
                          <input required minLength={3} value={review.dimensi_terkait} onChange={e => setReview({ ...review, dimensi_terkait: e.target.value })} className={inputClass} />
                        </label>
                        <label className="text-[11px] font-semibold text-stone-600 sm:col-span-2">Nama pemeriksa
                          <input required minLength={3} value={review.reviewed_by} onChange={e => setReview({ ...review, reviewed_by: e.target.value })} className={inputClass} />
                        </label>
                        <label className="text-[11px] font-semibold text-stone-600 sm:col-span-2 lg:col-span-3">Catatan pemeriksaan
                          <textarea required minLength={3} rows={2} value={review.catatan_review} onChange={e => setReview({ ...review, catatan_review: e.target.value })} className={inputClass} />
                        </label>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button disabled={saving} type="button" onClick={() => sendReview(item.id, 'approve')} className="inline-flex items-center gap-2 bg-teal-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> Setujui dan hitung</button>
                        <button disabled={saving} type="button" onClick={() => sendReview(item.id, 'reject')} className="inline-flex items-center gap-2 border border-red-300 px-4 py-2 text-xs font-bold text-red-800 disabled:opacity-50"><XCircle className="h-4 w-4" /> Tolak</button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
