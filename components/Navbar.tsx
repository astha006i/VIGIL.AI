import Link from 'next/link';
import {
  ChartBarsIcon,
  CheckCircleIcon,
  InfoIcon,
  QuestionIcon,
  SparklesIcon,
} from './Icons';

const LOGO_SRC =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAf72qNStYb8Eqb-PrrXkgVBjQkNuWVttZaZZMVOjkKNkgO_enY6_N5Pegxz02TeU0hRa2vmSaL_YdCh8BCPlbOX9I4-NECNW5IZWBwMHmMYpCGMzHDYeyc4a7zqrFbQZsmwoDpQ-uEdqiuTkeNRcKIsyQ2B7d2ZvQPTyWipIoHCslQuBRhqA6QTYF43aFFGdJwMjH1zJ715uXfNhIqmxRGqTEIiQCXsZeDBY05PAeCqpah7Xe6b19KNicvLC0_uo7ndg';

const navLinks = [
  { href: '#about', label: 'About', icon: InfoIcon },
  { href: '#features', label: 'Features', icon: SparklesIcon },
  { href: '#impact', label: 'Impact', icon: ChartBarsIcon },
  { href: '#how-it-works', label: 'How It Works', icon: QuestionIcon },
];

export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-white/10 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2 active:opacity-80"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Vigil Eye Logo"
            className="h-8 w-8 object-contain"
            src={LOGO_SRC}
          />
          <span className="text-xl font-bold tracking-tight text-primary">
            Vigil AI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-1 font-medium text-primary transition-colors hover:opacity-80"
            >
              <Icon className="h-4 w-4" />
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700 lg:flex">
            <CheckCircleIcon className="h-4 w-4" />
            <span className="font-medium">AI Powered • Secure • Transparent</span>
          </div>
        </div>
      </div>
    </header>
  );
}