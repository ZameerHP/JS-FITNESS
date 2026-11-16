import React, { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY } from '../../config/siteConfig';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const FeatureIcon: React.FC<{ name: string; active: boolean }> = ({ name }) => {
  switch (name) {
    case 'clock':
      return (
        <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-[#B6F500] fill-none" strokeWidth="1.8">
          <circle cx="16" cy="16" r="11" className="feature-stroke" />
          <path d="M16 10v6l4 2.5" strokeLinecap="round" className="feature-stroke" />
        </svg>
      );
    case 'phone':
      return (
        <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-[#B6F500] fill-none" strokeWidth="1.8">
          <rect x="9" y="4" width="14" height="24" rx="3" className="feature-stroke" />
          <path d="M14 13l5 3-5 3v-6z" className="feature-stroke" />
          <circle cx="16" cy="24" r="0.8" fill="#B6F500" />
        </svg>
      );
    case 'group':
      return (
        <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-[#B6F500] fill-none" strokeWidth="1.8">
          <circle cx="16" cy="11" r="3.5" className="feature-stroke" />
          <path d="M9.5 25c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" strokeLinecap="round" className="feature-stroke" />
          <circle cx="7.5" cy="13.5" r="2.2" className="feature-stroke" />
          <circle cx="24.5" cy="13.5" r="2.2" className="feature-stroke" />
          <path d="M4 25c0-2.4 1.6-4.2 3.8-4.6M28 25c0-2.4-1.6-4.2-3.8-4.6" strokeLinecap="round" className="feature-stroke" />
        </svg>
      );
    case 'chart':
      return (
        <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-[#B6F500] fill-none" strokeWidth="1.8">
          <path d="M6 25h20" strokeLinecap="round" className="feature-stroke" />
          <rect x="8" y="17" width="3.5" height="8" rx="1" className="feature-stroke" />
          <rect x="14.2" y="12" width="3.5" height="13" rx="1" className="feature-stroke" />
          <rect x="20.5" y="7" width="3.5" height="18" rx="1" className="feature-stroke" />
          <path d="M7 13l7-5 5 2 6-5" strokeLinecap="round" strokeLinejoin="round" className="feature-stroke" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" className="w-7 h-7 stroke-[#B6F500] fill-none" strokeWidth="1.8">
          <polygon points="8,7 24,7 28,13 16,26 4,13" strokeLinejoin="round" className="feature-stroke" />
          <path d="M4 13h24M11 7l5 19 5-19" strokeLinejoin="round" className="feature-stroke" />
        </svg>
      );
  }
};

export const FeatureStrip: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false });

  useEffect(() => {
    const el = panelRef.current;
    if (!el || reducedMotion) return;

    const strokes = el.querySelectorAll<SVGGeometryElement>('.feature-stroke');
    strokes.forEach((s) => {
      if (typeof s.getTotalLength === 'function') {
        const len = s.getTotalLength();
        gsap.set(s, { strokeDasharray: len, strokeDashoffset: len });
      }
    });

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 80, rotateX: 20, opacity: 0 },
        {
          y: 0,
          rotateX: 6,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            once: true,
          },
        }
      );

      gsap.to(strokes, {
        strokeDashoffset: 0,
        duration: 0.85,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!panelRef.current || reducedMotion) return;
    const rect = panelRef.current.getBoundingClientRect();
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  return (
    <section
      aria-label="Key Gym Features"
      className="relative z-20 -mt-[60px] mx-auto max-w-[1280px] px-5 lg:px-8"
    >
      <div style={{ perspective: '1000px' }}>
        <div
          ref={panelRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setSpotlight((p) => ({ ...p, active: false }))}
          className="feature-conic-border relative overflow-hidden rounded-[28px] glass-panel shadow-[0_24px_64px_rgba(0,0,0,0.85)]"
        >
          {/* Left & Right edge lime ambient glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -left-10 w-56 h-36 rounded-full bg-[#B6F500]/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-10 w-56 h-36 rounded-full bg-[#B6F500]/25 blur-3xl"
          />

          {/* Cursor-following radial spotlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: spotlight.active ? 1 : 0,
              background: `radial-gradient(240px circle at ${spotlight.x}% ${spotlight.y}%, rgba(182,245,0,0.14), transparent 70%)`,
            }}
          />

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {HOME_COPY.features.map((feat, idx) => (
              <div
                key={feat.id}
                className={`group flex flex-col items-center justify-center px-4 py-7 text-center transition-colors duration-300 hover:bg-white/[0.03] ${
                  idx > 0 ? 'lg:border-l lg:border-white/[0.08]' : ''
                } ${idx === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="mb-3 transition-all duration-300 group-hover:-translate-y-1 group-hover:drop-shadow-[0_0_12px_rgba(182,245,0,0.8)]">
                  <FeatureIcon name={feat.icon} active />
                </div>
                <div className="text-[14px] font-medium leading-snug text-white group-hover:text-[#B6F500] transition-colors">
                  {feat.lines[0]}
                  <br />
                  {feat.lines[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
