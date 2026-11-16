import React, { useEffect, useRef } from 'react';
import { loadGsap } from '../../lib/gsapBridge';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';

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
  const groupRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const reducedMotion = useReducedMotion();
  const tier = useTier();

  useEffect(() => {
    const group = groupRef.current;
    const path = pathRef.current;
    const glow = glowRef.current;
    if (!group || !path) return;

    const interactiveHigh = tier === 'high' && !reducedMotion && !navigator.webdriver;

    if (!interactiveHigh) {
      group.style.opacity = '1';
      group.style.transform = 'translate3d(0, 0, 0)';
      return;
    }

    if (!scrub) {
      const len = path.getTotalLength();
      const lenPx = `${len.toFixed(1)}px`;
      const targets = glow ? [glow, path] : [path];
      targets.forEach((t) => {
        t.style.strokeDasharray = lenPx;
        t.style.strokeDashoffset = lenPx;
      });

      const state = { p: 1 };
      let cancelled = false;
      let ctx: gsap.Context | null = null;

      loadGsap().then(({ gsap }) => {
        if (cancelled || !pathRef.current) return;
        ctx = gsap.context(() => {
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
        }, path);
      });

      return () => {
        cancelled = true;
        ctx?.revert();
      };
    }

    // For scrub swooshes: compositor-only opacity + transform reveal via IntersectionObserver
    group.style.opacity = '0';
    group.style.transform = 'translate3d(-18px, 0, 0)';
    group.style.transition =
      'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          group.style.opacity = '1';
          group.style.transform = 'translate3d(0, 0, 0)';
          io.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    io.observe(group);
    return () => io.disconnect();
  }, [d, scrub, duration, reducedMotion, tier]);

  return (
    <g ref={groupRef} className={className}>
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
