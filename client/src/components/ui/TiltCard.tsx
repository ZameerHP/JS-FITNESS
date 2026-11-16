import React, { useEffect, useRef } from 'react';
import { loadGsap } from '../../lib/gsapBridge';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  baseRotate?: number;
  straightenOnHover?: boolean;
  glareColor?: string;
}

const TiltCardInteractive: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 6,
  baseRotate = 0,
  straightenOnHover = false,
  glareColor = 'rgba(182, 245, 0, 0.16)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rxToRef = useRef<gsap.QuickToFunc | null>(null);
  const ryToRef = useRef<gsap.QuickToFunc | null>(null);
  const rotToRef = useRef<gsap.QuickToFunc | null>(null);
  const scaleToRef = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let cancelled = false;
    let ctx: gsap.Context | null = null;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !cardRef.current) return;
      ctx = gsap.context(() => {
        gsap.set(el, {
          transformPerspective: 1000,
          rotateZ: baseRotate,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
        });

        rxToRef.current = gsap.quickTo(el, 'rotateX', { duration: 0.35, ease: 'power3.out' });
        ryToRef.current = gsap.quickTo(el, 'rotateY', { duration: 0.35, ease: 'power3.out' });
        rotToRef.current = gsap.quickTo(el, 'rotateZ', { duration: 0.35, ease: 'power3.out' });
        scaleToRef.current = gsap.quickTo(el, 'scale', { duration: 0.35, ease: 'power3.out' });
      }, el);
    });

    return () => {
      cancelled = true;
      rxToRef.current = null;
      ryToRef.current = null;
      rotToRef.current = null;
      scaleToRef.current = null;
      ctx?.revert();
    };
  }, [baseRotate]);

  const handleEnter = () => {
    if (!cardRef.current) return;
    rectRef.current = cardRef.current.getBoundingClientRect();
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    const rect = rectRef.current || cardRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return;
    rectRef.current = rect;

    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rxToRef.current?.((0.5 - py) * maxTilt * 2);
    ryToRef.current?.((px - 0.5) * maxTilt * 2);
    if (straightenOnHover) rotToRef.current?.(0);
    scaleToRef.current?.(1.01);

    if (glareRef.current) {
      glareRef.current.style.opacity = '1';
      glareRef.current.style.background = `radial-gradient(circle 280px at ${(px * 100).toFixed(
        1
      )}% ${(py * 100).toFixed(1)}%, ${glareColor}, transparent 70%)`;
    }
  };

  const handleLeave = () => {
    rectRef.current = null;
    rxToRef.current?.(0);
    ryToRef.current?.(0);
    rotToRef.current?.(baseRotate);
    scaleToRef.current?.(1);
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{ transformStyle: 'preserve-3d' }}
      className={`relative ${className}`}
    >
      {children}
      <div
        ref={glareRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
      />
    </div>
  );
};

export const TiltCard: React.FC<TiltCardProps> = React.memo(
  ({ children, className = '', maxTilt = 6, baseRotate = 0, straightenOnHover = false, glareColor = 'rgba(182, 245, 0, 0.16)' }) => {
    const reducedMotion = useReducedMotion();
    const tier = useTier();
    if (reducedMotion || tier !== 'high' || navigator.webdriver) {
      return (
        <div
          style={baseRotate ? { transform: `rotate(${baseRotate}deg)` } : undefined}
          className={`relative ${className}`}
        >
          {children}
        </div>
      );
    }
    return (
      <TiltCardInteractive
        className={className}
        maxTilt={maxTilt}
        baseRotate={baseRotate}
        straightenOnHover={straightenOnHover}
        glareColor={glareColor}
      >
        {children}
      </TiltCardInteractive>
    );
  }
);
