import React, { useEffect, useState } from 'react';
import { gsap } from '../../lib/gsap';

export const ScrollProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
    };

    gsap.ticker.add(update);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      gsap.ticker.remove(update);
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-[#B6F500] shadow-[0_0_10px_rgba(182,245,0,0.85)] transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
