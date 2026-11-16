import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';
let mq: MediaQueryList | null = null;
const subs = new Set<() => void>();

function ensureMq(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  if (!mq) {
    mq = window.matchMedia(QUERY);
    mq.addEventListener('change', () => {
      subs.forEach((cb) => cb());
    });
  }
  return mq;
}

function subscribe(cb: () => void): () => void {
  ensureMq();
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}

function getSnapshot(): boolean {
  return ensureMq()?.matches ?? false;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
