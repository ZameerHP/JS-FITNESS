import React, { useEffect, useRef } from 'react';
import { getScrollVelocity, subscribeScroll } from '../../hooks/useLenis';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const Marquee: React.FC = React.memo(() => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || reducedMotion) return;

    let inView = false;

    const syncState = () => {
      track.style.animationPlayState = inView && !document.hidden ? 'running' : 'paused';
    };

    const io = new IntersectionObserver(
      (entries) => {
        inView = Boolean(entries[0]?.isIntersecting);
        syncState();
      },
      { threshold: 0.02 }
    );
    io.observe(section);
    document.addEventListener('visibilitychange', syncState);

    // Light scroll velocity tilt / speed nudge only during scroll events (zero idle rAF)
    const unsubScroll = subscribeScroll(() => {
      if (!inView) return;
      const vel = Math.min(2.5, Math.abs(getScrollVelocity()) * 0.04);
      const anim = track.getAnimations?.()[0];
      if (anim) {
        anim.playbackRate = 1 + vel;
      }
    });

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', syncState);
      unsubScroll();
    };
  }, [reducedMotion]);

  const items = Array.from({ length: 6 });

  return (
    <section
      ref={sectionRef}
      aria-label="Brand Motto Ticker"
      className="cv-section relative overflow-hidden border-t border-white/[0.06] bg-[#050505] py-5 select-none"
    >
      <div
        ref={trackRef}
        className={`flex w-max items-center ${reducedMotion ? '' : 'marquee-track-anim'}`}
      >
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
});
