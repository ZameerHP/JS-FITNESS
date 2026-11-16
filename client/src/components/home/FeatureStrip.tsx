import React, { useEffect, useRef } from 'react';
import { loadGsap } from '../../lib/gsapBridge';
import { HOME_COPY } from '../../config/siteConfig';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';
import { onFirstUserInteraction, scheduleChunkedTask } from '../../lib/scheduler';

const FeatureIcon: React.FC<{ name: string }> = ({ name }) => {
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

export const FeatureStrip: React.FC = React.memo(() => {
  const panelRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const reducedMotion = useReducedMotion();
  const tier = useTier();

  useEffect(() => {
    const el = panelRef.current;
    if (!el || reducedMotion || tier !== 'high' || navigator.webdriver) return;

    let cancelled = false;
    let ctx: gsap.Context | null = null;
    let cancelTask: (() => void) | null = null;
    const cancelInteract = onFirstUserInteraction(() => {
      cancelTask = scheduleChunkedTask(() => {
        loadGsap().then(({ gsap }) => {
          if (cancelled || !panelRef.current) return;
          const strokes = el.querySelectorAll<SVGGeometryElement>('.feature-stroke');
          const strokeItems = Array.from(strokes).map((s) => {
            const len = typeof s.getTotalLength === 'function' ? s.getTotalLength() : 100;
            const px = `${len.toFixed(1)}px`;
            s.style.strokeDasharray = px;
            s.style.strokeDashoffset = px;
            return { s, len };
          });

          ctx = gsap.context(() => {
            gsap.fromTo(
              el,
              { y: 50, rotateX: 14, opacity: 0 },
              {
                y: 0,
                rotateX: 6,
                opacity: 1,
                duration: 0.75,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: el,
                  start: 'top 92%',
                  once: true,
                },
              }
            );

            const strokeState = { p: 1 };
            gsap.to(strokeState, {
              p: 0,
              duration: 0.75,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                once: true,
              },
              onUpdate: () => {
                const p = strokeState.p;
                for (let i = 0; i < strokeItems.length; i += 1) {
                  const item = strokeItems[i];
                  item.s.style.strokeDashoffset = `${(item.len * p).toFixed(1)}px`;
                }
              },
            });
          }, el);
        });
      });
    });

    return () => {
      cancelled = true;
      cancelInteract();
      cancelTask?.();
      ctx?.revert();
    };
  }, [reducedMotion, tier]);

  // Pause conic border rotation when offscreen
  useEffect(() => {
    const el = panelRef.current;
    if (!el || tier !== 'high' || reducedMotion || navigator.webdriver) return;
    const io = new IntersectionObserver(
      (entries) => {
        el.dataset.inview = entries[0]?.isIntersecting ? '1' : '0';
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [tier, reducedMotion]);

  const handleEnter = () => {
    if (!panelRef.current || reducedMotion || tier !== 'high') return;
    rectRef.current = panelRef.current.getBoundingClientRect();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || tier !== 'high' || e.pointerType === 'touch') return;
    const rect = rectRef.current || panelRef.current?.getBoundingClientRect();
    if (!rect || !spotlightRef.current) return;
    rectRef.current = rect;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    spotlightRef.current.style.opacity = '1';
    spotlightRef.current.style.background = `radial-gradient(240px circle at ${x.toFixed(
      1
    )}% ${y.toFixed(1)}%, rgba(182,245,0,0.14), transparent 70%)`;
  };

  const handleLeave = () => {
    rectRef.current = null;
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '0';
    }
  };

  return (
    <section
      aria-label="Key Gym Features"
      className="relative z-20 -mt-[60px] mx-auto max-w-[1280px] px-5 lg:px-8"
    >
      <div style={{ perspective: '1000px' }}>
        <div
          ref={panelRef}
          onPointerEnter={handleEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handleLeave}
          style={{ transform: 'rotateX(6deg)' }}
          className="feature-conic-border relative overflow-hidden rounded-[28px] glass-panel glass-blur shadow-[0_24px_64px_rgba(0,0,0,0.85)]"
        >
          {/* Left & Right edge lime ambient glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -left-10 w-56 h-36 rounded-full opacity-55"
            style={{
              background: 'radial-gradient(circle, rgba(182,245,0,0.28) 0%, transparent 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-10 w-56 h-36 rounded-full opacity-55"
            style={{
              background: 'radial-gradient(circle, rgba(182,245,0,0.28) 0%, transparent 70%)',
            }}
          />

          {/* Cursor-following radial spotlight (mutated directly on ref) */}
          <div
            ref={spotlightRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          />

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {HOME_COPY.features.map((feat, idx) => (
              <div
                key={feat.id}
                className={`group flex flex-col items-center justify-center px-4 py-7 text-center transition-colors duration-300 hover-surface ${
                  idx > 0 ? 'lg:border-l lg:border-white/[0.08]' : ''
                } ${idx === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="mb-3 feature-icon-wrap">
                  <FeatureIcon name={feat.icon} />
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
});
