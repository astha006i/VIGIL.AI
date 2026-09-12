import type { ReactNode } from 'react';
import Card from './Card';
import {
  AlertIcon,
  ShieldCheckIcon,
  TrendDownIcon,
  TrendUpIcon,
  UsersIcon,
} from './Icons';

type Stat = {
  value: string;
  label: string;
  icon: ReactNode;
  accent: string;
  delta: string;
  up: boolean;
};

const stats: Stat[] = [
  {
    value: '1,24,582',
    label: 'Projects Monitored',
    icon: <UsersIcon className="h-6 w-6" />,
    accent: 'bg-blue-50 text-blue-600',
    delta: '12.6% from last month',
    up: true,
  },
  {
    value: '₹45,231 Cr',
    label: 'Funds Tracked',
    icon: <span className="text-xl font-bold">₹</span>,
    accent: 'bg-green-50 text-green-600',
    delta: '8.4% from last month',
    up: true,
  },
  {
    value: '78.4%',
    label: 'Delivery Efficiency',
    icon: <ShieldCheckIcon className="h-6 w-6" />,
    accent: 'bg-purple-50 text-purple-600',
    delta: '6.7% from last month',
    up: true,
  },
  {
    value: '1,284',
    label: 'High Risk Alerts',
    icon: <AlertIcon className="h-6 w-6" />,
    accent: 'bg-red-50 text-red-600',
    delta: '4.3% from last month',
    up: false,
  },
];

export default function ImpactStats() {
  return (
    <section id="impact" className="relative z-20 mx-auto -mt-16 mb-20 max-w-7xl px-6">
      <Card className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-4 md:divide-x md:divide-y-0 divide-y divide-outline-variant">
        {stats.map(({ value, label, icon, accent, delta, up }) => (
          <div key={label} className="flex items-center gap-4 p-4">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${accent}`}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">{value}</h3>
              <p className="text-sm font-medium text-primary">{label}</p>
              <p
                className={`mt-1 flex items-center text-xs font-medium ${
                  up ? 'text-success' : 'text-error'
                }`}
              >
                {up ? (
                  <TrendUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <TrendDownIcon className="mr-1 h-3 w-3" />
                )}
                {delta}
              </p>
            </div>
          </div>
        ))}
      </Card>
    </section>
  );
}