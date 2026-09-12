import { postMpladsRaw } from '@/lib/server/mplads-server';

export interface MpladsWorkRecord {
  WORK_RECOMMENDATION_DTL_ID?: number | null;
  STATE_NAME?: string | null;
  CONSTITUENCY?: string | null;
  CONSTITUENCY_ID?: number | null;
  ACTIVITY_NAME?: string | null;
  WORK_DESCRIPTION?: string | null;
  WORK_CATEGORY?: string | null;
  WORK_STAGE?: string | null;
  RECOMMENDED_AMOUNT?: number | null;
  SANCTION_AMOUNT?: number | null;
  RECOMMENDATION_DATE?: string | null;
  SANCTION_DATE?: string | null;
  LETTER_NO?: string | null;
  TENURE_START_DATE?: string | null;
  TENURE_END_DATE?: string | null;
  MP_NAME?: string | null;
  IDA_NAME?: string | null;
}

const WORK_KEYS = [
  'Works Recommended',
  'Works Sanctioned',
  'Works Completed',
] as const;

export async function fetchWorkRecords(
  stateId: number,
  stateName: string
): Promise<{ records: MpladsWorkRecord[]; tenureStart: string | null; tenureEnd: string | null }> {
  const all: MpladsWorkRecord[] = [];
  const seen = new Set<string>();
  let tenureStart: string | null = null;
  let tenureEnd: string | null = null;

  for (const key of WORK_KEYS) {
    let rows: MpladsWorkRecord[] = [];
    try {
      const raw = await postMpladsRaw<Record<string, string>>(
        'getTilesReportData',
        JSON.stringify({ combo: `${stateId},0,0,2`, key })
      );
      const first = Object.values(raw)[0];
      if (typeof first === 'string') {
        rows = JSON.parse(first.replace(/\u00a0/g, '₹')) as MpladsWorkRecord[];
      }
    } catch {
      rows = [];
    }
    if (!Array.isArray(rows)) continue;

    for (const row of rows) {
      const wid = row.WORK_RECOMMENDATION_DTL_ID;
      const dedupeKey =
        wid != null
          ? `id:${wid}`
          : `desc:${row.ACTIVITY_NAME ?? ''}:${row.RECOMMENDED_AMOUNT ?? ''}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      all.push({ ...row, STATE_NAME: stateName });
      if (row.TENURE_START_DATE) tenureStart = row.TENURE_START_DATE;
      if (row.TENURE_END_DATE) tenureEnd = row.TENURE_END_DATE;
    }
  }

  return { records: all, tenureStart, tenureEnd };
}
