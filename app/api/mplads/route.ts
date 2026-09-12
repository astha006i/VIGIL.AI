import { NextRequest, NextResponse } from 'next/server';
import {
  MPLADS_API_BASE,
  MPLADS_ENDPOINTS,
  type MpladsEndpoint,
} from '@/lib/mplads';
import { ensureSession } from '@/lib/server/mplads-server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CACHE_TTL_MS = 3 * 60 * 1000;

interface CacheEntry {
  expires: number;
  body: unknown;
}

const cache = new Map<string, CacheEntry>();

function getCacheKey(endpoint: string, body: string): string {
  return `${endpoint}:${body}`;
}

export async function POST(req: NextRequest) {
  let rawBody: unknown = {};

  try {
    rawBody = await req.json();
  } catch {
    rawBody = {};
  }

  const record = rawBody as Record<string, unknown>;
  const endpoint = (record.endpoint ?? 'getTilesData') as MpladsEndpoint;
  const requested =
    typeof record.params === 'string'
      ? record.params
      : record.params === undefined
        ? ''
        : JSON.stringify(record.params);
  const body = requested || '{"uname":"0,0,0,2"}';

  if (!MPLADS_ENDPOINTS.includes(endpoint)) {
    return NextResponse.json({ error: 'Unknown endpoint' }, { status: 400 });
  }

  const cacheKey = getCacheKey(endpoint, body);
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) {
    return NextResponse.json({ source: 'cache', data: hit.body });
  }

  const url = `${MPLADS_API_BASE}/${endpoint}`;
  let json: unknown;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
    };
    const cookie = await ensureSession();
    if (cookie) headers.Cookie = cookie;
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error ${res.status}` },
        { status: 502 }
      );
    }
    const buf = await res.arrayBuffer();
    let text = new TextDecoder('latin1').decode(buf);
    try {
      json = JSON.parse(text);
      json = fixRupee(json);
    } catch {
      text = text.replace(/\u00a0/g, '₹');
      json = JSON.parse(text);
    }
  } catch (err) {
    const hitStale = cache.get(cacheKey);
    if (hitStale) {
      return NextResponse.json({ source: 'stale', data: hitStale.body });
    }
    return NextResponse.json(
      { error: `Failed to reach MPLADS server: ${String(err)}` },
      { status: 502 }
    );
  }

  cache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, body: json });
  return NextResponse.json({ source: 'live', data: json });
}

function fixRupee(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/\u00a0/g, '₹');
  }
  if (Array.isArray(value)) {
    return value.map(fixRupee);
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = fixRupee(v);
    }
    return out;
  }
  return value;
}
