import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CountUpProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1400,
  className = '',
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState<string>(
    reducedMotion ? `${prefix}${end.toFixed(decimals)}${suffix}` : `${prefix}${(0).toFixed(decimals)}${suffix}`
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(`${prefix}${end.toFixed(decimals)}${suffix}`);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const progress = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - progress, 3);
              const value = end * eased;
              setDisplay(`${prefix}${value.toFixed(decimals)}${suffix}`);
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, decimals, prefix, suffix, duration, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
};
