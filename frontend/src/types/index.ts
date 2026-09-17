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
