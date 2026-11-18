import React, { useEffect, useRef } from 'react';
import { loadGsap, getLoadedGsap } from '../../lib/gsapBridge';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MagneticProps {
  children: React.ReactNode;
  maxPull?: number;
  className?: string;
}

const MagneticInteractive: React.FC<MagneticProps> = ({
  children,
  maxPull = 8,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const xToRef = useRef<gsap.QuickToFunc | null>(null);
  const yToRef = useRef<gsap.QuickToFunc | null>(null);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const el = ref.current;
    return () => {
      mountedRef.current = false;
      if (el) getLoadedGsap()?.gsap.killTweensOf(el);
      xToRef.current = null;
      yToRef.current = null;
    };
  }, []);

  const handleEnter = () => {
    if (!ref.current) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    rectRef.current = ref.current.getBoundingClientRect();
    if (!xToRef.current && !loadingRef.current) {
      loadingRef.current = true;
      loadGsap().then(({ gsap }) => {
        loadingRef.current = false;
        if (!mountedRef.current || !ref.current) return;
        xToRef.current = gsap.quickTo(ref.current, 'x', { duration: 0.3, ease: 'power3.out' });
        yToRef.current = gsap.quickTo(ref.current, 'y', { duration: 0.3, ease: 'power3.out' });
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
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

export const Magnetic: React.FC<MagneticProps> = React.memo(
  ({ children, maxPull = 8, className = '' }) => {
    const reducedMotion = useReducedMotion();
    if (reducedMotion) {
      return <div className={`inline-block ${className}`}>{children}</div>;
    }
    return (
      <MagneticInteractive maxPull={maxPull} className={className}>
        {children}
      </MagneticInteractive>
    );
  }
);
