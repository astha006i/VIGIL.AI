import { NextRequest, NextResponse } from 'next/server';
import {
  getSnapshot,
  warmSnapshotNow,
} from '@/lib/server/mplads-snapshot';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const refresh = req.nextUrl.searchParams.get('refresh') === '1';
  if (refresh) {
    await warmSnapshotNow(true);
  }
  const snapshot = getSnapshot();
  return NextResponse.json({
    source: snapshot.source,
    ready: snapshot.ready,
    updatedAt: snapshot.updatedAt,
    progress: snapshot.progress,
    states: snapshot.states,
  });
}