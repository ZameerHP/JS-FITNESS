import React, { useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  baseRotate?: number;
  straightenOnHover?: boolean;
  glareColor?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 6,
  baseRotate = 0,
  straightenOnHover = false,
  glareColor = 'rgba(182, 245, 0, 0.16)',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [transform, setTransform] = useState(
    baseRotate ? `perspective(1000px) rotate(${baseRotate}deg)` : 'perspective(1000px)'
  );
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const tiltY = (px - 0.5) * maxTilt * 2;
    const tiltX = (0.5 - py) * maxTilt * 2;
    const zRot = straightenOnHover ? 0 : baseRotate;
    setTransform(
      `perspective(1000px) rotate(${zRot}deg) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.01,1.01,1.01)`
    );
    setGlare({ x: px * 100, y: py * 100, opacity: 1 });
  };

  const handleLeave = () => {
    setTransform(
      baseRotate
        ? `perspective(1000px) rotate(${baseRotate}deg)`
        : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
    );
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transform, transformStyle: 'preserve-3d' }}
      className={`relative transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, ${glareColor}, transparent 70%)`,
        }}
      />
    </div>
  );
};
