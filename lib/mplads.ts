export const MPLADS_API_BASE =
  'https://mplads.mospi.gov.in/rest/PreLoginDashboardData';

export const MPLADS_ENDPOINTS = [
  'getTilesData',
  'getStateData',
  'getTenureData',
  'getConstituencyData',
  'getMpNamesData',
  'getMpNameAndConstCombo',
  'getgraphdata',
  'getPieChartLabels',
  'getReportTilesData',
  'getTilesReportData',
] as const;

export type MpladsEndpoint = (typeof MPLADS_ENDPOINTS)[number];

type ApiResponse<T> = { source: 'live' | 'cache' | 'stale'; data: T };

export async function fetchMplads<T = unknown>(
  endpoint: MpladsEndpoint,
  params?: string
): Promise<T> {
  const res = await fetch('/api/mplads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, params: params ?? '' }),
  });
  if (!res.ok) {
    throw new Error(`MPLADS fetch failed: ${res.status}`);
  }
  const json = (await res.json()) as ApiResponse<T>;
  return json.data;
}

export interface MpladsTile {
  key: string;
  value: string;
  values: string[];
}

export interface MpladsTilesData {
  tiles: MpladsTile[];
  currentTenure?: string;
  tenureId?: number;
}

export interface MpladsState {
  STATE_ID: number;
  STATE_NAME: string;
}

export interface MpladsOption {
  ID: number;
  CAPTION: string;
}

export interface MpladsConstituency {
  ID: number;
  CAPTION: string | null;
}

export interface MpladsMpName {
  ID: number;
  CAPTION: string;
}

export interface MpladsGraphData {
  [key: string]: Record<string, unknown> & { title?: string };
}

const MPLADS_ORDER: Record<string, string> = {
  'Works Recommended': 'Recommended',
  'Works Sanctioned': 'Sanctioned',
  'Works Completed': 'Completed',
  'Allocated Limit for Hon\u0027ble MPs': 'Allocated Limit',
  'Expenditure on Completed and On-going Works as on Date': 'Expenditure',
  'Amount consented for Calamity': 'Calamity',
};

export function normalizeTiles(raw: Record<string, unknown[]>): MpladsTilesData {
  const entries = Object.entries(raw);
  const grouped: Record<string, string[]> = {};
  const order: string[] = [];
  let currentTenure: string | undefined;
  let tenureId: number | undefined;

  for (const [key, arr] of entries) {
    const label = MPLADS_ORDER[key] || key;
    if (key === 'Current Tenure') {
      const tenure = (arr?.[0] as { ID?: number; CAPTION?: string } | undefined);
      if (tenure) {
        currentTenure = tenure.CAPTION;
        tenureId = tenure.ID;
      }
      continue;
    }
    grouped[label] = (arr as string[]).map(String);
    order.push(label);
  }

  const tiles: MpladsTile[] = order.map((label) => ({
    key: label,
    value: grouped[label][0] ?? '',
    values: grouped[label],
  }));

  return {
    tiles,
    currentTenure,
    tenureId,
  };
}

export type RiskLevel = 'green' | 'amber' | 'red' | 'na';

export interface AreaData {
  id: number;
  name: string;
  recommended: number;
  sanctioned: number;
  completed: number;
  recAmt: number;
  sanAmt: number;
  riskLevel: RiskLevel;
}

export interface StateData {
  stateId: number;
  name: string;
  recommended: number;
  sanctioned: number;
  completed: number;
  recAmt: number;
  sanAmt: number;
  riskLevel: RiskLevel;
  areas: AreaData[];
}

export interface StateMapProgress {
  total: number;
  done: number;
  running: boolean;
  startedAt: string | null;
}

export interface StateMapResponse {
  source: 'cache' | 'warming' | 'fresh' | 'empty';
  ready: boolean;
  updatedAt: string | null;
  progress: StateMapProgress;
  states: StateData[];
}

export type AnomalyType =
  | 'Cost Overrun'
  | 'Duplicate Work'
  | 'Delay Prediction'
  | 'Compliance Issue'
  | 'NLP Flag';

export interface AnomalyItem {
  id: string;
  date: string;
  project: string;
  state: string;
  constituency: string | null;
  type: string;
  risk: number;
  amount: number | null;
  description: string | null;
  snippet: string | null;
  work_id: number | null;
  score: Record<string, number>;
}

export interface AnomalyKpis {
  total: number;
  high_risk: number;
  projects_affected: number;
  avg_risk: number;
}

export interface AnomalyResponse {
  state: string | null;
  state_id: number | null;
  scanned_at: string;
  anomalies: AnomalyItem[];
  kpis: AnomalyKpis;
  total_records: number;
  service: string;
}

