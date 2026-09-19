export interface Village {
  id: number;
  name: string;
  kecamatan: string;
  kabupaten: string;
  skor_sosial: number;
  skor_ekonomi: number;
  skor_lingkungan: number;
  skor_idm_air_bersih: number;
  catatan_podes: string;
}

export interface ComponentBreakdown {
  development_gap: number;
  people_affected: number;
  urgency: number;
  development_impact: number;
  cost_efficiency: number;
}

export interface ScoredProgram {
  id: number;
  name: string;
  kategori: string;
  biaya: number;
  jumlah_penerima: number;
  breakdown: ComponentBreakdown;
  contributions: {
    development_gap: number;
    people_affected: number;
    urgency: number;
    development_impact: number;
    cost_efficiency: number;
    [key: string]: number;
  };
  priority_score: number;
}

export interface AllocationResult {
  budget: number;
  total_cost: number;
  total_score: number;
  remaining_budget: number;
  selected: ScoredProgram[];
  unselected: ScoredProgram[];
}

export interface PresetData {
  budget: number;
  total_cost: number;
  total_score: number;
  remaining_budget: number;
  selected: ScoredProgram[];
}

export type PresetMap = Record<string, PresetData>;

export interface BudgetRecord {
  id: number;
  village_id: number;
  fiscal_year: number;
  amount: number;
  source: string;
  verified: boolean;
  verified_by: string | null;
  updated_at: string;
}

export interface ProposalSubmission {
  id: number;
  village_id: number;
  program_id: number | null;
  name: string;
  kategori: string;
  lokasi: string;
  masalah: string;
  jumlah_penerima: number;
  alasan_urgensi: string;
  sumber_data: string;
  pengusul: string;
  status: 'pending' | 'approved' | 'rejected';
  catatan_review: string;
  reviewed_by: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface ProposalCreate {
  name: string;
  kategori: string;
  lokasi: string;
  masalah: string;
  jumlah_penerima: number;
  alasan_urgensi: string;
  sumber_data: string;
  pengusul: string;
}

export interface ProposalReview {
  decision: 'approve' | 'reject';
  reviewed_by: string;
  catatan_review: string;
  biaya?: number;
  urgency?: number;
  di_kategori?: 'Rendah' | 'Sedang' | 'Tinggi';
  skor_idm_dimensi?: number;
  total_kebutuhan_dimensi?: number;
  dimensi_terkait?: string;
}
