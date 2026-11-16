import { useEffect, useState } from 'react';
import { gsap } from './gsap';

export type PerfTier = 'high' | 'medium' | 'low';

export function detectTier(): PerfTier {
  if (typeof window === 'undefined') return 'high';
  const touch = window.matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || cores <= 2 || mem <= 2) return 'low';
  if (touch || cores <= 4 || mem <= 4) return 'medium';
  return 'high';
}

let currentTier: PerfTier =
  typeof document !== 'undefined' &&
  (document.documentElement.dataset.perf as PerfTier | undefined)
    ? (document.documentElement.dataset.perf as PerfTier)
    : detectTier();

if (typeof document !== 'undefined') {
  document.documentElement.dataset.perf = currentTier;
}

const listeners = new Set<(tier: PerfTier) => void>();

export function getTier(): PerfTier {
  return currentTier;
}

export function downgradeTier(): void {
  if (currentTier === 'low') return;
  const next: PerfTier = currentTier === 'high' ? 'medium' : 'low';
  currentTier = next;
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.perf = next;
  }
  listeners.forEach((fn) => fn(next));
}

export function subscribeTier(fn: (tier: PerfTier) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>(currentTier);
  useEffect(() => {
    setTier(currentTier);
    return subscribeTier(setTier);
  }, []);
  return tier;
}

let watchdogStarted = false;

export function startPerfWatchdog(): () => void {
  if (watchdogStarted || typeof window === 'undefined') return () => {};
  watchdogStarted = true;

  let frames = 0;
  let last = performance.now();
  let slow = 0;
  let paused = document.hidden;

  const onVisibility = () => {
    paused = document.hidden;
    frames = 0;
    slow = 0;
    last = performance.now();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const tick = () => {
    if (paused || currentTier === 'low') return;
    frames += 1;
    const now = performance.now();
    if (now - last >= 1000) {
      slow = frames < 50 ? slow + 1 : 0;
      frames = 0;
      last = now;
      if (slow >= 2) {
        downgradeTier();
        slow = 0;
      }
    }
  };

  gsap.ticker.add(tick);
  return () => {
    gsap.ticker.remove(tick);
    document.removeEventListener('visibilitychange', onVisibility);
    watchdogStarted = false;
  };
}
