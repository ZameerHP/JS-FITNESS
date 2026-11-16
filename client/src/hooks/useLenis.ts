import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useReducedMotion } from './useReducedMotion';
import { useTier } from '../lib/perfTier';

let lenisSingleton: Lenis | null = null;
let globalScrollVelocity = 0;
let activeMounts = 0;
let cleanupEngine: (() => void) | null = null;
const scrollSubscribers = new Set<(scrollY: number, limit: number) => void>();

export function getScrollVelocity(): number {
  return globalScrollVelocity;
}

export function getLenisInstance(): Lenis | null {
  return lenisSingleton;
}

export function subscribeScroll(cb: (scrollY: number, limit: number) => void): () => void {
  scrollSubscribers.add(cb);
  return () => scrollSubscribers.delete(cb);
}

export function scrollToTopImmediate(): void {
  if (lenisSingleton) {
    lenisSingleton.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo(0, 0);
  }
}

export function scheduleScrollTriggerRefresh(): void {
  ScrollTrigger.refresh();
}

export function useLenis() {
  const reducedMotion = useReducedMotion();
  const tier = useTier();

  useEffect(() => {
    activeMounts += 1;
    if (cleanupEngine) {
      return () => {
        activeMounts -= 1;
        if (activeMounts <= 0 && cleanupEngine) {
          cleanupEngine();
          cleanupEngine = null;
        }
      };
    }

    const disableLenis = reducedMotion || tier === 'low';
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let resizeObserver: ResizeObserver | null = null;

    const triggerDebouncedRefresh = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(triggerDebouncedRefresh);
      resizeObserver.observe(document.body);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        triggerDebouncedRefresh();
      });
    }

    if (disableLenis) {
      const onNativeScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const limit =
          document.documentElement.scrollHeight - document.documentElement.clientHeight;
        ScrollTrigger.update();
        scrollSubscribers.forEach((cb) => cb(scrollTop, limit));
      };
      window.addEventListener('scroll', onNativeScroll, { passive: true });
      cleanupEngine = () => {
        window.removeEventListener('scroll', onNativeScroll);
        resizeObserver?.disconnect();
        if (resizeTimer) clearTimeout(resizeTimer);
      };
    } else {
      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: false,
      });

      lenisSingleton = lenis;

      const handleLenisScroll = (e: { scroll?: number; limit?: number; velocity?: number }) => {
        globalScrollVelocity = e.velocity ?? 0;
        ScrollTrigger.update();
        const scrollVal = e.scroll ?? window.scrollY;
        const limitVal =
          e.limit ?? document.documentElement.scrollHeight - document.documentElement.clientHeight;
        scrollSubscribers.forEach((cb) => cb(scrollVal, limitVal));
      };

      lenis.on('scroll', handleLenisScroll);

      const tick = (t: number) => {
        lenis.raf(t * 1000);
      };

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanupEngine = () => {
        gsap.ticker.remove(tick);
        lenis.off('scroll', handleLenisScroll);
        lenis.destroy();
        lenisSingleton = null;
        globalScrollVelocity = 0;
        resizeObserver?.disconnect();
        if (resizeTimer) clearTimeout(resizeTimer);
      };
    }

    return () => {
      activeMounts -= 1;
      if (activeMounts <= 0 && cleanupEngine) {
        cleanupEngine();
        cleanupEngine = null;
      }
    };
  }, [reducedMotion, tier]);
}
