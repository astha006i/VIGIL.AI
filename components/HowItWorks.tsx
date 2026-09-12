import type { ReactNode } from 'react';
import {
  BellIcon,
  CheckCircleIcon,
  ClipboardIcon,
  CpuIcon,
  DocumentIcon,
} from './Icons';

type Step = {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
  circle: string;
  badge: string;
};

const steps: Step[] = [
  {
    number: '01',
    title: 'Collect Data',
    description: 'Data is collected from multiple verified sources.',
    icon: <DocumentIcon className="h-8 w-8" />,
    circle: 'border-blue-500 bg-blue-50 text-blue-600',
    badge: 'bg-blue-600',
  },
  {
    number: '02',
    title: 'AI Analysis',
    description: 'Advanced AI models detect patterns and irregularities.',
    icon: <CpuIcon className="h-8 w-8" />,
    circle: 'border-green-500 bg-green-50 text-green-600',
    badge: 'bg-green-600',
  },
  {
    number: '03',
    title: 'Risk Scoring',
    description: 'Projects are scored based on risk and priority.',
    icon: <CheckCircleIcon className="h-8 w-8" />,
    circle: 'border-purple-500 bg-purple-50 text-purple-600',
    badge: 'bg-purple-600',
  },
  {
    number: '04',
    title: 'Smart Alerts',
    description: 'Real-time alerts are sent to authorities.',
    icon: <BellIcon className="h-8 w-8" />,
    circle: 'border-orange-400 bg-orange-50 text-orange-500',
    badge: 'bg-orange-500',
  },
  {
    number: '05',
    title: 'Action & Accountability',
    description: 'Timely action is ensured with full accountability.',
    icon: <ClipboardIcon className="h-8 w-8" />,
    circle: 'border-teal-500 bg-teal-50 text-teal-600',
    badge: 'bg-teal-600',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto mb-20 max-w-7xl scroll-mt-20 px-6 py-12">
      <div id="features" className="mb-16 text-center">
        <h2 className="mb-2 text-3xl font-bold text-primary">
          How <span className="text-primary">Vigil</span>{' '}
          <span className="text-success">AI</span> Works
        </h2>
        <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-blue-600 to-green-600" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="absolute left-10 right-10 top-[40px] z-0 hidden h-0.5 border-t-2 border-dashed border-outline-variant md:block" />
        <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-5">
          {steps.map(({ number, title, description, icon, circle, badge }) => (
            <div key={number} className="flex flex-col items-center text-center">
              <div
                className={`relative mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 shadow-sm ${circle}`}
              >
                {icon}
                <div
                  className={`absolute -bottom-3 rounded-full border-2 border-white px-2 py-0.5 text-xs font-bold text-white ${badge}`}
                >
                  {number}
                </div>
              </div>
              <h4 className="mb-2 font-bold text-primary">{title}</h4>
              <p className="text-sm text-primary">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}