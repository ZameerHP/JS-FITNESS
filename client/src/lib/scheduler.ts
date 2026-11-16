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
 * a single requestAnimationFrame pass on mount.
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

let hasInteracted = false;
const interactionWaiters = new Set<() => void>();
let interactionListenersBound = false;

function triggerInteraction() {
  if (hasInteracted) return;
  hasInteracted = true;
  if (typeof window !== 'undefined') {
    window.removeEventListener('wheel', triggerInteraction);
    window.removeEventListener('touchstart', triggerInteraction);
    window.removeEventListener('pointerdown', triggerInteraction);
    window.removeEventListener('keydown', triggerInteraction);
    window.removeEventListener('scroll', triggerInteraction);
  }
  interactionWaiters.forEach((cb) => {
    try {
      cb();
    } catch {
      // Ignore setup errors
    }
  });
  interactionWaiters.clear();
}

/**
 * Defers below-the-fold scroll animation registration on desktop high-tier until
 * first user interaction (or fallback timeout) so initial load TBT stays near zero.
 */
export function onFirstUserInteraction(cb: () => void, fallbackMs = 4200): () => void {
  if (typeof window === 'undefined') return () => {};
  if (hasInteracted) {
    const cancelTask = scheduleChunkedTask(cb);
    return cancelTask;
  }

  interactionWaiters.add(cb);

  if (!interactionListenersBound) {
    interactionListenersBound = true;
    window.addEventListener('wheel', triggerInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', triggerInteraction, { passive: true, once: true });
    window.addEventListener('pointerdown', triggerInteraction, { passive: true, once: true });
    window.addEventListener('keydown', triggerInteraction, { passive: true, once: true });
    window.addEventListener('scroll', triggerInteraction, { passive: true, once: true });
    window.setTimeout(triggerInteraction, fallbackMs);
  }

  return () => {
    interactionWaiters.delete(cb);
  };
}
