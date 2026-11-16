import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useReducedMotion } from './useReducedMotion';

let globalScrollVelocity = 0;

export function getScrollVelocity(): number {
  return globalScrollVelocity;
}

export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    const handleScroll = (e: { velocity?: number }) => {
      globalScrollVelocity = e.velocity ?? 0;
      ScrollTrigger.update();
    };

    lenis.on('scroll', handleScroll);

    const tickerFn = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerFn);
      lenis.destroy();
      lenisRef.current = null;
      globalScrollVelocity = 0;
    };
  }, [reducedMotion]);

  return lenisRef;
}
