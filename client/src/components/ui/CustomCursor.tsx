import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<'default' | 'pointer' | 'drag' | 'play'>('default');

  useEffect(() => {
    if (reducedMotion) return;
    if (typeof window === 'undefined') return;
    const isFine = window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 1024;
    if (!isFine) return;
    setEnabled(true);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      const cursorZone = target?.closest('[data-cursor]')?.getAttribute('data-cursor');
      if (cursorZone === 'drag') {
        setMode('drag');
      } else if (cursorZone === 'play') {
        setMode('play');
      } else if (target?.closest('a, button, [role="button"], input, select, textarea')) {
        setMode('pointer');
      } else {
        setMode('default');
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  if (!enabled) return null;

  const isExpanded = mode !== 'default';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999]">
      {/* 8px dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 h-2 w-2 rounded-full bg-[#B6F500] transition-opacity duration-200"
        style={{ opacity: mode === 'drag' || mode === 'play' ? 0 : 1 }}
      />
      {/* 36px trailing ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -ml-[18px] -mt-[18px] flex h-[36px] w-[36px] items-center justify-center rounded-full border transition-all duration-200 ${
          isExpanded
            ? 'scale-[1.8] border-[#B6F500] bg-[#B6F500]/20'
            : 'scale-100 border-[#B6F500]/70 bg-transparent'
        }`}
      >
        {(mode === 'drag' || mode === 'play') && (
          <span className="text-[7px] font-black tracking-[0.14em] text-[#B6F500] uppercase">
            {mode === 'drag' ? 'DRAG' : 'PLAY'}
          </span>
        )}
      </div>
    </div>
  );
};
