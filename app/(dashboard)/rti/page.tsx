'use client';

const SOURCE_FIELDS = [
  { icon: 'link', label: 'CPGRAMS Reference ID', value: 'PG/2024/1234567', copy: true },
  { icon: 'folder', label: 'Project ID', value: 'MP-2024-1842' },
  { icon: 'account_tree', label: 'Project Name', value: 'Community Hall Construction' },
  { icon: 'domain', label: 'Implementing Agency', value: 'Rural Development Department' },
  { icon: 'location_on', label: 'Location', value: 'Bhopal, Madhya Pradesh' },
  { icon: 'subject', label: 'Subject', value: 'Delay in construction and fund utilization' },
];

const DRAFT_QUESTIONS = [
  'Total amount sanctioned for the project.',
  'Sanction letter/ work order and date of issue.',
  'Current status of the work and the number of days the work has been pending/completed/remaining.',
  'Details of the contractor/ agencies involved.',
  'Copies of inspection reports (if any).',
];

const ACTIONS = [
  {
    icon: 'picture_as_pdf',
    iconBg: 'bg-[rgba(186,26,26,0.1)]',
    iconText: 'text-[#ba1a1a]',
    title: 'Download RTI (PDF)',
    sub: 'Best for printing and submission',
  },
  {
    icon: 'description',
    iconBg: 'bg-[rgba(0,31,63,0.1)]',
    iconText: 'text-[#001f3f]',
    title: 'Download RTI (DOCX)',
    sub: 'Edit in Word if needed',
  },
  {
    icon: 'mail',
    iconBg: 'bg-[rgba(27,109,36,0.1)]',
    iconText: 'text-[#1b6d24]',
    title: 'Send via Email',
    sub: 'Open in your email client',
  },
  {
    icon: 'open_in_new',
    iconBg: 'bg-[rgba(106,13,173,0.1)]',
    iconText: 'text-[#6A0DAD]',
    title: 'Auto fill form in portal',
    sub: 'Open RTI portal with pre-filled details',
  },
];

export default function RTIPage() {
  return (
    <div className="p-3 md:p-4">
      <div className="max-w-[1280px] mx-auto flex flex-col min-h-full">
        {/* Page Header */}
        <header className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-soft py-3 px-4 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {['Transparent', 'Accountable', 'Empowered Citizens'].map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container rounded-full border border-outline-variant/50"
              >
                <span className="material-symbols-outlined text-[#1b6d24] text-sm">check_circle</span>
                <span className="text-[11px] text-on-surface-variant font-medium">{badge}</span>
              </div>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-surface text-[#1b6d24] border border-[#1b6d24] rounded-lg text-[13px] font-semibold hover:bg-[rgba(27,109,36,0.05)] transition-colors shadow-sm">
            <span className="material-symbols-outlined text-base">menu_book</span>
            View RTI Guide
          </button>
        </header>

        {/* Main Dashboard Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Source Information */}
            <div className="lg:col-span-3 flex flex-col">
              <section className="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden flex flex-col relative h-full">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#1b6d24]" />
                <div className="p-3.5 border-b border-outline-variant/20 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[rgba(27,109,36,0.1)] flex items-center justify-center text-[#1b6d24]">
                    <span className="material-symbols-outlined text-[20px]">database</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-on-surface leading-tight">
                      Source Information
                    </h3>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      The RTI draft is generated using the details below.
                    </p>
                  </div>
                </div>
                <div className="p-3.5 flex-1 flex flex-col gap-3">
                  {SOURCE_FIELDS.map((field) => (
                    <div key={field.label} className="flex gap-2.5 items-start">
                      <span className="material-symbols-outlined text-on-surface-variant mt-0.5 text-[18px]">
                        {field.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-on-surface-variant mb-0.5">{field.label}</p>
                        {field.copy ? (
                          <div className="flex items-center justify-between bg-surface-container-low px-2.5 py-1.5 rounded-md border border-outline-variant/30">
                            <span className="text-[13px] font-semibold text-[#1b6d24] overflow-hidden text-ellipsis">
                              {field.value}
                            </span>
                            <button
                              aria-label="Copy ID"
                              className="text-on-surface-variant hover:text-primary transition-colors ml-2 shrink-0"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                content_copy
                              </span>
                            </button>
                          </div>
                        ) : (
                          <p className="text-[13px] font-medium text-on-surface break-words">
                            {field.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2.5 items-start pt-1.5 border-t border-outline-variant/20">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5 text-[18px]">
                      schedule
                    </span>
                    <div className="flex-1">
                      <p className="text-[11px] text-on-surface-variant mb-0.5">Current Status</p>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ffddb6]/20 text-[#643f00] text-[11px] border border-[#ffddb6]/30">
                        <span className="w-2 h-2 rounded-full bg-[#ffb959]" />
                        Under Review
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Middle Column: AI Generated Draft */}
            <div className="lg:col-span-6 flex flex-col">
              <section className="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 flex flex-col h-full">
                <div className="p-3.5 border-b border-outline-variant/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[rgba(27,109,36,0.1)] flex items-center justify-center text-[#1b6d24]">
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-on-surface leading-tight">
                        AI Generated RTI Draft
                      </h3>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Review the draft below. You can edit, regenerate, or download it.
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[rgba(160,243,153,0.5)] text-[#217128] rounded-full text-[11px] border border-[rgba(27,109,36,0.2)]">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    AI Generated
                  </span>
                </div>

                {/* Draft Content Canvas */}
                <div className="flex-1 p-4 bg-surface-container-lowest border-b border-outline-variant/20 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-surface-container-low/50 via-surface-container-lowest to-surface-container-lowest">
                  <div className="max-w-2xl mx-auto text-on-surface space-y-2.5 text-[13px] leading-snug relative">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
                      <span className="material-symbols-outlined text-[200px]">account_balance</span>
                    </div>
                    <p>
                      To,
                      <br />
                      <span className="font-semibold">The Public Information Officer,</span>
                      <br />
                      <span className="font-semibold">Rural Development Department,</span>
                      <br />
                      <span className="font-semibold">Madhya Pradesh.</span>
                    </p>
                    <p>
                      <span className="font-semibold">Subject:</span> Request for information
                      under RTI Act, 2005.
                    </p>
                    <p>Respected Sir/Madam,</p>
                    <p>
                      I would like to seek the following information regarding the{' '}
                      <span className="font-semibold bg-[rgba(27,109,36,0.1)] px-1 rounded">
                        MP/2024/1842 – Community Hall Construction
                      </span>{' '}
                      project implemented in Bhopal, Madhya Pradesh.
                    </p>
                    <ol className="list-none space-y-2 ml-1.5 mt-2">
                      {DRAFT_QUESTIONS.map((q, i) => (
                        <li key={q} className="flex items-start gap-2.5">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[rgba(160,243,153,1)] text-[#217128] flex items-center justify-center font-bold text-[11px] mt-0.5">
                            {i + 1}
                          </span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="pt-2">Thank you.</p>
                    <div className="flex justify-between items-end pb-2">
                      <p>
                        Sincerely,
                        <br />
                        <span className="text-on-surface-variant italic">[Your Name]</span>
                        <br />
                        <span className="text-on-surface-variant italic">[Address]</span>
                        <br />
                        <span className="text-on-surface-variant italic">[Contact Details]</span>
                      </p>
                      <div className="w-14 h-16 border border-outline-variant/30 border-dashed rounded flex flex-col items-center justify-center text-on-surface-variant/50">
                        <span className="material-symbols-outlined text-2xl">account_balance</span>
                        <span className="text-[8px] mt-1 font-semibold tracking-widest uppercase">
                          Emblem
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Draft Actions */}
                <div className="p-3 bg-surface flex items-center gap-4 rounded-b-xl">
                  <button className="flex-1 py-1.5 px-3 bg-[#1b6d24] text-white rounded-lg font-semibold text-[13px] hover:bg-[#1b6d24]/90 transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">sync</span>
                    Regenerate Draft
                  </button>
                  <button className="flex-1 py-1.5 px-3 bg-surface text-[#1b6d24] border border-[#1b6d24] rounded-lg font-semibold text-[13px] hover:bg-[rgba(27,109,36,0.05)] transition-colors shadow-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">edit_document</span>
                    Edit Draft
                  </button>
                </div>
              </section>
            </div>

            {/* Right Column: Actions & Status */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Actions Card */}
              <section className="bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 flex flex-col">
                <div className="p-3.5 border-b border-outline-variant/20 flex items-center gap-3 relative overflow-hidden rounded-t-xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary-container" />
                  <div className="w-9 h-9 rounded-full bg-[rgba(0,31,63,0.1)] flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-[20px]">cloud_download</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-on-surface leading-tight">Actions</h3>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Take the next step with your RTI draft.
                    </p>
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-2.5">
                  {ACTIONS.map((action) => (
                    <button
                      key={action.title}
                      className="w-full bg-surface hover:bg-surface-container-low border border-outline-variant/40 rounded-lg p-2.5 flex items-center gap-3 transition-colors group text-left shadow-sm"
                    >
                      <div
                        className={`w-9 h-9 rounded ${action.iconBg} ${action.iconText} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-on-surface truncate">{action.title}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{action.sub}</p>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* RTI AI Status Card */}
              <section className="flex-1 bg-surface-container-lowest rounded-xl shadow-soft border border-outline-variant/30 flex flex-col overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(27,109,36,0.05)] rounded-bl-full pointer-events-none" />
                <div className="p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[rgba(27,109,36,0.1)] flex items-center justify-center text-[#1b6d24]">
                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-on-surface leading-tight">
                    RTI AI Status
                  </h3>
                </div>
                <div className="px-3.5 pb-3.5 flex flex-col gap-3">
                  <div className="bg-surface-container rounded-lg p-3 relative overflow-hidden">
                    <span className="material-symbols-outlined absolute right-2 bottom-2 text-5xl text-[#1b6d24] opacity-10 pointer-events-none">
                      smart_toy
                    </span>
                    <p className="text-[11px] text-on-surface-variant mb-1">Confidence Score</p>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="text-2xl text-[#1b6d24] font-bold leading-none">92%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-[#1b6d24] rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div className="bg-[rgba(27,109,36,0.05)] border border-[rgba(27,109,36,0.2)] rounded-lg p-2.5 flex gap-2.5 items-start">
                    <span className="material-symbols-outlined text-[#1b6d24] text-lg mt-0.5">
                      lightbulb
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-on-surface mb-0.5">
                        AI Suggestion
                      </p>
                      <p className="text-[11px] text-on-surface-variant leading-snug">
                        RTI is generated as per rules for structured governance. The required
                        details mapping seems highly accurate based on the selected CPGRAMS ID.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}