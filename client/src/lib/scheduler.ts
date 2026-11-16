type QueueItem = {
  fn: () => void;
  cancelled: boolean;
};

const queue: QueueItem[] = [];
let rafScheduled = false;

function flushQueue(): void {
  rafScheduled = false;
  while (queue.length > 0) {
    const item = queue.shift()!;
    if (!item.cancelled) {
      try {
        item.fn();
      } catch {
        // Keep remaining tasks alive if one setup throws
      }
    }
  }
}

/**
 * Batches below-the-fold ScrollTrigger and animation setup callbacks into
 * a single requestAnimationFrame pass on mount so triggers register before
 * user scrolling begins without MessageChannel churn or late refreshes.
 */
export function scheduleChunkedTask(
  fn: () => void,
  _priority: 'background' | 'user-visible' = 'background'
): () => void {
  if (typeof window === 'undefined') return () => {};

  const item: QueueItem = { fn, cancelled: false };
  queue.push(item);

  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(flushQueue);
  }

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
