import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToTopImmediate } from '../../hooks/useLenis';

export const PageTransition: React.FC = React.memo(() => {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstMountRef = useRef(true);

  useEffect(() => {
    scrollToTopImmediate();

    if (firstMountRef.current) {
      firstMountRef.current = false;
      return;
    }

    // Kill ScrollTriggers of leaving route cleanly
    ScrollTrigger.getAll().forEach((st) => st.kill());

    if (reducedMotion || !overlayRef.current) return;

    const el = overlayRef.current;
    gsap.killTweensOf(el);
    const tl = gsap.timeline();
    tl.set(el, { xPercent: -100, display: 'flex' })
      .to(el, { xPercent: 0, duration: 0.24, ease: 'power3.inOut' })
      .to(el, { xPercent: 100, duration: 0.26, ease: 'power3.inOut', delay: 0.04 })
      .set(el, { display: 'none' });

    return () => {
      tl.kill();
    };
  }, [location.pathname, reducedMotion]);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[9980] hidden items-center justify-center bg-[#B6F500] pointer-events-none"
      style={{ transform: 'translate3d(-100%, 0, 0)' }}
    >
      <div className="font-display italic font-black text-7xl tracking-tighter text-[#050505]">
        JS
      </div>
    </div>
  );
});
