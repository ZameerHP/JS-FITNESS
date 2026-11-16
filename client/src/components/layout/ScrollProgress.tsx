import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { subscribeScroll } from '../../hooks/useLenis';

export const ScrollProgress: React.FC = React.memo(() => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const setScale = gsap.quickSetter(el, 'scaleX');
    setScale(0);

    return subscribeScroll((scrollY, limit) => {
      const ratio = limit > 0 ? Math.min(1, Math.max(0, scrollY / limit)) : 0;
      setScale(ratio);
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-transparent pointer-events-none"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-[#B6F500] shadow-[0_0_8px_rgba(182,245,0,0.75)]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
});
