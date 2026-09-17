import type { Village, ScoredProgram, AllocationResult, PresetMap } from '../types';

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
