'use client';

import MpladsTiles from '@/components/MpladsTiles';
import IndiaRiskMap from '@/components/IndiaRiskMap';

const HIGH_RISK_PROJECTS = [
  {
    name: 'Rural Road Connectivity',
    state: 'Bihar',
    risk: 'Critical',
    riskClass: 'bg-error text-on-error',
    funds: '₹128 Cr',
    status: 'Delayed',
    statusClass: 'text-error',
    trend: 'trending_up',
    trendClass: 'text-error',
  },
  {
    name: 'Smart City Infrastructure',
    state: 'Uttar Pradesh',
    risk: 'High',
    riskClass: 'bg-error-container text-on-error-container border border-error/20',
    funds: '₹215 Cr',
    status: 'Delayed',
    statusClass: 'text-error',
    trend: 'trending_up',
    trendClass: 'text-error',
  },
  {
    name: 'Water Supply Project',
    state: 'Madhya Pradesh',
    risk: 'High',
    riskClass: 'bg-error-container text-on-error-container border border-error/20',
    funds: '₹98 Cr',
    status: 'In Progress',
    statusClass: 'text-blue-600',
    trend: 'trending_up',
    trendClass: 'text-error',
  },
  {
    name: 'School Building Construction',
    state: 'Rajasthan',
    risk: 'Medium',
    riskClass: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    funds: '₹74 Cr',
    status: 'In Progress',
    statusClass: 'text-blue-600',
    trend: 'arrow_forward',
    trendClass: 'text-outline',
  },
  {
    name: 'Urban Drainage System',
    state: 'Kerala',
    risk: 'Low',
    riskClass: 'bg-secondary-container/50 text-on-secondary-container border border-secondary/20',
    funds: '₹62 Cr',
    status: 'On Track',
    statusClass: 'text-secondary',
    trend: 'trending_down',
    trendClass: 'text-secondary',
  },
];

const RISK_LEGEND = [
  { color: 'bg-error', label: 'Critical Risk', value: '25%' },
  { color: 'bg-orange-600', label: 'High Risk', value: '30%' },
  { color: 'bg-yellow-500', label: 'Medium Risk', value: '25%' },
  { color: 'bg-green-600', label: 'Low Risk', value: '20%' },
];

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden p-3 md:p-4 space-y-3 md:space-y-4">
      {/* Top Row Metrics (live MPLADS data) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 shrink-0">
        <MpladsTiles />
      </div>

      {/* Main Content: Left info column (30%) + Right map column (70%) */}
      <div className="grid grid-cols-1 md:grid-cols-[35%_1fr] lg:grid-cols-[30%_1fr] xl:grid-cols-[28%_1fr] gap-3 flex-1 min-h-0">
        {/* LEFT COLUMN — High Risk Projects (top) + AI Risk Distribution (bottom) */}
        <div className="order-last md:order-1 flex flex-col gap-3 min-h-0 min-w-0">
          {/* High Risk Projects Table */}
          <div className="flex-1 min-h-0 bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm flex flex-col overflow-hidden min-w-0">
            <div className="p-3 border-b border-outline-variant flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-on-surface">High Risk Projects</h3>
              <a
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                href="#"
              >
                View All{' '}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </a>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
              <table className="w-full text-xs">
                <thead className="bg-surface-container-low text-[10px] font-bold text-on-surface-variant uppercase align-middle">
                  <tr>
                    <th className="px-3 py-1.5 text-left">Project</th>
                    <th className="px-2 py-1.5 text-left">State</th>
                    <th className="px-2 py-1.5 text-left">Risk</th>
                    <th className="px-2 py-1.5 text-left">Funds</th>
                    <th className="px-2 py-1.5 text-left">Status</th>
                    <th className="px-2 py-1.5 text-center">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant bg-surface-container-lowest align-middle">
                  {HIGH_RISK_PROJECTS.map((p) => (
                    <tr key={p.name} className="hover:bg-surface-container-low/50">
                      <td className="px-3 py-1.5 font-medium text-on-surface leading-tight">
                        {p.name}
                      </td>
                      <td className="px-2 py-1.5 text-on-surface-variant leading-tight">
                        {p.state}
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${p.riskClass}`}
                        >
                          {p.risk}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-on-surface-variant whitespace-nowrap leading-tight">
                        {p.funds}
                      </td>
                      <td
                        className={`px-2 py-1.5 text-[11px] font-medium whitespace-nowrap leading-tight ${p.statusClass}`}
                      >
                        {p.status}
                      </td>
                      <td className={`px-2 py-1.5 text-center ${p.trendClass}`}>
                        <span className="material-symbols-outlined text-sm">{p.trend}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Risk Distribution Donut */}
          <div className="flex-1 min-h-0 bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm p-3 flex flex-col overflow-hidden min-w-0">
            <h3 className="text-sm font-bold text-on-surface mb-2 shrink-0">
              AI Risk Distribution
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden">
              <div className="relative w-28 h-28 mb-2 shrink-0">
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    background:
                      'conic-gradient(#dc2626 0% 25%, #ea580c 25% 55%, #eab308 55% 80%, #16a34a 80% 100%)',
                  }}
                />
                <div className="absolute inset-2 bg-surface-container-lowest rounded-full flex items-center justify-center border-4 border-surface-container-lowest shadow-inner">
                  <span className="material-symbols-outlined text-2xl text-primary">
                    psychology
                  </span>
                </div>
                <span className="absolute top-1/4 right-1.5 text-white text-[9px] font-bold drop-shadow-md">
                  25%
                </span>
                <span className="absolute bottom-3 right-1/4 text-white text-[9px] font-bold drop-shadow-md">
                  30%
                </span>
                <span className="absolute bottom-1/4 left-1.5 text-white text-[9px] font-bold drop-shadow-md">
                  25%
                </span>
                <span className="absolute top-1/4 left-5 text-white text-[9px] font-bold drop-shadow-md">
                  20%
                </span>
              </div>
              <div className="w-full space-y-1 text-xs">
                {RISK_LEGEND.map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`} />
                      <span className="text-on-surface-variant truncate">{item.label}</span>
                    </div>
                    <span className="font-medium shrink-0">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[9px] text-outline text-center mt-2 border-t border-outline-variant pt-1.5 shrink-0">
              AI models analyze 50+ risk factors in real time
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN — India Civic Risk Map (existing map, larger container) */}
        <div className="order-first md:order-2 h-full min-h-0 min-w-0 bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm p-3 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center gap-3 mb-2 shrink-0">
            <h3 className="text-lg leading-6 font-semibold text-on-surface flex items-center gap-2 min-w-0">
              <span className="truncate">India Civic Risk Map</span>
              <span className="material-symbols-outlined text-outline text-sm cursor-help shrink-0">
                info
              </span>
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container/40 text-secondary px-2 py-0.5 text-[10px] font-bold shrink-0">
              <span className="material-symbols-outlined text-[12px]">cached</span>
              Live MPLADS
            </span>
          </div>
          <IndiaRiskMap />
        </div>
      </div>
    </div>
  );
}