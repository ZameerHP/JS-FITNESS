export interface PointerState {
  x: number;
  y: number;
  normX: number;
  normY: number;
  target: EventTarget | null;
  dirty: boolean;
}

const state: PointerState = {
  x: -100,
  y: -100,
  normX: 0,
  normY: 0,
  target: null,
  dirty: false,
};

type TickSubscriber = (pointer: Readonly<PointerState>) => void;
const subscribers = new Set<TickSubscriber>();
let initialized = false;
let rafPending = false;
let rafId = 0;

function tick() {
  rafPending = false;
  if (subscribers.size === 0) return;
  subscribers.forEach((fn) => fn(state));
  state.dirty = false;
}

function onPointerMove(e: PointerEvent) {
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  state.x = e.clientX;
  state.y = e.clientY;
  state.normX = (e.clientX / w) * 2 - 1;
  state.normY = (e.clientY / h) * 2 - 1;
  state.target = e.target;
  state.dirty = true;
  if (!rafPending && subscribers.size > 0) {
    rafPending = true;
    rafId = requestAnimationFrame(tick);
  }
}

function ensureAttached() {
  if (typeof window === 'undefined') return;
  if (!initialized) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    initialized = true;
  }
}

export function subscribePointerTick(fn: TickSubscriber): () => void {
  subscribers.add(fn);
  ensureAttached();
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && rafPending) {
      cancelAnimationFrame(rafId);
      rafPending = false;
    }
  };
}

export function getPointerState(): Readonly<PointerState> {
  return state;
}
