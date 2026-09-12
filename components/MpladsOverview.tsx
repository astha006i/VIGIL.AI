'use client';

import { useMplads } from '@/lib/use-mplads';
import { normalizeTiles, type MpladsTile } from '@/lib/mplads';

const HOUSE_COLORS = [
  { id: 'Recommended', color: '#2ec7c9', bg: '#e6fbfb' },
  { id: 'Sanctioned', color: '#2f86eb', bg: '#eaf3fc' },
  { id: 'Completed', color: '#0d2b45', bg: '#e8edf2' },
];

function parseAmount(values: string[]): number {
  const idx = values.findIndex((v) => v.includes('Crore'));
  if (idx >= 0) {
    const s = values[idx].replace(/[^\d.]+/g, '');
    return Number(s) || 0;
  }
  return 0;
}

function parseCount(values: string[]): number {
  const s = values[0]?.replace(/,/g, '');
  return Number(s) || 0;
}

function fmt(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function MpladsOverview() {
  const { data, loading, error } = useMplads<Record<string, unknown[]>>(
    'getTilesData'
  );

  const tiles = data ? normalizeTiles(data) : null;

  const byKey = (key: string): MpladsTile | undefined =>
    tiles?.tiles.find((t) => t.key === key);

  const recommended = byKey('Recommended');
  const sanctioned = byKey('Sanctioned');
  const completed = byKey('Completed');

  const recAmt = recommended ? parseAmount(recommended.values) : 0;
  const sanAmt = sanctioned ? parseAmount(sanctioned.values) : 0;
  const comAmt = completed ? parseAmount(completed.values) : 0;
  const totalAmt = recAmt + sanAmt + comAmt || 1;

  const donutSegs =
    recAmt + sanAmt + comAmt > 0
      ? [
          { name: 'Recommended', value: recAmt, ...HOUSE_COLORS[0] },
          { name: 'Sanctioned', value: sanAmt, ...HOUSE_COLORS[1] },
          { name: 'Completed', value: comAmt, ...HOUSE_COLORS[2] },
        ]
      : [];

  if (error) {
    return (
      <div className="rounded-xl border border-error/30 bg-error-container/20 p-4 text-sm text-on-surface">
        Unable to load live MPLADS data. The official server may be
        unreachable.
      </div>
    );
  }

  if (loading || !tiles || donutSegs.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 animate-pulse">
        <div className="h-5 w-56 bg-outline/30 rounded mb-3" />
        <div className="flex gap-6">
          <div className="w-36 h-36 rounded-full bg-outline/20" />
          <div className="flex-1 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 bg-outline/20 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 54;
  let cumulative = 0;

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-soft p-4 flex flex-col min-h-0">
      <div className="flex justify-between items-center gap-3 mb-3 flex-none">
        <div>
          <h3 className="text-base font-bold text-[#001f3f]">
            MPLADS National Overview
          </h3>
          <p className="text-[11px] text-on-surface-variant">
            Live from mplads.mospi.gov.in · {tiles.currentTenure || 'e-SAKSHI'}
          </p>
        </div>
        <span className="text-[11px] font-medium text-[#1b6d24] bg-[rgba(232,245,233,1)] px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1b6d24] animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex gap-5 items-center flex-1 min-h-0">
        <div className="shrink-0">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
              <circle cx="70" cy="70" r="54" fill="none" stroke="#e0e0e0" strokeWidth="18" />
              {donutSegs.map((seg) => {
                const len = (seg.value / totalAmt) * circumference;
                const dashoffset = -cumulative;
                cumulative += len;
                return (
                  <circle
                    key={seg.name}
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="18"
                    strokeDasharray={`${len} ${circumference - len}`}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Works</span>
              <span className="text-xl font-bold text-[#001f3f]">
                {fmt(parseCount(recommended?.values ?? []))}
              </span>
            </div>
          </div>
          <p className="text-center text-[10px] text-on-surface-variant mt-1">
            Works Recommended total
          </p>
        </div>

        <div className="flex-1 min-w-0 grid gap-2.5">
          {donutSegs.map((seg) => (
            <div
              key={seg.name}
              className="flex items-center justify-between border-b border-outline-variant/60 pb-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: seg.color }}
                />
                <span className="text-[13px] font-medium text-on-surface truncate">
                  Works {seg.name}
                </span>
              </div>
              <div className="text-right shrink-0 pl-2">
                <div className="text-[13px] font-bold text-on-surface">
                  ₹{seg.value.toFixed(2)} Cr
                </div>
                <div className="text-[10px] text-on-surface-variant">
                  {(() => {
                    const tile = byKey(seg.name);
                    return `${fmt(parseCount(tile?.values ?? []))} works`;
                  })()}
                </div>
              </div>
            </div>
          ))}
          <p className="text-[10px] text-outline pt-0.5">
            Source: Ministry of Statistics &amp; Programme Implementation · e-SAKSHI Portal
          </p>
        </div>
      </div>
    </div>
  );
}