import { ScrollTrigger } from './gsap';

type QueueItem = {
  fn: () => void;
  cancelled: boolean;
};

const queue: QueueItem[] = [];
let draining = false;
let refreshTimer: number | null = null;

function scheduleRefreshOnce(): void {
  if (typeof window === 'undefined') return;
  if (refreshTimer !== null) clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;
    ScrollTrigger.refresh();
  }, 120);
}

function yieldToMain(cb: () => void): void {
  if (typeof MessageChannel !== 'undefined') {
    const ch = new MessageChannel();
    ch.port1.onmessage = () => cb();
    ch.port2.postMessage(null);
    return;
  }
  setTimeout(cb, 0);
}

function drainQueue(): void {
  if (draining) return;
  draining = true;

  const step = () => {
    const start = performance.now();
    while (queue.length > 0) {
      const item = queue.shift()!;
      if (!item.cancelled) {
        try {
          item.fn();
        } catch {
          // Keep remaining tasks alive if one section setup throws
        }
      }
      // Strictly yield back whenever chunk budget exceeds 8ms
      if (performance.now() - start >= 8 && queue.length > 0) {
        yieldToMain(step);
        return;
      }
    }
    draining = false;
    scheduleRefreshOnce();
  };

  yieldToMain(step);
}

/**
 * Schedules heavy non-critical setup work (below-the-fold ScrollTriggers, DOM prep)
 * in chunked tasks yielding every <= 8ms to keep INP and TBT low.
 */
export function scheduleChunkedTask(
  fn: () => void,
  priority: 'background' | 'user-visible' = 'background'
): () => void {
  if (typeof window === 'undefined') return () => {};

  const win = window as Window & {
    scheduler?: {
      postTask: (cb: () => void, opts?: { priority?: string; signal?: AbortSignal }) => Promise<void>;
    };
  };

  if (win.scheduler && typeof win.scheduler.postTask === 'function' && typeof AbortController !== 'undefined') {
    const controller = new AbortController();
    win.scheduler
      .postTask(
        () => {
          if (!controller.signal.aborted) {
            fn();
            scheduleRefreshOnce();
          }
        },
        { priority, signal: controller.signal }
      )
      .catch(() => {});
    return () => controller.abort();
  }

  const item: QueueItem = { fn, cancelled: false };
  queue.push(item);
  drainQueue();
  return () => {
    item.cancelled = true;
  };
}

let preDecodedBelowFold = false;

/**
 * Pre-decodes below-the-fold images during browser idle time so smooth scroll
 * never hits a synchronous decode stall mid-viewport.
 */
export function preDecodeBelowFoldImages(): () => void {
  if (typeof window === 'undefined' || preDecodedBelowFold) return () => {};
  preDecodedBelowFold = true;

  const isNarrow = window.innerWidth < 768;
  const urls = [
    isNarrow ? '/images/gym-interior-800.webp' : '/images/gym-interior-1200.webp',
    isNarrow ? '/images/system-athlete-600.webp' : '/images/system-athlete.webp',
    '/images/founder-700.webp',
    '/images/dumbbells.webp',
    '/images/shaker.webp',
    '/images/plate.webp',
    '/images/transform-male.webp',
    '/images/transform-female.webp',
  ];

  let cancelled = false;
  let index = 0;
  let timerId: number | undefined;
  let idleId: number | undefined;

  const w = window as Window & {
    requestIdleCallback?: (cb: (deadline?: { timeRemaining: () => number }) => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  const pumpNext = () => {
    if (cancelled || index >= urls.length) return;
    const src = urls[index++];
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    if (typeof img.decode === 'function') {
      img.decode().catch(() => {});
    }
    if (index < urls.length) {
      if (w.requestIdleCallback) {
        idleId = w.requestIdleCallback(pumpNext, { timeout: 1500 });
      } else {
        timerId = window.setTimeout(pumpNext, 120);
      }
    }
  };

  const kick = () => {
    if (w.requestIdleCallback) {
      idleId = w.requestIdleCallback(pumpNext, { timeout: 2000 });
    } else {
      timerId = window.setTimeout(pumpNext, 600);
    }
  };

  timerId = window.setTimeout(kick, 800);

  return () => {
    cancelled = true;
    if (timerId !== undefined) clearTimeout(timerId);
    if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
  };
}
