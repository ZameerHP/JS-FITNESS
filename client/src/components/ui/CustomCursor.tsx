import React, { useEffect, useRef } from 'react';
import { loadGsap } from '../../lib/gsapBridge';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { subscribePointerTick } from '../../lib/pointer';

export const CustomCursor: React.FC = React.memo(() => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  const isCoarse =
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024);

  const enabled = !reducedMotion && !isCoarse;

  useEffect(() => {
    if (!enabled || !dotRef.current || !ringRef.current || !labelRef.current) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    let cancelled = false;
    let unsub: (() => void) | null = null;

    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const setDotX = gsap.quickSetter(dot, 'x', 'px');
      const setDotY = gsap.quickSetter(dot, 'y', 'px');
      const setRingX = gsap.quickSetter(ring, 'x', 'px');
      const setRingY = gsap.quickSetter(ring, 'y', 'px');

      let ringX = -100;
      let ringY = -100;
      let lastMode: 'default' | 'pointer' | 'drag' | 'play' = 'default';

      unsub = subscribePointerTick((ptr) => {
        if (ptr.x < -50) return;

        if (ptr.dirty) {
          setDotX(ptr.x);
          setDotY(ptr.y);

          const el = ptr.target as HTMLElement | null;
          let nextMode: 'default' | 'pointer' | 'drag' | 'play' = 'default';
          const cursorZone = el?.closest?.('[data-cursor]')?.getAttribute('data-cursor');
          if (cursorZone === 'drag') nextMode = 'drag';
          else if (cursorZone === 'play') nextMode = 'play';
          else if (el?.closest?.('a, button, [role="button"], input, select, textarea')) {
            nextMode = 'pointer';
          }

          if (nextMode !== lastMode) {
            lastMode = nextMode;
            const isExpanded = nextMode !== 'default';
            dot.style.opacity = nextMode === 'drag' || nextMode === 'play' ? '0' : '1';
            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${
              isExpanded ? 1.8 : 1
            })`;
            ring.style.backgroundColor = isExpanded ? 'rgba(182, 245, 0, 0.2)' : 'transparent';
            ring.style.borderColor = isExpanded ? '#B6F500' : 'rgba(182, 245, 0, 0.7)';
            label.textContent = nextMode === 'drag' ? 'DRAG' : nextMode === 'play' ? 'PLAY' : '';
          }
        }

        const dx = ptr.x - ringX;
        const dy = ptr.y - ringY;
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
          ringX += dx * 0.15;
          ringY += dy * 0.15;
          setRingX(ringX);
          setRingY(ringY);
        }
      });
    });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 h-2 w-2 rounded-full bg-[#B6F500]"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 -ml-[18px] -mt-[18px] flex h-[36px] w-[36px] items-center justify-center rounded-full border border-[#B6F500]/70 transition-[background-color,border-color] duration-150"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <span
          ref={labelRef}
          className="text-[7px] font-black tracking-[0.14em] text-[#B6F500] uppercase"
        />
      </div>
    </div>
  );
});
