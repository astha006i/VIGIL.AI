import fs from 'node:fs';
import path from 'node:path';
import {
  postMpladsRaw,
} from '@/lib/server/mplads-server';
import type {
  AreaData,
  RiskLevel,
  StateData,
  StateMapProgress,
} from '@/lib/mplads';

export const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_FILE = path.join(process.cwd(), 'data', 'mplads-state-snapshot.json');
const CONCURRENCY = 4;
const REPORT_KEYS = {
  recommended: { key: 'Works Recommended', field: 'RECOMMENDED_AMOUNT' },
  sanctioned: { key: 'Works Sanctioned', field: 'SANCTION_AMOUNT' },
  completed: { key: 'Works Completed', field: null },
} as const;

interface ReportRow {
  STATE_NAME: string;
  CONSTITUENCY_ID: number;
  CONSTITUENCY: string;
  RECOMMENDED_AMOUNT?: number;
  SANCTION_AMOUNT?: number;
}

interface CachedFile {
  updatedAt: string | null;
  states: StateData[];
}

let memory: CachedFile = { updatedAt: null, states: [] };
let warmPromise: Promise<void> | null = null;
const progress: StateMapProgress = {
  total: 0,
  done: 0,
  running: false,
  startedAt: null,
};

export function computeRisk(sanctioned: number, completed: number): RiskLevel {
  if (sanctioned <= 0) return 'na';
  const ratio = completed / sanctioned;
  if (ratio >= 0.5) return 'green';
  if (ratio >= 0.25) return 'amber';
  return 'red';
}

function loadFromFile(): CachedFile {
  try {
    if (!fs.existsSync(CACHE_FILE)) return { updatedAt: null, states: [] };
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as CachedFile;
    if (Array.isArray(parsed.states) && parsed.states.length > 0) {
      return parsed;
    }
    return { updatedAt: null, states: [] };
  } catch {
    return { updatedAt: null, states: [] };
  }
}

function saveToFile() {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify({ updatedAt: memory.updatedAt, states: memory.states }),
      'utf8'
    );
  } catch {
    /* cache file is best-effort */
  }
}

function isFresh(entry: CachedFile): boolean {
  if (!entry.updatedAt) return false;
  return Date.now() - new Date(entry.updatedAt).getTime() < SNAPSHOT_TTL_MS;
}

async function fetchJson<T>(endpoint: string, body: Record<string, unknown> | string): Promise<T> {
  const payload =
    typeof body === 'string' ? body : JSON.stringify(body);
  return postMpladsRaw<T>(endpoint, payload);
}

async function fetchReportRows(stateId: number, key: string): Promise<ReportRow[]> {
  const raw = await fetchJson<Record<string, string>>('getTilesReportData', {
    combo: `${stateId},0,0,2`,
    key,
  });
  const first = Object.values(raw)[0];
  if (typeof first !== 'string') return [];
  try {
    const parsed = JSON.parse(first.replace(/\u00a0/g, '₹')) as ReportRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function fetchReportAggregates(stateId: number) {
  // returns { recommended, sanctioned, completed, recAmt, sanAmt, byArea }
  const aggregate = {
    recommended: 0,
    sanctioned: 0,
    completed: 0,
    recAmt: 0,
    sanAmt: 0,
  };
  const byArea = new Map<number, { id: number; recommended: number; sanctioned: number; completed: number; recAmt: number; sanAmt: number }>();

  const addRecord = (row: ReportRow, kind: 'recommended' | 'sanctioned' | 'completed') => {
    const areaId = Number(row.CONSTITUENCY_ID);
    let area = byArea.get(areaId);
    if (!area && Number.isFinite(areaId)) {
      area = { id: areaId, recommended: 0, sanctioned: 0, completed: 0, recAmt: 0, sanAmt: 0 };
      byArea.set(areaId, area);
    }
    if (kind === 'recommended') {
      const amt = Number(row.RECOMMENDED_AMOUNT ?? 0);
      aggregate.recommended += 1;
      aggregate.recAmt += amt;
      if (area) { area.recommended += 1; area.recAmt += amt; }
    } else if (kind === 'sanctioned') {
      const amt = Number(row.SANCTION_AMOUNT ?? 0);
      aggregate.sanctioned += 1;
      aggregate.sanAmt += amt;
      if (area) { area.sanctioned += 1; area.sanAmt += amt; }
    } else {
      aggregate.completed += 1;
      if (area) area.completed += 1;
    }
  };

  // Recommended
  try {
    const rows = await fetchReportRows(stateId, REPORT_KEYS.recommended.key);
    for (const row of rows) addRecord(row, 'recommended');
  } catch { /* state skipped on upstream failure */ }

  // Sanctioned
  try {
    const rows = await fetchReportRows(stateId, REPORT_KEYS.sanctioned.key);
    for (const row of rows) addRecord(row, 'sanctioned');
  } catch { /* state skipped on upstream failure */ }

  // Completed
  try {
    const rows = await fetchReportRows(stateId, REPORT_KEYS.completed.key);
    for (const row of rows) addRecord(row, 'completed');
  } catch { /* state skipped on upstream failure */ }

  return { aggregate, byArea };
}

async function fetchConstituencies(stateId: number): Promise<{ id: number; name: string }[]> {
  try {
    const list = await fetchJson<Array<{ ID: number; CAPTION: string | null }>>(
      'getConstituencyData',
      { id: stateId }
    );
    return (list ?? [])
      .filter((item) => item && Number.isFinite(Number(item.ID)))
      .map((item) => ({ id: Number(item.ID), name: (item.CAPTION ?? '').trim() }));
  } catch {
    return [];
  }
}

async function aggregateState(stateId: number, stateName: string): Promise<StateData> {
  const { aggregate, byArea } = await fetchReportAggregates(stateId);
  const constituencies = await fetchConstituencies(stateId);

  const areas: AreaData[] = constituencies.map((c) => {
    const agg = byArea.get(c.id);
    return {
      id: c.id,
      name: c.name || 'Unknown',
      recommended: agg?.recommended ?? 0,
      sanctioned: agg?.sanctioned ?? 0,
      completed: agg?.completed ?? 0,
      recAmt: agg?.recAmt ?? 0,
      sanAmt: agg?.sanAmt ?? 0,
      riskLevel: computeRisk(agg?.sanctioned ?? 0, agg?.completed ?? 0),
    };
  });

  return {
    stateId,
    name: stateName,
    recommended: aggregate.recommended,
    sanctioned: aggregate.sanctioned,
    completed: aggregate.completed,
    recAmt: aggregate.recAmt,
    sanAmt: aggregate.sanAmt,
    riskLevel: computeRisk(aggregate.sanctioned, aggregate.completed),
    areas,
  };
}

async function runWarm() {
  if (warmPromise) return warmPromise;

  warmPromise = (async () => {
    const states = await fetchJson<Array<{ STATE_ID: number; STATE_NAME: string }>>(
      'getStateData',
      { uname: '0,0,0,2' }
    );
    const list = (states ?? []).filter((s) => s && Number.isFinite(Number(s.STATE_ID)));
    const unique = Array.from(new Map(list.map((s) => [Number(s.STATE_ID), s])).values());

    progress.total = unique.length;
    progress.done = 0;
    progress.running = true;
    progress.startedAt = new Date().toISOString();

    const results: StateData[] = [];
    const pool = async (arr: Array<{ STATE_ID: number; STATE_NAME: string }>, size: number) => {
      let i = 0;
      const workers = Array.from({ length: Math.min(size, arr.length) }, async () => {
        while (i < arr.length) {
          const item = arr[i];
          i += 1;
          try {
            const data = await aggregateState(Number(item.STATE_ID), String(item.STATE_NAME));
            results.push(data);
          } catch {
            progress.done += 1;
          }
        }
      });
      await Promise.all(workers);
    };

    await pool(unique, CONCURRENCY);

    results.sort((a, b) => a.stateId - b.stateId);
    memory = { updatedAt: new Date().toISOString(), states: results };
    progress.done = progress.total;
    progress.running = false;
    saveToFile();
  })()
    .catch((err) => {
      progress.running = false;
      progress.done = 0;
      throw err;
    })
    .finally(() => {
      warmPromise = null;
    });

  return warmPromise;
}

export function getSnapshot(): {
  states: StateData[];
  progress: StateMapProgress;
  updatedAt: string | null;
  ready: boolean;
  source: 'cache' | 'warming' | 'fresh' | 'empty';
} {
  let current = memory;
  if (!isFresh(current)) {
    const file = loadFromFile();
    if (isFresh(file)) {
      memory = file;
      current = file;
    }
  }

  const ready = isFresh(current);
  const states = current.states;

  if (!ready && !progress.running) {
    void runWarm().catch(() => { /* warm failure surfaces via progress */ });
  }

  const source = progress.running ? 'warming' : states.length > 0 ? 'fresh' : 'empty';
  return {
    states,
    progress: { ...progress },
    updatedAt: current.updatedAt,
    ready,
    source,
  };
}

export async function warmSnapshotNow(force = true): Promise<void> {
  if (force) {
    memory = { updatedAt: null, states: [] };
    progress.done = 0;
  }
  await runWarm();
}