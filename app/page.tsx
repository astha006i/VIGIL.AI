import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ImpactStats from '@/components/ImpactStats';
import HowItWorks from '@/components/HowItWorks';
import LandingFooter from '@/components/LandingFooter';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col text-on-surface">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ImpactStats />
        <HowItWorks />
      </main>
      <LandingFooter />
    </div>
  );
}