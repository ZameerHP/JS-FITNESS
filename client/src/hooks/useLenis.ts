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
  } else if (typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }
  if (typeof document !== 'undefined') {
    const limit =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;
    scrollSubscribers.forEach((cb) => cb(0, Math.max(0, limit)));
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
    let lastBodyHeight = document.body.scrollHeight;
    let lastScrollTime = 0;
    let lastDispatchedY = -1;

    const scheduleSettledRefresh = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (performance.now() - lastScrollTime < 300) {
          scheduleSettledRefresh();
          return;
        }
        lastBodyHeight = document.body.scrollHeight;
        ScrollTrigger.refresh();
      }, 220);
    };

    const triggerDebouncedRefresh = () => {
      const nextHeight = document.body.scrollHeight;
      if (Math.abs(nextHeight - lastBodyHeight) <= 8) return;
      scheduleSettledRefresh();
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(triggerDebouncedRefresh);
      resizeObserver.observe(document.body);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        scheduleSettledRefresh();
      });
    }

    const notifyScroll = (scrollVal: number, limitVal: number) => {
      lastScrollTime = performance.now();
      if (scrollVal === lastDispatchedY) return;
      lastDispatchedY = scrollVal;
      ScrollTrigger.update();
      scrollSubscribers.forEach((cb) => cb(scrollVal, limitVal));
    };

    if (disableLenis) {
      const onNativeScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const limit =
          document.documentElement.scrollHeight - document.documentElement.clientHeight;
        notifyScroll(scrollTop, limit);
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
        const scrollVal = e.scroll ?? window.scrollY;
        const limitVal =
          e.limit ?? document.documentElement.scrollHeight - document.documentElement.clientHeight;
        notifyScroll(scrollVal, limitVal);
      };

      const onWindowScroll = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const limit =
          document.documentElement.scrollHeight - document.documentElement.clientHeight;
        notifyScroll(scrollTop, limit);
      };

      lenis.on('scroll', handleLenisScroll);
      window.addEventListener('scroll', onWindowScroll, { passive: true });

      const tick = (t: number) => {
        lenis.raf(t * 1000);
      };

      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanupEngine = () => {
        gsap.ticker.remove(tick);
        lenis.off('scroll', handleLenisScroll);
        window.removeEventListener('scroll', onWindowScroll);
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
