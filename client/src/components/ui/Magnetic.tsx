import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';

interface MagneticProps {
  children: React.ReactNode;
  maxPull?: number;
  className?: string;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  maxPull = 8,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const xToRef = useRef<gsap.QuickToFunc | null>(null);
  const yToRef = useRef<gsap.QuickToFunc | null>(null);
  const reducedMotion = useReducedMotion();
  const tier = useTier();
  const enabled = !reducedMotion && tier === 'high' && !navigator.webdriver;

  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) gsap.killTweensOf(el);
      xToRef.current = null;
      yToRef.current = null;
    };
  }, []);

  const handleEnter = () => {
    if (!enabled || !ref.current) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    rectRef.current = ref.current.getBoundingClientRect();
    if (!xToRef.current) {
      xToRef.current = gsap.quickTo(ref.current, 'x', { duration: 0.3, ease: 'power3.out' });
      yToRef.current = gsap.quickTo(ref.current, 'y', { duration: 0.3, ease: 'power3.out' });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || e.pointerType === 'touch') return;
    const rect = rectRef.current;
    if (!rect || !rect.width || !rect.height) return;
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    xToRef.current?.(Math.max(-maxPull, Math.min(maxPull, relX * maxPull)));
    yToRef.current?.(Math.max(-maxPull, Math.min(maxPull, relY * maxPull)));
  };

  const handleLeave = () => {
    rectRef.current = null;
    xToRef.current?.(0);
    yToRef.current?.(0);
  };

  return (
    <div
      ref={ref}
      onPointerEnter={handleEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handleLeave}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  );
};
