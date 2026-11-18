import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToTopImmediate } from '../../hooks/useLenis';

export const PageTransition: React.FC = React.memo(() => {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef<string | null>(null);
  const animRef = useRef<Animation | null>(null);

  useEffect(() => {
    scrollToTopImmediate();

    if (prevPathRef.current === null) {
      prevPathRef.current = location.pathname;
      return;
    }

    if (prevPathRef.current === location.pathname) return;
    prevPathRef.current = location.pathname;

    const el = overlayRef.current;
    if (!el || reducedMotion || typeof el.animate !== 'function') return;

    animRef.current?.cancel();
    el.style.display = 'flex';

    const anim = el.animate(
      [
        { transform: 'translate3d(-100%, 0, 0)', offset: 0 },
        { transform: 'translate3d(0%, 0, 0)', offset: 0.42 },
        { transform: 'translate3d(0%, 0, 0)', offset: 0.56 },
        { transform: 'translate3d(100%, 0, 0)', offset: 1 },
      ],
      {
        duration: 500,
        easing: 'cubic-bezier(0.76, 0, 0.24, 1)',
        fill: 'forwards',
      }
    );

    animRef.current = anim;
    anim.onfinish = () => {
      if (overlayRef.current === el) {
        el.style.display = 'none';
      }
    };

    return () => {
      anim.cancel();
    };
  }, [location.pathname, reducedMotion]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[9980] hidden items-center justify-center bg-[#B6F500] pointer-events-none"
      style={{ transform: 'translate3d(-100%, 0, 0)' }}
    >
      <div className="rounded-[28px] bg-[#050505] border border-white/15 px-7 py-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] flex items-center justify-center">
        <img
          src="/images/js-logo-256.webp"
          width={256}
          height={278}
          alt=""
          className="h-24 w-auto object-contain select-none"
        />
      </div>
    </div>
  );
});
