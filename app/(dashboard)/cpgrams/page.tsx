'use client';

type StageKey =
  | 'submitted'
  | 'under_process'
  | 'with_department'
  | 'resolution_pending'
  | 'resolved';

const STAGE_ORDER: StageKey[] = [
  'submitted',
  'under_process',
  'with_department',
  'resolution_pending',
  'resolved',
];

const STAGES: Record<StageKey, { icon: string; title: string; sub: string }> = {
  submitted: { icon: 'description', title: 'Submitted', sub: '10 May 2024' },
  under_process: { icon: 'refresh', title: 'Under Process', sub: '12 May 2024' },
  with_department: { icon: 'apartment', title: 'With Department', sub: '19 May 2024' },
  resolution_pending: { icon: 'schedule', title: 'Resolution Pending', sub: '—' },
  resolved: { icon: 'check_circle', title: 'Resolved', sub: '—' },
};

const COMPLAINT: { status: StageKey } = { status: 'under_process' };

const QUICK_INFO = [
  {
    icon: 'apartment',
    label: 'Department',
    value: 'Rural Development Department',
    valueClass: 'text-on-surface font-medium',
  },
  {
    icon: 'event_available',
    label: 'SLA Remaining',
    value: '3 days',
    valueClass: 'text-[#10b981] font-bold',
  },
  {
    icon: 'work',
    label: 'Related MPLADS Project',
    value: 'MP-2024-1842 - Community Hall Construction',
    valueClass: 'text-on-surface font-medium',
  },
  {
    icon: 'warning',
    label: 'Priority',
    value: 'High',
    valueClass: 'text-[#ef4444]',
    badge: true,
  },
  {
    icon: 'location_on',
    label: 'Location',
    value: 'Bhopal, Madhya Pradesh',
    valueClass: 'text-on-surface font-medium',
    wide: true,
  },
];

const DETAILS_ROWS = [
  { label: 'Reference ID', value: 'PG/2024/1234567', valueClass: 'text-[#15803d] font-semibold' },
  { label: 'Complainant', value: 'Ramesh Singh', valueClass: 'text-on-surface font-medium' },
  { label: 'Subject', value: 'Delay in construction and fund utilization', valueClass: 'text-on-surface font-medium' },
];

const OVERVIEW_STATS = [
  {
    icon: 'checklist',
    card: 'bg-green-50/50 border-[#bbf7d0]',
    iconBg: 'bg-green-100',
    iconText: 'text-[#16a34a]',
    label: 'Response Time',
    value: '5 Days',
    sub: '(Avg. department)',
  },
  {
    icon: 'schedule',
    card: 'bg-blue-50/50 border-[#bfdbfe]',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    label: 'SLA Time',
    value: '15 Days',
    sub: '(Standard SLA)',
  },
  {
    icon: 'monitoring',
    card: 'bg-orange-50/50 border-[#fed7aa]',
    iconBg: 'bg-orange-100',
    iconText: 'text-orange-600',
    label: 'Status',
    value: 'Under Review',
    sub: 'Current Status',
  },
  {
    icon: 'star',
    card: 'bg-purple-50/50 border-[#e9d5ff]',
    iconBg: 'bg-purple-100',
    iconText: 'text-purple-600',
    label: 'Priority',
    value: 'High',
    sub: 'Priority Level',
  },
];

export default function CPGRAMSPage() {
  const currentIdx = STAGE_ORDER.indexOf(COMPLAINT.status);
  const mappedSteps = STAGE_ORDER.map((key) => {
    const idx = STAGE_ORDER.indexOf(key);
    const s = STAGES[key];
    const state = idx < currentIdx ? 'done' : idx === currentIdx ? 'current' : 'pending';
    return { ...s, state };
  });
  const progressPercent = ((currentIdx + 1) / STAGE_ORDER.length) * 100;

  return (
    <div className="p-3 md:p-4">
      <div className="max-w-[1280px] mx-auto space-y-3">
        {/* Search Section */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-3 flex gap-3 items-center justify-start">
          <label className="text-sm font-bold text-on-surface whitespace-nowrap" htmlFor="reference-id">
            Enter CPGRAMS Reference ID:
          </label>
          <input
            className="rounded-md border border-outline-variant shadow-sm text-on-surface focus:border-[#41635a] focus:ring-[#41635a] sm:text-sm px-4 py-2 bg-white w-full md:w-72"
            id="reference-id"
            name="reference-id"
            placeholder="e.g. PG/2024/..."
            type="text"
            defaultValue="PG/2024/1234567"
          />
          <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#41635a] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#35504a] focus:outline-none focus:ring-2 focus:ring-[#41635a] focus:ring-offset-2 transition-colors whitespace-nowrap">
            <span className="material-symbols-outlined text-base mr-2">search</span>
            Track Complaint
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Complaint Status */}
          <div className="lg:col-span-2">
            {/* Complaint Status Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-4 h-full">
              <div className="flex items-center flex-wrap gap-3 mb-3">
                <h2 className="text-base font-semibold text-on-surface">Complaint Status:</h2>
                <span className="text-base font-bold text-[#16a34a] uppercase">Under Review</span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  In Progress
                </span>
              </div>

              {/* Stepper */}
              <div className="relative px-2 pb-3 pt-1">
                <div className="absolute top-4 left-12 right-12 h-[2px] bg-[#e2e8f0] hidden md:block">
                  <div className="h-full bg-[#10b981] transition-all duration-500 ease-in-out" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between relative">
                  {mappedSteps.map((step) => (
                    <div key={step.title} className="flex flex-col items-center text-center w-20">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center mb-1 border-4 border-white relative z-10 transition-colors duration-500 ease-in-out ${
                          step.state === 'done'
                            ? 'bg-[#10b981] ring-4 ring-[#10b981]/40'
                            : 'bg-[#ef4444] ring-4 ring-[#ef4444]/40'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base text-white">{step.icon}</span>
                      </div>
                      <span
                        className={`text-[13px] font-medium leading-tight ${
                          step.state === 'done' || step.state === 'current'
                            ? 'text-on-surface'
                            : 'text-on-surface-variant'
                        }`}
                      >
                        {step.title}
                      </span>
                      <span
                        className={`text-[11px] mt-0.5 ${
                          step.state === 'done' || step.state === 'current'
                            ? 'text-on-surface-variant'
                            : 'text-outline'
                        }`}
                      >
                        {step.sub}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t border-outline-variant">
                {QUICK_INFO.map((info) => (
                  <div
                    key={info.label}
                    className={`flex items-start gap-2.5 ${info.wide ? 'sm:col-span-2' : ''}`}
                  >
                    <div className="mt-0.5 text-on-surface-variant">
                      <span className="material-symbols-outlined text-base">{info.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-on-surface-variant font-medium">{info.label}</p>
                      {info.badge ? (
                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10 mt-0.5">
                          High
                        </span>
                      ) : (
                        <p className={`text-[13px] leading-snug ${info.valueClass}`}>{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Complaint Details */}
          <div className="lg:col-span-1">
            {/* Complaint Details */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft p-4 h-full">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-on-surface">Complaint Details</h3>
                <button className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-md hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-base">print</span>
                </button>
              </div>
              <div className="space-y-2">
                {DETAILS_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-3 gap-2 border-b border-outline-variant pb-2"
                  >
                    <div className="text-[12px] text-on-surface-variant col-span-1">{row.label}</div>
                    <div className={`text-[13px] break-words col-span-2 ${row.valueClass}`}>{row.value}</div>
                  </div>
                ))}
                <div className="pt-0.5 pb-1">
                  <div className="text-[12px] text-on-surface-variant mb-0.5">Description</div>
                  <p className="text-[13px] text-on-surface leading-snug break-words">
                    Work is not completed even after 8 months of sanction.
                    <br />
                    No proper response from department.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="text-[12px] text-on-surface-variant col-span-1">Date of Complaint</div>
                  <div className="text-[13px] font-medium text-on-surface col-span-2">10 May 2024</div>
                </div>
              </div>

              {/* AI Banner */}
              <div className="mt-3 bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex gap-2.5">
                <div className="shrink-0 mt-0.5 text-blue-500">
                  <span className="material-symbols-outlined">smart_toy</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-blue-800">
                    This complaint is linked to an MPLADS project.
                  </p>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">
                    AI monitoring is in progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Overview */}
        <div>
          <h3 className="text-base font-semibold text-on-surface mb-2 ml-1">
            Complaint Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {OVERVIEW_STATS.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-xl p-3 flex flex-col justify-center border ${stat.card}`}
              >
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div
                    className={`p-1.5 rounded-md ${stat.iconBg} ${stat.iconText}`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {stat.icon}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-on-surface-variant">
                    {stat.label}
                  </span>
                </div>
                <div className="text-base font-bold text-on-surface">{stat.value}</div>
                <div className="text-xs text-on-surface-variant">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
    </div>
    </div>
  );
}