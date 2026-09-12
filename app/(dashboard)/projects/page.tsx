'use client';

import MpladsOverview from '@/components/MpladsOverview';

const OVERVIEW_ROWS = [
  { icon: 'badge', label: 'Project ID', value: 'MP-2024-1842' },
  { icon: 'description', label: 'Project Name', value: 'Community Hall Construction' },
  { icon: 'location_on', label: 'Location', value: 'Bhopal, Madhya Pradesh' },
  { icon: 'account_tree', label: 'Implementing Agency', value: 'Rural Development Department' },
];

const FINANCE_ROWS = [
  { icon: 'currency_rupee', label: 'Sanctioned Amount', value: '₹23,60,000', bold: true },
  { icon: 'payments', label: 'Expenditure', value: '₹17,85,000 (76%)', bold: true },
];

const DATE_ROWS = [
  { icon: 'event', label: 'Start Date', value: '12 Jan 2025' },
  { icon: 'event_available', label: 'Expected End Date', value: '30 Sep 2026' },
];

const TIMELINE = [
  { icon: 'check', done: true, title: 'Sanctioned', sub: '12 Jan 2025' },
  { icon: 'check', done: true, title: 'Work Started', sub: '25 Jan 2025' },
  { icon: 'check', done: true, title: 'Payment Released', sub: '14 Feb 2025' },
  { icon: 'settings', current: true, title: 'Current Progress', sub: '64%' },
  { icon: 'schedule', done: false, title: 'Expected Completion', sub: '30 Sep 2026' },
];

const RISK_BARS = [
  { label: 'Cost Risk', value: 89, className: 'progress-red' },
  { label: 'Delay Risk', value: 72, className: 'progress-orange' },
  { label: 'Fraud Risk', value: 83, className: 'progress-orange' },
  { label: 'Compliance Risk', value: 63, className: 'progress-orange' },
];

const KPIS = [
  {
    icon: 'currency_rupee',
    iconBg: 'bg-green-50',
    iconText: 'text-[#1b6d24]',
    bar: 'bg-[#1b6d24]',
    label: 'Budget Utilization',
    value: '76%',
    sub: '₹17.85L of ₹23.60L',
  },
  {
    icon: 'schedule',
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
    bar: 'bg-blue-500',
    label: 'Time Elapsed',
    value: '39%',
    sub: '5.5 of 14 Months',
  },
  {
    icon: 'show_chart',
    iconBg: 'bg-purple-50',
    iconText: 'text-purple-500',
    bar: 'bg-purple-500',
    label: 'Physical Progress',
    value: '64%',
    sub: 'Work Completion',
  },
  {
    icon: 'groups',
    iconBg: 'bg-orange-50',
    iconText: 'text-orange-400',
    bar: 'bg-orange-400',
    label: 'Beneficiaries',
    value: '1,250',
    sub: 'Expected Beneficiaries',
  },
  {
    icon: 'verified_user',
    iconBg: 'bg-green-50',
    iconText: 'text-[#1b6d24]',
    bar: 'bg-[#1b6d24]',
    label: 'Overall Health',
    value: 'Good',
    sub: 'Project Health Status',
  },
];

export default function ProjectsPage() {
  return (
    <div className="h-full overflow-hidden p-3 md:p-4">
      <div className="max-w-[1280px] mx-auto h-full flex flex-col gap-3">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-outline-variant gap-3 flex-none">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] text-on-surface-variant mb-2 flex items-center gap-2">
              <a href="#" className="hover:text-[#1b6d24] transition-colors text-[#1b6d24]">
                Projects
              </a>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-on-surface font-medium">MP-2024-1842</span>
            </div>
            <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg text-[13px] leading-[18px] text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                placeholder="Search projects..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center">
            <button className="flex items-center px-3 py-1.5 border border-[#1b6d24] text-[#1b6d24] rounded-lg hover:bg-[rgba(232,245,233,1)] transition-colors font-medium text-sm">
              <span className="material-symbols-outlined text-sm mr-2">download</span>
              Download Report
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-3">
          {/* Live MPLADS National Overview */}
          <MpladsOverview />

          {/* Rows 1-2 grid: Overview | (Timeline above Risk) */}
          <div className="flex-1 min-h-0 grid grid-cols-[29%_71%] gap-3">
          {/* Left Column: Project Overview */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-4 flex flex-col min-h-0 overflow-hidden">
            <h3 className="text-base font-bold text-[#001f3f] mb-3">Project Overview</h3>
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-between space-y-2.5 text-sm">
              {OVERVIEW_ROWS.map((row) => (
                <div key={row.label} className="flex justify-between items-start gap-3">
                  <div className="flex items-center text-on-surface-variant gap-2 shrink-0">
                    <span className="material-symbols-outlined text-base">{row.icon}</span>
                    {row.label}
                  </div>
                  <div className="font-medium text-on-surface text-right">{row.value}</div>
                </div>
              ))}
              <hr className="border-outline-variant my-1" />
              {FINANCE_ROWS.map((row) => (
                <div key={row.label} className="flex justify-between items-start gap-3">
                  <div className="flex items-center text-on-surface-variant gap-2 shrink-0">
                    <span className="material-symbols-outlined text-base">{row.icon}</span>
                    {row.label}
                  </div>
                  <div className="font-semibold text-on-surface text-right">{row.value}</div>
                </div>
              ))}
              <hr className="border-outline-variant my-1" />
              {DATE_ROWS.map((row) => (
                <div key={row.label} className="flex justify-between items-start gap-3">
                  <div className="flex items-center text-on-surface-variant gap-2 shrink-0">
                    <span className="material-symbols-outlined text-base">{row.icon}</span>
                    {row.label}
                  </div>
                  <div className="font-medium text-on-surface text-right">{row.value}</div>
                </div>
              ))}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center text-on-surface-variant gap-2 shrink-0">
                  <span className="material-symbols-outlined text-base">info</span>
                  Status
                </div>
                <div className="font-medium text-[#f57c00] flex items-center bg-orange-50 px-2 py-0.5 rounded-md text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#f57c00] mr-1.5" />
                  In Progress
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline above Risk (Rows 1-2) */}
          <div className="flex flex-col gap-3 min-h-0">
            {/* Row 1: Project Timeline */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-4 flex flex-col min-h-0 overflow-hidden flex-1">
                <h3 className="text-base font-bold text-[#001f3f] mb-2 flex-none">Project Timeline</h3>
                <div className="relative pt-2 pb-2 px-2 flex-1 min-h-0 overflow-x-auto flex items-center">
                  <div className="absolute top-1/2 left-14 right-14 h-[2px] bg-outline-variant hidden md:block -translate-y-1/2" />
                  <div className="flex justify-between w-full min-w-[360px] relative">
                    {TIMELINE.map((step) => (
                      <div key={step.title} className="flex flex-col items-center w-1/5">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white mb-1.5 shadow-sm ring-4 ring-white ${
                            step.current
                              ? 'bg-[#f57c00]'
                              : step.done
                                ? 'bg-[#1b6d24]'
                                : 'bg-gray-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">{step.icon}</span>
                        </div>
                        <div className="text-center">
                          <p
                            className={`text-[13px] leading-tight font-medium ${
                              step.done || step.current ? 'text-on-surface' : 'text-on-surface-variant'
                            }`}
                          >
                            {step.title}
                          </p>
                          <p
                            className={`text-[11px] leading-tight ${
                              step.done || step.current ? 'text-on-surface-variant' : 'text-outline'
                            }`}
                          >
                            {step.sub}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            {/* Row 2: Risk Analysis | AI Summary */}
            <div className="grid grid-cols-2 gap-3 min-h-0 flex-1">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-4 flex flex-col min-h-0 overflow-hidden">
                <div className="flex justify-between items-center mb-2 flex-none">
                  <h3 className="text-base font-bold text-[#001f3f] flex items-center">
                    <span className="material-symbols-outlined text-[#1b6d24] mr-2">font_download</span>
                    Risk Analysis
                  </h3>
                  <select className="border border-outline-variant rounded-lg text-xs text-on-surface-variant focus:ring-primary focus:border-primary py-1 pl-2 pr-6 shadow-sm bg-white">
                    <option>vs Last Month</option>
                    <option>vs Inception</option>
                  </select>
                </div>
                <div className="flex flex-1 min-h-0 gap-4 items-center justify-center">
                  {/* Radial Score */}
                  <div className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center w-44 shrink-0">
                    <div className="relative w-24 h-24 flex items-center justify-center mb-1">
                      <div className="absolute inset-0 rounded-full border-8 border-gray-200" />
                      <div
                        className="absolute inset-0 rounded-full border-8 border-[#e53935]"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 80%)', transform: 'rotate(45deg)' }}
                      />
                      <div className="text-center z-10">
                        <div className="text-2xl font-bold text-on-surface">
                          78<span className="text-xs text-on-surface-variant font-normal">/100</span>
                        </div>
                        <div className="text-[11px] text-on-surface-variant">Risk Score</div>
                      </div>
                    </div>
                    <div className="bg-red-50 text-[#e53935] px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#e53935] mr-1.5" />
                      High Risk
                    </div>
                  </div>
                  {/* Progress Bars */}
                  <div className="flex-1 w-full grid gap-2">
                    {RISK_BARS.map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="font-medium text-on-surface-variant">{bar.label}</span>
                          <span className="font-bold text-on-surface">{bar.value}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200">
                          <div
                            className={`h-full rounded-full ${bar.value >= 85 ? 'bg-[#e53935]' : 'bg-[#f57c00]'}`}
                            style={{ width: `${bar.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-[rgba(232,245,233,1)] rounded-xl border border-green-100 p-4 flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center gap-2 text-[#1b6d24] font-semibold mb-2 flex-none">
                  <span className="material-symbols-outlined text-base">smart_toy</span>
                  <span>AI Summary</span>
                </div>
                <div className="flex-1 min-h-0 flex items-center">
                  <p className="text-[13px] text-on-surface-variant leading-relaxed">
                    AI models detect moderate risk due to cost overrun and delay probability.
                    Continuous monitoring recommended.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Full-width KPI cards */}
        <div className="grid grid-cols-5 gap-3 flex-none">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-3 relative overflow-hidden flex items-center"
            >
              <div className={`absolute bottom-0 left-0 w-full h-1 opacity-50 ${kpi.bar}`} />
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 ${kpi.iconBg} ${kpi.iconText} rounded-full shrink-0`}>
                  <span className="material-symbols-outlined text-base">{kpi.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-on-surface-variant font-medium truncate">{kpi.label}</p>
                  <h4 className="text-xl font-bold text-on-surface leading-tight">{kpi.value}</h4>
                  <p className="text-[10px] text-on-surface-variant truncate">{kpi.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
}