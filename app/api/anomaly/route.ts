import { NextRequest, NextResponse } from 'next/server';
import { fetchWorkRecords } from '@/lib/server/anomaly-fetch';
import type { AnomalyResponse } from '@/lib/mplads';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CACHE_TTL_MS = 15 * 60 * 1000;
const ANOMALY_SERVICE_URL =
  process.env.ANOMALY_SERVICE_URL ?? 'http://127.0.0.1:8000';

interface CacheEntry {
  at: number;
  body: AnomalyResponse;
}
const cache = new Map<string, CacheEntry>();

async function callPythonService(
  state: string | null,
  stateId: number,
  records: unknown[],
  signal?: AbortSignal
): Promise<AnomalyResponse | null> {
  try {
    const res = await fetch(`${ANOMALY_SERVICE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, state_id: stateId, records }),
      signal,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as AnomalyResponse;
    return json;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const stateId = Number(req.nextUrl.searchParams.get('state'));
  const refresh = req.nextUrl.searchParams.get('refresh') === '1';
  if (!Number.isFinite(stateId) || stateId <= 0) {
    return NextResponse.json({ error: 'A valid state id is required' }, { status: 400 });
  }

  const key = String(stateId);
  const hit = cache.get(key);
  if (!refresh && hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.body);
  }

  const stateName = req.nextUrl.searchParams.get('stateName') ?? null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 170000);

  let body: AnomalyResponse;
  try {
    const { records } = await fetchWorkRecords(stateId, stateName ?? '');
    const service = await callPythonService(stateName, stateId, records, controller.signal);

    if (service && service.anomalies) {
      body = { ...service, state: stateName ?? service.state, service: 'python' };
    } else {
      body = {
        state: stateName,
        state_id: stateId,
        scanned_at: new Date().toISOString(),
        anomalies: [],
        kpis: { total: 0, high_risk: 0, projects_affected: 0, avg_risk: 0 },
        total_records: records.length,
        service: 'fallback-unavailable',
      };
    }
  } finally {
    clearTimeout(timeout);
  }

  cache.set(key, { at: Date.now(), body });
  return NextResponse.json(body);
}
