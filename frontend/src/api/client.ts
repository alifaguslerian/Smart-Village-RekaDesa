import type {
  AllocationResult,
  BudgetRecord,
  PresetMap,
  ProposalCreate,
  ProposalReview,
  ProposalSubmission,
  ScoredProgram,
  Village,
} from '../types';

const BASE_URL = '/api';
const OPERATOR_KEY = 'rekadesa_operator_key';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function setOperatorKey(key: string) {
  sessionStorage.setItem(OPERATOR_KEY, key);
}

export function clearOperatorKey() {
  sessionStorage.removeItem(OPERATOR_KEY);
}

export function hasOperatorKey() {
  return Boolean(sessionStorage.getItem(OPERATOR_KEY));
}

function operatorHeaders(): Record<string, string> {
  const key = sessionStorage.getItem(OPERATOR_KEY);
  return key ? { 'X-Operator-Key': key } : {};
}

export async function fetchVillages(): Promise<Village[]> {
  const res = await fetch(`${BASE_URL}/villages`);
  if (!res.ok) throw new Error('Gagal mengambil daftar desa');
  return res.json();
}

export async function fetchVillage(id: number = 1): Promise<Village> {
  const res = await fetch(`${BASE_URL}/villages/${id}`);
  if (!res.ok) throw new Error(`Gagal mengambil data desa #${id}`);
  return res.json();
}

export async function fetchScoredPrograms(villageId: number = 1): Promise<ScoredProgram[]> {
  const res = await fetch(`${BASE_URL}/villages/${villageId}/scored`);
  if (!res.ok) throw new Error('Gagal mengambil daftar skor program');
  return res.json();
}

export async function runAllocation(villageId: number, budget: number): Promise<AllocationResult> {
  const res = await fetch(`${BASE_URL}/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...operatorHeaders() },
    body: JSON.stringify({ village_id: villageId, budget }),
  });
  if (!res.ok) throw new ApiError('Gagal melakukan kalkulasi alokasi anggaran', res.status);
  return res.json();
}

export async function fetchPresets(villageId: number = 1): Promise<PresetMap> {
  const res = await fetch(`${BASE_URL}/villages/${villageId}/presets`, { headers: operatorHeaders() });
  if (!res.ok) throw new ApiError('Gagal mengambil preset anggaran', res.status);
  return res.json();
}

export async function fetchBudget(villageId: number): Promise<BudgetRecord> {
  const res = await fetch(`${BASE_URL}/villages/${villageId}/budget`);
  if (!res.ok) throw new ApiError('Gagal mengambil data pagu', res.status);
  return res.json();
}

export async function updateBudget(villageId: number, budget: Omit<BudgetRecord, 'id' | 'village_id' | 'updated_at'>): Promise<BudgetRecord> {
  const res = await fetch(`${BASE_URL}/villages/${villageId}/budget`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...operatorHeaders() },
    body: JSON.stringify(budget),
  });
  if (!res.ok) throw new ApiError('Gagal menyimpan data pagu', res.status);
  return res.json();
}

export async function submitProposal(villageId: number, proposal: ProposalCreate): Promise<ProposalSubmission> {
  const res = await fetch(`${BASE_URL}/villages/${villageId}/proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proposal),
  });
  if (!res.ok) throw new ApiError('Gagal mengirim usulan', res.status);
  return res.json();
}

export async function fetchProposals(villageId: number): Promise<ProposalSubmission[]> {
  const res = await fetch(`${BASE_URL}/villages/${villageId}/proposals`, { headers: operatorHeaders() });
  if (!res.ok) throw new ApiError('Gagal mengambil daftar usulan', res.status);
  return res.json();
}

export async function reviewProposal(proposalId: number, review: ProposalReview): Promise<ProposalSubmission> {
  const res = await fetch(`${BASE_URL}/proposals/${proposalId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...operatorHeaders() },
    body: JSON.stringify(review),
  });
  if (!res.ok) throw new ApiError('Gagal memeriksa usulan', res.status);
  return res.json();
}
