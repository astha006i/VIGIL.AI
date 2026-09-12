import { MPLADS_API_BASE } from '@/lib/mplads';

export const MPLADS_MAIN_URL = 'https://mplads.mospi.gov.in/digigov/dashboard.html';
export const MPLADS_DIGIGOV_BASE =
  'https://mplads.mospi.gov.in/rest/PreLoginDashboardData';

const SESSION_MAX_AGE_MS = 10 * 60 * 1000;

let sessionCookie: string | undefined;
let sessionExpires = 0;
let sessionLock: Promise<string | undefined> | undefined;

function collectCookies(headers: Headers): string | null {
  const parts: string[] = [];
  try {
    const arr = (headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.();
    if (arr) {
      for (const c of arr) parts.push(c.split(';')[0]);
    }
  } catch {
    /* fall through */
  }
  if (parts.length === 0) {
    const single = headers.get('set-cookie');
    if (single) {
      const tokens = single.split(/,(?=\s*[A-Za-z0-9_]+=)/);
      for (const t of tokens) parts.push(t.split(';')[0]);
    }
  }
  return parts.length ? parts.join('; ') : null;
}

export async function ensureSession(force = false): Promise<string | undefined> {
  if (!force && sessionCookie && sessionExpires > Date.now()) {
    return sessionCookie;
  }
  if (sessionLock) {
    return sessionLock;
  }
  sessionLock = (async () => {
    try {
      const res = await fetch(MPLADS_MAIN_URL, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
      const sc = collectCookies(res.headers);
      sessionCookie = sc || undefined;
      sessionExpires = Date.now() + SESSION_MAX_AGE_MS;
      return sessionCookie;
    } catch {
      sessionCookie = undefined;
      sessionExpires = 0;
      return undefined;
    } finally {
      sessionLock = undefined;
    }
  })();
  return sessionLock;
}

export async function postMpladsRaw<T = unknown>(
  endpoint: string,
  body: string,
  retryOnSession = true,
  timeoutMs = 120000
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
  };
  const cookie = await ensureSession();
  if (cookie) headers.Cookie = cookie;

  try {
    const res = await fetch(`${MPLADS_DIGIGOV_BASE}/${endpoint}`, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      throw new Error(`upstream HTTP ${res.status}`);
    }
    const buf = await res.arrayBuffer();
    const text = new TextDecoder('latin1').decode(buf);
    return JSON.parse(text) as T;
  } catch (err) {
    if (retryOnSession) {
      await ensureSession(true);
      return postMpladsRaw<T>(endpoint, body, false, timeoutMs);
    }
    throw err;
  }
}

export { MPLADS_API_BASE };