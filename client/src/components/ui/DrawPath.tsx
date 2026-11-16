import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface DrawPathProps {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  scrub?: boolean;
  duration?: number;
  className?: string;
  filterId?: string;
  dualGlow?: boolean;
}

export const DrawPath: React.FC<DrawPathProps> = ({
  d,
  stroke = '#B6F500',
  strokeWidth = 3,
  scrub = true,
  duration = 1.2,
  className = '',
  dualGlow = true,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const path = pathRef.current;
    const glow = glowRef.current;
    if (!path) return;

    const len = path.getTotalLength();
    const lenPx = `${len.toFixed(1)}px`;
    const targets = glow ? [glow, path] : [path];

    if (reducedMotion) {
      targets.forEach((t) => {
        t.style.strokeDasharray = lenPx;
        t.style.strokeDashoffset = '0px';
      });
      return;
    }

    targets.forEach((t) => {
      t.style.strokeDasharray = lenPx;
      t.style.strokeDashoffset = lenPx;
    });

    const ctx = gsap.context(() => {
      if (scrub) {
        let lastOffset = '';
        ScrollTrigger.create({
          trigger: path,
          start: 'top 90%',
          end: 'bottom 45%',
          onUpdate: (self) => {
            const v = `${(len * (1 - self.progress)).toFixed(1)}px`;
            if (v === lastOffset) return;
            lastOffset = v;
            path.style.strokeDashoffset = v;
            if (glow) glow.style.strokeDashoffset = v;
          },
        });
      } else {
        const state = { p: 1 };
        gsap.to(state, {
          p: 0,
          duration,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: path,
            start: 'top 90%',
            once: true,
          },
          onUpdate: () => {
            const v = `${(len * state.p).toFixed(1)}px`;
            path.style.strokeDashoffset = v;
            if (glow) glow.style.strokeDashoffset = v;
          },
        });
      }
    }, path);

    return () => ctx.revert();
  }, [d, scrub, duration, reducedMotion]);

  return (
    <g className={className}>
      {dualGlow && (
        <path
          ref={glowRef}
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth * 3.5}
          strokeOpacity={0.2}
          strokeLinecap="round"
        />
      )}
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </g>
  );
};
