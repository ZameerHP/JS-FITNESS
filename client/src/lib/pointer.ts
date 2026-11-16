import { gsap } from './gsap';

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
let tickerAttached = false;

function onPointerMove(e: PointerEvent) {
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  state.x = e.clientX;
  state.y = e.clientY;
  state.normX = (e.clientX / w) * 2 - 1;
  state.normY = (e.clientY / h) * 2 - 1;
  state.target = e.target;
  state.dirty = true;
}

function tick() {
  if (subscribers.size === 0) return;
  subscribers.forEach((fn) => fn(state));
  state.dirty = false;
}

function ensureAttached() {
  if (typeof window === 'undefined') return;
  if (!initialized) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    initialized = true;
  }
  if (!tickerAttached && subscribers.size > 0) {
    gsap.ticker.add(tick);
    tickerAttached = true;
  }
}

export function subscribePointerTick(fn: TickSubscriber): () => void {
  subscribers.add(fn);
  ensureAttached();
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && tickerAttached) {
      gsap.ticker.remove(tick);
      tickerAttached = false;
    }
  };
}

export function getPointerState(): Readonly<PointerState> {
  return state;
}
