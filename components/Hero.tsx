import Button from './Button';
import { ArrowRightIcon, LoginIcon } from './Icons';

export default function Hero() {
  return (
    <section id="about" className="hero-bg relative min-h-[600px] w-full items-center pt-20">
      <div className="hero-overlay absolute inset-0" />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 pb-24 pt-12">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="text-blue-600">AI-POWERED</span>
            <span className="text-primary/80">
              MONITORING &amp; ACCOUNTABILITY PLATFORM
            </span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight text-primary md:text-6xl">
            Vigilance &amp; Integrity.
            <br />
            <span className="text-success">Governance Intelligence Layer.</span>
          </h1>

          <p className="mb-10 max-w-xl text-lg leading-relaxed text-primary">
            Vigil AI uses AI and advanced analytics to detect irregularities,
            track progress, and ensure efficient implementation of MPLADS works.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button as="a" href="#how-it-works">
              Explore <ArrowRightIcon className="h-5 w-5" />
            </Button>
            <Button as="a" href="/login" variant="outline">
              Login <LoginIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}