import React, { useEffect, useRef } from 'react';
import { getScrollVelocity } from '../../hooks/useLenis';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const Marquee: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let xPercent = 0;
    let rafId = 0;

    const tick = () => {
      const vel = Math.min(4, Math.abs(getScrollVelocity()) * 0.035);
      xPercent -= 0.045 + vel * 0.08;
      if (xPercent <= -50) xPercent = 0;
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${xPercent}%, 0, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [reducedMotion]);

  const items = Array.from({ length: 8 });

  return (
    <section
      aria-label="Brand Motto Ticker"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#050505] py-5 select-none"
    >
      <div ref={trackRef} className="flex w-max items-center will-change-transform">
        {items.map((_, idx) => (
          <div key={idx} className="flex items-center gap-8 pr-8 whitespace-nowrap">
            <span className="font-display italic font-black text-3xl sm:text-5xl uppercase tracking-tight marquee-outline">
              TRAIN. EAT. SLEEP.{' '}
              <span className="text-[#B6F500]" style={{ WebkitTextStroke: '0px' }}>
                REPEAT.
              </span>
            </span>
            <span className="h-2 w-2 rounded-full bg-[#B6F500]/60" />
            <span className="font-display italic font-black text-3xl sm:text-5xl uppercase tracking-tight text-[#B6F500]">
              TRAIN. EAT. SLEEP. REPEAT.
            </span>
            <span className="h-2 w-2 rounded-full bg-white/30" />
          </div>
        ))}
      </div>
    </section>
  );
};
