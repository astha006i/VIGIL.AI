'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AreaData, RiskLevel, StateData, StateMapResponse } from '@/lib/mplads';
import type { IndiaStateShape } from '@/lib/india-map';
import { INDIA_STATE_SHAPES, INDIA_MAP_VIEW } from '@/lib/india-map';
import { INDIA_AREA_POINTS, type IndiaAreaPoint } from '@/lib/india-areas';

const normName = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');
const normArea = (s: string) =>
  normName(String(s).replace(/\((ST|SC|GEN|RESERVED|UNRESERVED)\)/gi, ''))
    .replace(/(HP|UP|MH|WB|RJ|BR|MP|KA|TS)_?$/i, '')
    .replace(/^CHANDINI|^CHANDNI/, 'CHANDNI');

// Map an MPLADS-API area name (normalized) to the parliamentary-geometry point
// key (normalized) when the default normalization alone doesn't line up.
const AREA_ALIASES: Record<string, string> = {
  BHATINDA: 'BATHINDA',
  ANAKAPALLE: 'ANAKAPALLI',
  ARAKU: 'ARUKU',
  NARASAPURAM: 'NARSAPURAM',
  DARRANGUDALGURI: 'MANGALDOI',
  DIPHU: 'DIPHUST',
  KAZIRANGA: 'TEZPUR',
  SONITPUR: 'TEZPUR',
  CHANDINICHOWK: 'CHANDNICHOWK',
  CHANDINI: 'CHANDNI',
  SONEPAT: 'SONIPAT',
  HAMIRPUR: 'HAMIRPUR',
  ANANTNAG: 'ANANTNAGRAJOURI',
  BARAMULLAH: 'BARAMULLA',
  PALAMU: 'PALAMAU',
  CHIKBALLAPUR: 'CHIKKBALLAPUR',
  AURANGABAD: 'AURANGABAD',
  AHMEDNAGAR: 'AHMADNAGAR',
  TURA: 'TURAST',
  SHILLONG: 'SHILLONGST',
  BIKANER: 'BIKANERSC',
  DHARAMAPURI: 'DHARMAPURI',
  TIRUVALLUR: 'THIRUVALLUR',
  NAINITALUDHAMSINGHNAG: 'NAINITALUDHAMSINGHNAGAR',
  MAHARAJGANJ: 'MAHARAJGANJ',
  ARAMBAG: 'ARAMBAGH',
  SREERAMPUR: 'SRERAMPUR',
  BARRACKPUR: 'BARRACKPORE',
  ANDAMANANDNICOBARISLANDS: 'ANDAMANNICOBARISLANDS',
  SECUNDERABAD: 'SECUNDRABAD',
  MAHABUBNAGAR: 'MAHBUBNAGAR',
  CHELVELLA: 'CHEVELLA',
  WARANGEL: 'WARANGAL',
  BATHINDA: 'BATHINDA',
  AUTONOMOUSDISTRICT: 'AUTONOMOUSDISTRICT',
};

const stateFill = (level: RiskLevel): string => {
  switch (level) {
    case 'green':
      return 'fill-[#bbf7d0] stroke-[#16a34a]/70 hover:fill-[#86efac] cursor-pointer';
    case 'amber':
      return 'fill-[#fde68a] stroke-[#d97706]/70 hover:fill-[#fcd34d] cursor-pointer';
    case 'red':
      return 'fill-[#fecaca] stroke-[#dc2626]/70 hover:fill-[#fca5a5] cursor-pointer';
    default:
      return 'fill-[#e5e7eb] stroke-[#9ca3af]/60';
  }
};

const markerFill = (level: RiskLevel): string => {
  switch (level) {
    case 'green':
      return 'fill-[#16a34a] stroke-white';
    case 'amber':
      return 'fill-[#d97706] stroke-white';
    case 'red':
      return 'fill-[#dc2626] stroke-white';
    default:
      return 'fill-[#9ca3af] stroke-white';
  }
};

interface Tooltip {
  title: string;
  rows: Array<{ k: string; v: string }>;
}

export default function IndiaRiskMap() {
  const [data, setData] = useState<StateMapResponse | null>(null);
  const [selectedStateKey, setSelectedStateKey] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const stateByNorm = useMemo(() => {
    const map = new Map<string, IndiaStateShape>();
    for (const [k, v] of Object.entries(INDIA_STATE_SHAPES)) {
      map.set(normName(k), v);
      map.set(normName(v.name), v);
    }
    return map;
  }, []);

  const states = useMemo(
    () => (data?.states ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  const stateDataByKey = useMemo(() => {
    const map = new Map<string, StateData>();
    for (const s of data?.states ?? []) map.set(normName(s.name), s);
    return map;
  }, [data]);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async (refresh = false) => {
      try {
        const url = refresh
          ? '/api/mplads/state-map?refresh=1'
          : '/api/mplads/state-map';
        const res = await fetch(url, { cache: 'no-store' });
        const json = (await res.json()) as StateMapResponse;
        if (alive) setData(json);
        if (!refresh && (!json.ready || json.source === 'warming')) {
          timer = setTimeout(() => void load(false), 5000);
        }
      } catch {
        if (alive) timer = setTimeout(() => void load(false), 8000);
      }
    };
    void load(false);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const selectedStateData: StateData | undefined = selectedStateKey
    ? stateDataByKey.get(normName(selectedStateKey))
    : undefined;

  const selectedShape = selectedStateKey
    ? stateByNorm.get(normName(selectedStateKey)) ?? null
    : null;

  const areaPoints: IndiaAreaPoint[] = selectedStateKey
    ? INDIA_AREA_POINTS[normName(selectedStateKey)] ?? []
    : [];

  const selectedArea: AreaData | undefined = useMemo(
    () =>
      selectedAreaId !== null && selectedStateData
        ? selectedStateData.areas.find((a) => a.id === selectedAreaId)
        : undefined,
    [selectedAreaId, selectedStateData]
  );

  const viewBox = useMemo(() => {
    if (!selectedShape) return `0 0 ${INDIA_MAP_VIEW.width} ${INDIA_MAP_VIEW.height}`;
    const [x0, y0, x1, y1] = selectedShape.b;
    const pad = 60;
    const bx = Math.max(0, x0 - pad);
    const by = Math.max(0, y0 - pad);
    return `${bx} ${by} ${x1 + pad - bx} ${y1 + pad - by}`;
  }, [selectedShape]);

  const handleStateClick = useCallback((key: string) => {
    setSelectedStateKey(key);
    setSelectedAreaId(null);
    setTooltip(null);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedStateKey(null);
    setSelectedAreaId(null);
    setTooltip(null);
  }, []);

  const progressPct = data?.progress?.total
    ? Math.round(((data.progress.done ?? 0) / data.progress.total) * 100)
    : 0;

  const statusText = useMemo(() => {
    if (!data) return { text: 'Loadingâ€¦', cls: 'text-on-surface-variant' };
    if (data.states.length === 0 || data.source === 'warming') {
      return {
        text: `Warming live dataâ€¦ ${progressPct}% states mapped`,
        cls: 'text-amber-700',
      };
    }
    if (data.updatedAt) {
      const d = new Date(data.updatedAt);
      return {
        text: `Live Â· updated ${d.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        cls: 'text-secondary',
      };
    }
    return { text: 'Live', cls: 'text-secondary' };
  }, [data, progressPct]);

  return (
    <div className="flex flex-col gap-2 min-h-0 min-w-0 flex-1">
      {/* Status + legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className={`text-[11px] font-medium flex items-center gap-1.5 ${statusText.cls}`}>
          <span className="material-symbols-outlined text-sm">monitoring</span>
          {statusText.text}
        </div>
        <div className="flex items-center gap-3 text-[11px] font-medium text-on-surface-variant">
          <p className="text-[9px] uppercase tracking-wider text-outline">
            Completion
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-success/80" /> &ge;50%
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> 25â€“50%
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-error/80" /> &lt;25%
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 shrink-0">
        <label className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">map</span>
          <select
            value={selectedStateData?.name ?? ''}
            onChange={(e) => {
              const name = e.target.value;
              if (!name || !stateByNorm.has(normName(name))) {
                handleBack();
                return;
              }
              handleStateClick(normName(name));
            }}
            className="max-w-[200px] rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All India</option>
            {states.map((s) => (
              <option key={s.stateId} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <select
            value={selectedArea?.name ?? ''}
            onChange={(e) => {
              const name = e.target.value;
              const area = selectedStateData?.areas.find(
                (a) => a.name === name
              );
              setSelectedAreaId(area ? area.id : null);
            }}
            disabled={!selectedStateData}
            className="max-w-[200px] rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs text-on-surface disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All areas</option>
            {(selectedStateData?.areas ?? [])
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
          </select>
        </label>
        {selectedStateKey && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 rounded-md border border-outline-variant px-2 py-1 text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            All India
          </button>
        )}
      </div>

      {/* Map */}
      <div className="relative flex-1 min-h-[180px] bg-surface-container-low rounded-lg border border-outline-variant overflow-hidden">
        <svg
          viewBox={viewBox}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* In state mode: only the selected state rendered; else all states */}
          {!selectedStateKey &&
            Object.entries(INDIA_STATE_SHAPES).map(([key, shape]) => {
              const live = stateDataByKey.get(normName(key));
              return (
                <path
                  key={key}
                  d={shape.d}
                  className={`${stateFill(live?.riskLevel ?? 'na')} transition-colors`}
                  onClick={() => handleStateClick(key)}
                  onMouseMove={() => setTooltip(shapeTooltip(shape.name, live))}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}

          {selectedStateKey && selectedShape && (
            <path
              d={selectedShape.d}
              className={`${stateFill(selectedStateData?.riskLevel ?? 'na')} transition-colors`}
              onMouseMove={() =>
                setTooltip(shapeTooltip(selectedShape.name, selectedStateData))
              }
              onMouseLeave={() => setTooltip(null)}
            />
          )}

          {selectedStateKey &&
            areaPoints.map((p) => {
              const live = selectedStateData?.areas.find(
                (a) => normArea(a.name) === normArea(p.name) ||
                  AREA_ALIASES[normArea(a.name)] === normArea(p.name)
              );
              return (
                <circle
                  key={p.key + p.x + p.y}
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  className={`${markerFill(live?.riskLevel ?? 'na')} cursor-pointer`}
                  onClick={() => live && setSelectedAreaId(live.id)}
                  onMouseMove={() =>
                    setTooltip({
                      title: p.name,
                      rows: live
                        ? [
                            { k: 'Sanctioned', v: live.sanctioned.toLocaleString('en-IN') },
                            { k: 'Completed', v: live.completed.toLocaleString('en-IN') },
                            {
                              k: 'Completion',
                              v: pct(live.completed, live.sanctioned),
                            },
                          ]
                        : [{ k: 'Status', v: 'no data' }],
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
        </svg>

        {tooltip && (
          <div className="absolute z-20 pointer-events-none bg-surface-container-lowest p-2 rounded-md shadow-lg border border-outline-variant text-xs min-w-[130px] max-w-[230px]"
            style={{ left: 12, top: 12 }}
          >
            <h4 className="font-bold text-on-surface mb-1 border-b border-outline-variant pb-1">
              {tooltip.title}
            </h4>
            <div className="space-y-0.5">
              {tooltip.rows.map((r) => (
                <div key={r.k} className="flex justify-between gap-3">
                  <span className="text-on-surface-variant">{r.k}</span>
                  <span className="font-medium text-on-surface">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!data || data.states.length === 0) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-container-low/50 text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl animate-spin">
              progress_activity
            </span>
            <span className="text-xs max-w-[220px] text-center">
              Aggregating live MPLADS works â€” takes a few minutes.
            </span>
          </div>
        )}
      </div>

      {/* Detail panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
        <div className="bg-surface-container-lowest rounded-md border border-outline-variant p-2.5 min-h-[86px]">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1 truncate">
            {selectedArea
              ? `${selectedArea.name} Â· ${selectedStateData?.name}`
              : selectedStateData?.name ?? 'Selection'}
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <Stat label="Sanctioned" value={selectedArea ? selectedArea.sanctioned : selectedStateData?.sanctioned} />
            <Stat label="Completed" value={selectedArea ? selectedArea.completed : selectedStateData?.completed} />
            <div>
              <p className="text-base leading-tight font-bold text-on-surface">
                {selectedArea
                  ? pct(selectedArea.completed, selectedArea.sanctioned)
                  : selectedStateData
                    ? pct(selectedStateData.completed, selectedStateData.sanctioned)
                    : 'â€”'}
              </p>
              <p className="text-[10px] text-on-surface-variant">Completed %</p>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-md border border-outline-variant p-2.5 min-h-[86px]">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">
            {selectedArea ? 'Area detail' : selectedStateData ? 'State detail' : 'All India'}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <div>
              <p className="text-sm leading-tight font-bold text-on-surface">
                {inr(selectedArea ? selectedArea.sanAmt : selectedStateData?.sanAmt ?? 0)}
              </p>
              <p className="text-[10px] text-on-surface-variant">Sanctioned amount</p>
            </div>
            <div>
              <p className="text-sm leading-tight font-bold text-on-surface">
                {inr(selectedArea ? selectedArea.recAmt : selectedStateData?.recAmt ?? 0)}
              </p>
              <p className="text-[10px] text-on-surface-variant">Recommended amount</p>
            </div>
            <div className="col-span-2 mt-0.5">
              <span
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  riskPill(selectedArea?.riskLevel ?? selectedStateData?.riskLevel)
                }`}
              >
                {riskLabel(selectedArea?.riskLevel ?? selectedStateData?.riskLevel)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div>
      <p className="text-base leading-tight font-bold text-on-surface">
        {value === undefined ? 'â€”' : value.toLocaleString('en-IN')}
      </p>
      <p className="text-[10px] text-on-surface-variant">{label}</p>
    </div>
  );
}

function shapeTooltip(name: string, live?: StateData): Tooltip {
  if (!live) return { title: name, rows: [{ k: 'Status', v: 'warmingâ€¦' }] };
  return {
    title: name,
    rows: [
      { k: 'Sanctioned', v: live.sanctioned.toLocaleString('en-IN') },
      { k: 'Completed', v: live.completed.toLocaleString('en-IN') },
      { k: 'Completion', v: pct(live.completed, live.sanctioned) },
    ],
  };
}

function pct(part: number, whole: number): string {
  if (!whole) return 'â€”';
  return `${Math.round((part / whole) * 100)}%`;
}

function inr(v: number): string {
  return v >= 1e7
    ? `â‚¹${(v / 1e7).toFixed(1)} Cr`
    : v >= 1e5
      ? `â‚¹${(v / 1e5).toFixed(1)} L`
      : `â‚¹${v.toLocaleString('en-IN')}`;
}

function riskLabel(level?: RiskLevel): string {
  switch (level) {
    case 'green':
      return 'Low risk';
    case 'amber':
      return 'Medium risk';
    case 'red':
      return 'High risk';
    default:
      return 'Risk n/a';
  }
}

function riskPill(level?: RiskLevel): string {
  switch (level) {
    case 'green':
      return 'bg-success/15 text-success';
    case 'amber':
      return 'bg-[#f59e0b]/15 text-[#d97706]';
    case 'red':
      return 'bg-error/15 text-error';
    default:
      return 'bg-outline/15 text-outline';
  }
}
