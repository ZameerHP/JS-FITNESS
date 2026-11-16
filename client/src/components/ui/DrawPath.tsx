import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
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
    const targets = glow ? [glow, path] : [path];

    if (reducedMotion) {
      gsap.set(targets, { strokeDasharray: len, strokeDashoffset: 0 });
      return;
    }

    gsap.set(targets, { strokeDasharray: len, strokeDashoffset: len });

    const ctx = gsap.context(() => {
      gsap.to(targets, {
        strokeDashoffset: 0,
        duration: scrub ? undefined : duration,
        ease: scrub ? 'none' : 'power3.out',
        scrollTrigger: {
          trigger: path,
          start: 'top 90%',
          end: scrub ? 'bottom 45%' : undefined,
          scrub: scrub ? true : false,
          once: !scrub,
        },
      });
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
