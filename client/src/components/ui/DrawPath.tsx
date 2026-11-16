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
}

export const DrawPath: React.FC<DrawPathProps> = ({
  d,
  stroke = '#B6F500',
  strokeWidth = 3,
  scrub = true,
  duration = 1.4,
  className = '',
  filterId,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();

    if (reducedMotion) {
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: 0 });
      return;
    }

    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: scrub ? undefined : duration,
        ease: scrub ? 'none' : 'power3.out',
        scrollTrigger: {
          trigger: path,
          start: 'top 90%',
          end: scrub ? 'bottom 45%' : undefined,
          scrub: scrub ? 1 : false,
          once: !scrub,
        },
      });
    }, path);

    return () => ctx.revert();
  }, [d, scrub, duration, reducedMotion]);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      filter={filterId ? `url(#${filterId})` : undefined}
      className={className}
    />
  );
};
