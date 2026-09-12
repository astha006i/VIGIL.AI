'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LOGO_SRC =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBx5BuYmwmI6Z_u82Z0XZvokDYTQmJf8bbqUCoJNzsf20mR6hku551-pIIIwEEMo5Mca8X1i3wDWTqLZhx00_PgVPNEtZjQOCQO9R91cY75PsDrJ-QfdRL8uQ54Vi_lNh6-Dcegjqf5Rl7E1Tg4ajAxt3YayPXXW45g4Vl311W3VOSfzAR-gwHTQWi90gzUcKCqx-jqPw0Da1Kux61Xngybx5-aS8U0yrBFvLVUjulxn6qwEUrkU2OfJrHko-ab7m1B5w';

const NAV_ITEMS: { icon: string; label: string; href: string }[] = [
  { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { icon: 'monitoring', label: 'AI Anomaly Center', href: '/anomaly' },
  { icon: 'folder_shared', label: 'Projects', href: '/projects' },
  { icon: 'support_agent', label: 'CPGRAMS Tracking', href: '/cpgrams' },
  { icon: 'description', label: 'RTI Generator', href: '/rti' },
];

const PAGE_INFO: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of projects and alerts' },
  '/anomaly': { title: 'AI Anomaly Center', subtitle: 'AI/ML models continuously scan projects to detect risks and irregularities' },
  '/projects': { title: 'Projects Intelligence', subtitle: 'Project Intelligence and risk analysis' },
  '/cpgrams': { title: 'CPGRAMS Tracking', subtitle: 'Track complaint status in real-time' },
  '/rti': { title: 'RTI Generator', subtitle: 'AI generates RTI drafts from project details' },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageInfo = PAGE_INFO[pathname] ?? { title: '', subtitle: '' };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-body-md antialiased">
      {/* SideNavBar */}
      <nav
        className="hidden md:flex flex-col bg-surface dark:bg-surface-dim border-r border-outline-variant h-screen w-64 py-6 px-4 z-40 flex-shrink-0"
        style={{
          backgroundColor: '#1b6d24',
          color: 'rgb(255, 255, 255)',
        }}
      >
        <div className="flex items-center gap-3 px-2 mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Institution Logo" className="h-10 w-10 object-contain" src={LOGO_SRC} />
          <div>
            <h1 className="text-[24px] leading-[32px] font-extrabold text-white leading-tight">
              Vigil AI
            </h1>
            <p className="text-xs text-white/80">Vigil Eye Platform</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out text-white ${
                item.href !== '#' && pathname === item.href
                  ? 'bg-white/30 font-bold'
                  : 'hover:bg-white/10'
              }`}
              href={item.href}
            >
              <span
                className={`material-symbols-outlined ${
                  item.href !== '#' && pathname === item.href ? 'filled' : ''
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[14px] leading-[20px] tracking-[0.05em] font-semibold truncate">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-auto pt-6">
          <div className="p-4 rounded-lg bg-white/10 mb-4 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-green-500 opacity-50" />
            <div className="flex items-center gap-2 text-white/20 mb-2">
              <span className="material-symbols-outlined text-4xl">account_balance</span>
            </div>
            <p className="text-xs font-bold text-white/80 mb-1">VIGIL AI</p>
            <p className="text-[10px] text-white/60 leading-tight">
              Building Transparent Stronger Communities
            </p>
          </div>
          <button className="w-full py-2.5 px-4 bg-white/10 border border-white/20 text-white rounded-lg text-[14px] leading-[20px] tracking-[0.05em] font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
          <div className="text-[10px] text-center text-white/40 mt-4">
            © 2025 CIVIC EYE. All rights reserved.
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
        {/* Top gradient ribbon */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-400 via-white to-green-500 absolute top-0 left-0 z-50" />

        {/* TopNavBar */}
        <header
          className="bg-surface-container-lowest dark:bg-surface-container-low border-b border-outline-variant shadow-sm flex justify-between items-center w-full px-6 h-16 sticky top-0 z-40 flex-shrink-0 mt-1"
          style={{ backgroundColor: 'rgb(255, 255, 255)' }}
        >
          <div className="flex-1 flex items-center gap-4">
            <button className="md:hidden text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">menu</span>
            </button>
            <div className="hidden sm:block">
              <p className="text-[18px] leading-[24px] tracking-[0.05em] font-bold text-on-surface">
                {pageInfo.title}
              </p>
              <p className="text-[13px] leading-[18px] tracking-[0.05em] text-on-surface-variant">
                {pageInfo.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer active:scale-95 p-2 rounded-full relative">
                <span className="material-symbols-outlined text-on-surface">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
              </button>
              <button className="text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer p-2 rounded-full">
                <span className="material-symbols-outlined text-on-surface">help_outline</span>
              </button>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant cursor-pointer">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-on-surface">Profile</p>
                <p className="text-xs text-on-surface-variant">Admin</p>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: 'var(--primary-container, #001f3f)' }}
              >
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <span className="material-symbols-outlined text-outline text-on-surface-variant">
                expand_more
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}