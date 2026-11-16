import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';

interface CountUpProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = React.memo(
  ({ end, decimals = 0, prefix = '', suffix = '', duration = 1400, className = '' }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const reducedMotion = useReducedMotion();
    const tier = useTier();
    const initialText = `${prefix}${end.toFixed(decimals)}${suffix}`;

    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      if (reducedMotion || tier === 'low') {
        el.textContent = `${prefix}${end.toFixed(decimals)}${suffix}`;
        return;
      }

      let tween: gsap.core.Tween | null = null;
      let started = false;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && !started) {
            started = true;
            observer.disconnect();
            const state = { val: 0 };
            let lastText = '';
            tween = gsap.to(state, {
              val: end,
              duration: duration / 1000,
              ease: 'power3.out',
              onUpdate: () => {
                const next = `${prefix}${state.val.toFixed(decimals)}${suffix}`;
                if (next !== lastText) {
                  lastText = next;
                  el.textContent = next;
                }
              },
            });
          }
        },
        { threshold: 0.2 }
      );

      observer.observe(el);
      return () => {
        observer.disconnect();
        tween?.kill();
      };
    }, [end, decimals, prefix, suffix, duration, reducedMotion, tier]);

    return (
      <span ref={ref} className={className}>
        {initialText}
      </span>
    );
  }
);
