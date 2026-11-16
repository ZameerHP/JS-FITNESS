import React, { useRef } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
  const reducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    const x = Math.max(-maxPull, Math.min(maxPull, relX * maxPull));
    const y = Math.max(-maxPull, Math.min(maxPull, relY * maxPull));
    ref.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'translate3d(0px, 0px, 0)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  );
};
