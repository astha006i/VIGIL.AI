'use client';

import { useMplads } from '@/lib/use-mplads';
import { normalizeTiles } from '@/lib/mplads';

export default function MpladsTiles() {
  const { data, loading, error } = useMplads<Record<string, unknown[]>>(
    'getTilesData'
  );

  const tiles = data ? normalizeTiles(data) : null;

  const recommended = tiles?.tiles.find((t) => t.key === 'Recommended');
  const sanctioned = tiles?.tiles.find((t) => t.key === 'Sanctioned');
  const completed = tiles?.tiles.find((t) => t.key === 'Completed');
  const allocated = tiles?.tiles.find((t) => t.key === 'Allocated Limit');
  const expenditure = tiles?.tiles.find((t) => t.key === 'Expenditure');

  const recommendedValue = recommended?.values?.[0] ?? '—';
  const completedValue = completed?.values?.[0] ?? '—';
  const sanctionedValue = sanctioned?.values?.[0] ?? '—';
  const allocatedValue = allocated?.values?.[1] ?? allocated?.value ?? '—';
  const expenditureValue = expenditure?.values?.[1] ?? expenditure?.value ?? '—';

  const completionPct =
    recommended && completed && Number(completedValue.replace(/,/g, '')) > 0
      ? Math.round(
          (Number(completedValue.replace(/,/g, '')) /
            Number(recommendedValue.replace(/,/g, ''))) *
            100
        )
      : 0;

  if (error) {
    return (
      <div className="col-span-4 rounded-lg border border-error/30 bg-error-container/20 p-3 text-sm text-on-surface">
        Unable to load live MPLADS data. Showing placeholder; official server
        may be unreachable.
      </div>
    );
  }

  if (!tiles || loading) {
    return (
      <>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-outline-variant p-3 animate-pulse bg-surface-container-lowest shadow-sm"
          >
            <div className="h-3 w-24 bg-outline/30 rounded mb-2" />
            <div className="h-6 w-20 bg-outline/30 rounded" />
          </div>
        ))}
      </>
    );
  }

  const cards = [
    {
      label: 'Works Recommended',
      value: recommendedValue,
      sub: 'Projects Recommended',
      icon: 'bar_chart',
      iconBg: 'bg-secondary-container/30',
      iconText: 'text-secondary',
      bar: 'bg-secondary',
      trend: false,
    },
    {
      label: 'Allocated Limit',
      value: allocatedValue,
      sub: 'Total Allocated',
      icon: 'currency_rupee',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600',
      bar: 'bg-[#f59e0b]',
      trend: false,
    },
    {
      label: 'Works Sanctioned',
      value: sanctionedValue,
      sub: 'Projects Sanctioned',
      icon: 'verified_user',
      iconBg: 'bg-error-container/50',
      iconText: 'text-error',
      bar: 'bg-error',
      trend: false,
    },
    {
      label: 'Project Completion',
      value: `${completionPct}%`,
      sub: `${expenditureValue} spent`,
      icon: 'check_circle',
      iconBg: 'bg-secondary-container/30',
      iconText: 'text-secondary',
      bar: 'bg-secondary',
      trend: false,
    },
  ];

  return (
    <>
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm p-3 relative overflow-hidden min-w-0"
        >
          <div className={`absolute top-0 left-0 w-full h-1 ${c.bar}`} />
          <div className="flex justify-between items-start gap-2 mb-1">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                {c.label}
              </p>
              <h2 className="text-[26px] leading-[30px] font-bold text-on-surface truncate">
                {c.value}
              </h2>
              <p className="text-[11px] text-outline mt-0.5 truncate">{c.sub}</p>
            </div>
            <div
              className={`w-9 h-9 rounded-full ${c.iconBg} flex items-center justify-center ${c.iconText} shrink-0`}
            >
              <span className="material-symbols-outlined text-lg">{c.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
