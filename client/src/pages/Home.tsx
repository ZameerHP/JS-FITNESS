import React, { useEffect, useState } from 'react';
import { SEOHead } from '../components/ui/SEOHead';
import { HeroSection } from '../components/home/HeroSection';
import { FeatureStrip } from '../components/home/FeatureStrip';

const loadHomeBelowFold = () => import('../components/home/HomeBelowFold');
let ResolvedBelowFold: React.ComponentType<{ onPrefetchCalendly?: () => void }> | null = null;

interface HomeProps {
  preloaderDone: boolean;
  onPrefetchCalendly?: () => void;
}

export const Home: React.FC<HomeProps> = React.memo(({ preloaderDone, onPrefetchCalendly }) => {
  const [BelowFoldComp, setBelowFoldComp] = useState<
    React.ComponentType<{ onPrefetchCalendly?: () => void }> | null
  >(() => ResolvedBelowFold);

  useEffect(() => {
    if (ResolvedBelowFold) return;
    let cancelled = false;
    const rafId = window.requestAnimationFrame(() => {
      loadHomeBelowFold().then((m) => {
        ResolvedBelowFold = m.HomeBelowFold;
        if (cancelled) return;
        React.startTransition(() => setBelowFoldComp(() => m.HomeBelowFold));
      });
    });
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <SEOHead
        title="JS FITNESS INC | 24/7 Gym & Personal Training Calgary NE"
        description="More than just a gym membership. 24/7 gym access, custom training & nutrition coaching, and real transformations in Calgary NE."
        path="/"
      />
      <HeroSection ready={preloaderDone} onPrefetchCalendly={onPrefetchCalendly} />
      <FeatureStrip />
      {BelowFoldComp ? (
        <BelowFoldComp onPrefetchCalendly={onPrefetchCalendly} />
      ) : (
        <div className="min-h-[2600px] bg-[#050505]" />
      )}
    </>
  );
});

export default Home;
