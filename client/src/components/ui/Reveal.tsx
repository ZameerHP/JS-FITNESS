import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type RevealDirection = 'up' | 'left' | 'right' | 'scale';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  durationMs?: number;
  yOffset?: number;
  direction?: RevealDirection;
  immediate?: boolean;
}

function getHiddenTransform(direction: RevealDirection, distance: number): string {
  switch (direction) {
    case 'left':
      return `translate3d(-${distance}px, 0, 0)`;
    case 'right':
      return `translate3d(${distance}px, 0, 0)`;
    case 'scale':
      return 'translate3d(0, 14px, 0) scale(0.95)';
    default:
      return `translate3d(0, ${distance}px, 0)`;
  }
}

/**
 * Smooth GPU-composited reveal wrapper (opacity + transform) using native IntersectionObserver.
 * Supports immediate above-the-fold mount choreography (`immediate`) and scroll-triggered entrances.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  durationMs = 660,
  yOffset = 24,
  direction = 'up',
  immediate = false,
}) => {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(() => reducedMotion);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || visible) return;
    const el = ref.current;
    if (!el) return;

    if (immediate) {
      const raf = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(raf);
    }

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
      const raf = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, visible, immediate]);

  return (
    <div
      ref={ref}
      className={className}
      style={
        reducedMotion
          ? undefined
          : {
              opacity: visible ? 1 : 0,
              transform: visible
                ? 'translate3d(0, 0, 0) scale(1)'
                : getHiddenTransform(direction, yOffset),
              transitionProperty: 'opacity, transform',
              transitionDuration: `${durationMs}ms`,
              transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
              transitionDelay: `${delayMs}ms`,
              willChange: visible ? 'auto' : 'opacity, transform',
            }
      }
    >
      {children}
    </div>
  );
};
