import React, { useEffect, useRef } from 'react';
import { loadGsap } from '../../lib/gsapBridge';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CountUpProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = React.memo(
  ({ end, decimals = 0, prefix = '', suffix = '', duration = 700, className = '' }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimatedRef = useRef(false);
    const reducedMotion = useReducedMotion();
    const formattedEnd = `${prefix}${end.toFixed(decimals)}${suffix}`;

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      if (hasAnimatedRef.current || reducedMotion) {
        el.textContent = formattedEnd;
        hasAnimatedRef.current = true;
        return;
      }

      let tween: gsap.core.Tween | null = null;
      let cancelled = false;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            observer.disconnect();
            loadGsap().then(({ gsap }) => {
              if (cancelled || !ref.current) return;
              const startVal = Number((end * 0.35).toFixed(decimals));
              const state = { val: startVal };
              let lastText = '';
              tween = gsap.to(state, {
                val: end,
                duration: Math.min(duration, 700) / 1000,
                ease: 'power3.out',
                onUpdate: () => {
                  const next = `${prefix}${state.val.toFixed(decimals)}${suffix}`;
                  if (next !== lastText) {
                    lastText = next;
                    el.textContent = next;
                  }
                },
                onComplete: () => {
                  el.textContent = formattedEnd;
                },
              });
            });
          }
        },
        { threshold: 0.2 }
      );

      observer.observe(el);
      return () => {
        cancelled = true;
        observer.disconnect();
        tween?.kill();
        if (hasAnimatedRef.current && ref.current) {
          ref.current.textContent = formattedEnd;
        }
      };
    }, [end, decimals, prefix, suffix, duration, reducedMotion, formattedEnd]);

    return (
      <span ref={ref} className={className}>
        {formattedEnd}
      </span>
    );
  }
);
