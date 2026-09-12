'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AnomalyResponse,
  StateData,
  StateMapResponse,
} from '@/lib/mplads';

const TABS = [
  { icon: 'monitoring', label: 'All Anomalies', type: null },
  { icon: 'attach_money', label: 'Cost Overrun', type: 'Cost Overrun' },
  { icon: 'file_copy', label: 'Duplicate Work', type: 'Duplicate Work' },
  { icon: 'schedule', label: 'Delay Prediction', type: 'Delay Prediction' },
  { icon: 'fact_check', label: 'Compliance Issue', type: 'Compliance Issue' },
  { icon: 'psychology', label: 'NLP Flag', type: 'NLP Flag' },
];

const TYPE_COLOR: Record<string, string> = {
  'Cost Overrun': 'text-[#ef4444]',
  'Duplicate Work': 'text-[#f59e0b]',
  'Delay Prediction': 'text-[#8b5cf6]',
  'Compliance Issue': 'text-[#3b82f6]',
  'NLP Flag': 'text-[#e11d92]',
};

const TYPE_BADGE: Record<string, string> = {
  'Cost Overrun': 'text-[#ef4444] bg-[rgba(239,68,68,0.1)]',
  'Duplicate Work': 'text-[#b45309] bg-[rgba(245,158,11,0.15)]',
  'Delay Prediction': 'text-[#7c3aed] bg-[rgba(139,92,246,0.12)]',
  'Compliance Issue': 'text-[#1d4ed8] bg-[rgba(59,130,246,0.12)]',
  'NLP Flag': 'text-[#be185d] bg-[rgba(225,29,146,0.12)]',
};

function riskColor(risk: number) {
  if (risk >= 75) return { icon: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]', badge: 'bg-[#ef4444] text-white' };
  if (risk >= 60) return { icon: 'bg-[rgba(245,158,11,0.1)] text-[#f59e0b]', badge: 'bg-[rgba(245,158,11,0.15)] text-[#b45309]' };
  return { icon: 'bg-[rgba(59,130,246,0.1)] text-[#3b82f6]', badge: 'bg-[rgba(59,130,246,0.15)] text-[#1d4ed8]' };
}

function formatter(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);
}

function formatDateLabel(d: string): string {
  if (!d) return 'N/A';
  const parsed = new Date(d);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  return d;
}

export default function AnomalyPage() {
  const [activeTab, setActiveTab] = useState<string>('All Anomalies');
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('30');
  const [states, setStates] = useState<StateData[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [data, setData] = useState<AnomalyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/mplads/state-map', { cache: 'no-store' })
      .then((r) => r.json())
      .then((json: StateMapResponse) => {
        if (alive) {
          const list = (json?.states ?? [])
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name));
          setStates(list);
          if (list.length) {
            setSelectedStateId((current) => current ?? list[0].stateId);
          }
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const loadAnomalies = useCallback(
    async (stateId: number, force = false) => {
      const state = states.find((s) => s.stateId === stateId);
      if (!state) return;
      setLoading(true);
      setError(null);
      try {
        const url = `/api/anomaly?state=${stateId}&stateName=${encodeURIComponent(state.name)}${force ? '&refresh=1' : ''}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = (await res.json()) as AnomalyResponse;
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [states]
  );

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedStateId(id);
    setData(null);
  };

  useEffect(() => {
    if (selectedStateId) void loadAnomalies(selectedStateId);
  }, [selectedStateId, loadAnomalies]);

  const handleRefresh = () => {
    if (selectedStateId) void loadAnomalies(selectedStateId, true);
  };

  const anomalies = useMemo(() => data?.anomalies ?? [], [data]);
  const filteredByTab = useMemo(() => {
    const tab = TABS.find((t) => t.label === activeTab);
    if (!tab?.type) return anomalies;
    return anomalies.filter((a) => a.type === tab.type);
  }, [anomalies, activeTab]);

  const filtered = useMemo(() => {
    let list = filteredByTab;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.project.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          (a.constituency ?? '').toLowerCase().includes(q) ||
          (a.snippet ?? '').toLowerCase().includes(q)
      );
    }
    const days = Number(dateFilter);
    if (Number.isFinite(days)) {
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      list = list.filter((a) => {
        if (!a.date) return true;
        const d = new Date(a.date);
        return Number.isNaN(d.getTime()) ? true : d.getTime() >= cutoff;
      });
    }
    return list.sort(
      (a, b) =>
        (b.risk ?? 0) - (a.risk ?? 0) ||
        (new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    );
  }, [filteredByTab, query, dateFilter]);

  const kpis = useMemo(
    () => [
      {
        label: 'Total Anomalies',
        value: formatter(data?.kpis.total ?? 0),
        icon: 'warning',
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.1)',
        sub: `${formatter(data?.total_records ?? 0)} records scanned`,
      },
      {
        label: 'High Risk',
        value: formatter(data?.kpis.high_risk ?? 0),
        icon: 'warning_amber',
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.1)',
        sub: data?.kpis.high_risk && data?.kpis.total ? `${Math.round((data.kpis.high_risk / data.kpis.total) * 100)}% of anomalies` : 'No high risk',
      },
      {
        label: 'Projects Affected',
        value: formatter(data?.kpis.projects_affected ?? 0),
        icon: 'assignment_late',
        color: '#8b5cf6',
        bg: 'rgba(139,92,246,0.1)',
        sub: 'distinct works flagged',
      },
      {
        label: 'Avg. Risk Score',
        value: `${data?.kpis.avg_risk ?? 0}/100`,
        icon: 'speed',
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.1)',
        sub: data?.service === 'python' ? 'Python/ML engine' : data?.service ?? '—',
      },
    ],
    [data]
  );

  const trendPoints = useMemo(() => {
    const groups = new Map<string, number>();
    for (const a of anomalies) {
      const d = a.date ? new Date(a.date) : null;
      const key = d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : 'unknown';
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }
    const entries = Array.from(groups.entries())
      .filter(([k]) => k !== 'unknown')
      .sort((a, b) => a[0].localeCompare(b[0]));
    return entries.slice(-14);
  }, [anomalies]);

  const heading =
    activeTab === 'All Anomalies' ? 'High Risk Anomalies' : `${activeTab} Projects`;

  return (
    <div className="flex flex-col h-full gap-3 md:gap-4 p-3 md:p-4 overflow-hidden">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-3 flex-none">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-[13px] leading-[18px] text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
            placeholder="Search anomalies (project, ID, constituency)..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedStateId ?? ''}
            onChange={handleStateChange}
            className="px-3 py-2 bg-white border border-outline-variant rounded-lg text-[13px] text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {states.length === 0 && <option value="">Loading states...</option>}
            {states.map((s) => (
              <option key={s.stateId} value={s.stateId}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-outline-variant rounded-lg text-[13px] text-on-surface focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
            <option value="0">All time</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-outline-variant rounded-lg text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            {loading ? 'Scanning…' : 'Rescan'}
          </button>
        </div>
      </div>

      {/* Loading / Error strip */}
      {loading && (
        <div className="flex-none flex items-center gap-2 text-sm text-primary bg-[rgba(27,109,36,0.06)] border border-primary/20 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
          Scanning live MPLADS records for {states.find((s) => s.stateId === selectedStateId)?.name ?? 'state'}… This can take ~10-15s on a first scan.
        </div>
      )}
      {error && (
        <div className="flex-none flex items-center gap-2 text-sm text-[#ef4444] bg-[rgba(239,68,68,0.06)] border border-[#ef4444]/20 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-base">error_outline</span>
          Failed to scan: {error}. Try a state below or rescan.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-none">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-3.5 relative overflow-hidden flex flex-col"
          >
            <div
              className="absolute top-0 left-0 w-full h-[3px]"
              style={{ backgroundColor: kpi.color }}
            />
            <div className="flex items-start justify-between mb-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: kpi.bg, color: kpi.color }}
              >
                <span className="material-symbols-outlined text-lg">{kpi.icon}</span>
              </div>
            </div>
            <h3 className="text-xs font-semibold text-on-surface-variant mb-0.5">{kpi.label}</h3>
            <div className="flex items-end gap-3 mb-0.5">
              <span className="text-2xl font-bold text-on-surface">{kpi.value}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-on-surface-variant text-xs">{kpi.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant flex overflow-x-auto no-scrollbar flex-none">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`flex items-center gap-1.5 px-3 py-2.5 border-b-2 whitespace-nowrap transition-colors text-[13px] ${
              tab.label === activeTab
                ? 'text-[#1b6d24] font-bold border-[#1b6d24] bg-[rgba(27,109,36,0.05)] rounded-t-lg'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50 font-semibold border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
            {tab.type && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-high text-on-surface-variant font-bold">
                {anomalies.filter((a) => a.type === tab.type).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left Column: List */}
        <div className="col-span-12 xl:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft flex flex-col min-h-0 overflow-hidden">
          <div className="p-2.5 border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-[15px] font-semibold text-on-surface">{heading}</h2>
            <span className="text-xs text-on-surface-variant">{filtered.length} shown</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!data && !loading && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant p-6">
                <span className="material-symbols-outlined text-3xl">folder_open</span>
                <p className="text-sm">Select a state to run live anomaly detection.</p>
              </div>
            )}
            {data && anomalies.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant p-6">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
                <p className="text-sm">No anomalies detected for this state with current thresholds.</p>
              </div>
            )}
            {filtered.map((item) => {
              const rc = riskColor(item.risk ?? 0);
              return (
                <div
                  key={item.id}
                  className="px-3 py-1 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors flex items-center gap-3 group"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${rc.icon} flex items-center justify-center shrink-0`}
                  >
                    <span className="material-symbols-outlined text-lg">warning</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-0">
                      <h4 className="font-bold text-on-surface truncate pr-4 text-[13px]">{item.id}</h4>
                      <span className="text-xs text-on-surface-variant shrink-0">{formatDateLabel(item.date)}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate mb-0">
                      {item.project} • {item.state}
                      {item.constituency ? ` • ${item.constituency}` : ''}
                    </p>
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${TYPE_BADGE[item.type] ?? ''}`}>
                        {item.type}
                      </span>
                      <span className={`font-bold ${TYPE_COLOR[item.type] ?? 'text-on-surface'}`}>
                        {item.risk}
                        <span className="text-xs font-normal text-on-surface-variant">/100</span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${rc.badge}`}>
                        {item.risk >= 75 ? 'High Risk' : item.risk >= 60 ? 'Medium Risk' : 'Low Risk'}
                      </span>
                      {item.amount != null && (
                        <span className="text-[11px] text-on-surface-variant">
                          ₹{formatter(item.amount)}
                        </span>
                      )}
                    </div>
                    {item.snippet && (
                      <p className="text-[11px] text-on-surface-variant italic truncate mt-0.5">{item.snippet}</p>
                    )}
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                    chevron_right
                  </span>
                </div>
              );
            })}
          </div>
          {filtered.length > 0 && (
            <div className="py-1.5 px-3 bg-surface-container-low border-t border-outline-variant flex justify-between items-center rounded-b-xl">
              <span className="text-xs text-on-surface-variant">
                {filtered.length} of {anomalies.length} anomalies
              </span>
              <span className="text-xs text-on-surface-variant">
                {data?.service === 'python' ? 'Python/ML engine' : 'Engine unavailable'}
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Analytics */}
        <div className="col-span-12 xl:col-span-5 flex flex-col gap-3 min-h-0">
          {/* Anomaly Trend */}
          <div className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant shadow-soft flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-1 flex-none">
              <h3 className="text-[15px] font-semibold text-on-surface">Anomaly Trend</h3>
              <span className="text-xs text-on-surface-variant">by scan date</span>
            </div>
            <div className="relative w-full flex-1 min-h-0">
              {trendPoints.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-on-surface-variant text-sm">
                  {loading ? 'Loading trend…' : 'No trend data yet'}
                </div>
              ) : (
                <TrendChart points={trendPoints} total={anomalies.length} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendChart({ points, total }: { points: [string, number][]; total: number }) {
  const max = Math.max(1, ...points.map(([, v]) => v));
  const yTicks = [100, 80, 60, 40, 20, 0];
  const svgPoints = points
    .map(([, v], i) => {
      const x = points.length === 1 ? 0 : (i / (points.length - 1)) * 100;
      const y = 90 - (v / max) * 75;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="relative w-full h-full">
      <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-outline text-right pr-2">
        {yTicks.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <div className="absolute left-8 top-2 bottom-6 flex flex-col justify-between pointer-events-none">
        {yTicks.map((t) => (
          <div key={t} className="w-full h-px bg-outline-variant/30" />
        ))}
      </div>
      <div className="absolute left-8 right-0 top-2 bottom-6">
        {points.length === 1 ? (
          <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
            {total} anomaly{total === 1 ? '' : 'ies'} on this scan
          </div>
        ) : (
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <polyline
              points={svgPoints}
              fill="none"
              stroke="#1b6d24"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            {points.map(([, v], i) => {
              const x = (i / (points.length - 1)) * 100;
              const y = 90 - (v / max) * 75;
              return <circle key={i} cx={x} cy={y} fill="#1b6d24" r="1.8" />;
            })}
          </svg>
        )}
      </div>
      <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between items-end text-[10px] text-outline px-2">
        {points.slice(0, 7).map(([d]) => (
          <span key={d}>{new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
        ))}
      </div>
    </div>
  );
}
