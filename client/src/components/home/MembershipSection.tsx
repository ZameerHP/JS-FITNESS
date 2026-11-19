import React, { useEffect, useRef } from 'react';
import { Star, BarChart3, Crown } from 'lucide-react';
import { loadGsap } from '../../lib/gsapBridge';
import { HOME_COPY, PricingPhase } from '../../config/siteConfig';
import { useSiteContent } from '../../context/ContentContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scheduleChunkedTask } from '../../lib/scheduler';
import { Button } from '../ui/Button';
import { DrawPath } from '../ui/DrawPath';
import { TiltCard } from '../ui/TiltCard';
import { Reveal } from '../ui/Reveal';

const PhaseIcon: React.FC<{ icon: PricingPhase['icon'] }> = ({ icon }) => {
  switch (icon) {
    case 'star':
      return <Star className="w-5 h-5 text-[#B6F500] fill-[#B6F500]/20" strokeWidth={1.85} />;
    case 'bars':
      return <BarChart3 className="w-5 h-5 text-[#B6F500]" strokeWidth={1.85} />;
    case 'crown':
      return <Crown className="w-5 h-5 text-[#B6F500]" strokeWidth={1.85} />;
  }
};

export const MembershipSection: React.FC = React.memo(() => {
  const { config } = useSiteContent();
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const accessRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLSpanElement>(null);
  const daysRef = useRef<HTMLSpanElement>(null);
  const slashRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (reducedMotion) {
      if (hoursRef.current) hoursRef.current.textContent = '24';
      if (daysRef.current) daysRef.current.textContent = '7';
      if (slashRef.current) slashRef.current.style.opacity = '1';
      return;
    }

    let cancelled = false;
    let ctx: gsap.Context | null = null;
    const cancelTask = scheduleChunkedTask(() => {
      loadGsap().then(({ gsap }) => {
        if (cancelled || !sectionRef.current) return;
        ctx = gsap.context(() => {
          if (bgRef.current) {
            gsap.fromTo(
              bgRef.current,
              { scale: 1.04 },
              {
                scale: 1.14,
                ease: 'none',
                scrollTrigger: {
                  trigger: el,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                },
              }
            );
          }

          const odometer = { h: 0, d: 0 };
          let lastH = -1;
          let lastD = -1;
          if (!hasAnimatedRef.current) {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: el,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                  hasAnimatedRef.current = true;
                },
              },
            });

            tl.to(odometer, {
              h: 24,
              d: 7,
              duration: 0.75,
              ease: 'power3.out',
              onUpdate: () => {
                const h = Math.round(odometer.h);
                const d = Math.round(odometer.d);
                if (h !== lastH && hoursRef.current) {
                  lastH = h;
                  hoursRef.current.textContent = String(h);
                }
                if (d !== lastD && daysRef.current) {
                  lastD = d;
                  daysRef.current.textContent = String(d);
                }
              },
            })
              .fromTo(
                slashRef.current,
                { y: -20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
                0.25
              )
              .fromTo(
                accessRef.current,
                { x: -24, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
                0.25
              );
          }

          if (cardRef.current) {
            gsap.fromTo(
              cardRef.current,
              { x: 40, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: cardRef.current,
                  start: 'top 86%',
                  once: true,
                },
              }
            );

            const rows = cardRef.current.querySelectorAll('.phase-row');
            gsap.fromTo(
              rows,
              { y: 16, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.45,
                stagger: 0.1,
                delay: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: cardRef.current,
                  start: 'top 86%',
                  once: true,
                },
              }
            );
          }
        }, el);
      });
    });

    return () => {
      cancelled = true;
      cancelTask?.();
      ctx?.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="cv-section relative overflow-hidden bg-[#050505] py-24 lg:py-32 isolate"
    >
      {/* Full-bleed dark gym interior background */}
      <div className="pointer-events-none absolute inset-0">
        <img
          ref={bgRef}
          src="/images/facility-floor.webp"
          srcSet="/images/facility-floor-800.webp 800w, /images/facility-floor-1200.webp 1200w, /images/facility-floor.webp 1920w"
          sizes="100vw"
          width={1920}
          height={1080}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover opacity-45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-[#050505]/80"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]"
        />
      </div>

      {/* Signature Lime Swoosh Curves (dual-stroke glow, zero live SVG feGaussianBlur) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 620"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full z-[2] overflow-visible"
      >
        <DrawPath
          d="M 940 70 C 1100 10, 1280 55, 1380 120"
          strokeWidth={2.5}
          dualGlow
        />
        <DrawPath
          d="M -40 500 C 160 565, 580 545, 910 510 C 1180 480, 1290 420, 1295 270 C 1300 170, 1235 120, 1140 125"
          strokeWidth={3}
          dualGlow
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-8">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          {/* Left column */}
          <div className="lg:col-span-6">
            <div className="eyebrow-row mb-5">{HOME_COPY.membership.eyebrow}</div>

            <h2 className="headline-display select-none">
              <span
                className="block text-[88px] sm:text-[112px] lg:text-[120px] leading-[0.86] text-[#B6F500] tabular-nums"
                style={{ textShadow: '0 0 26px rgba(182, 245, 0, 0.35)' }}
              >
                <span ref={hoursRef}>24</span>
                <span ref={slashRef} className="inline-block">
                  /
                </span>
                <span ref={daysRef}>7</span>
              </span>
              <span
                ref={accessRef}
                className="block text-[78px] sm:text-[96px] lg:text-[106px] leading-[0.88] text-metallic mt-1"
              >
                {HOME_COPY.membership.bigWhite}
              </span>
            </h2>

            <p className="mt-6 max-w-[380px] text-[15px] leading-relaxed text-[#C9C9C9]">
              {HOME_COPY.membership.description}
            </p>

            <div className="mt-8">
              <Button variant="outline" to="/membership">
                {HOME_COPY.membership.cta}
              </Button>
            </div>
          </div>

          {/* Right column: Membership Phases card */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div ref={cardRef} className="w-full max-w-[360px]">
              <TiltCard maxTilt={5} className="rounded-[24px]">
                <div className="card-unified-lime card-hover-lift glass-blur p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.75)]">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B6F500]/70" />
                    <h3 className="font-display italic font-extrabold text-[15px] uppercase tracking-[0.14em] text-white whitespace-nowrap">
                      {HOME_COPY.membership.cardTitle}
                    </h3>
                    <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#B6F500]/70" />
                  </div>

                  <div className="space-y-3">
                    {config.pricingPhases.map((phase) => {
                      const isActive = phase.status === 'Active';
                      const isSoldOut = phase.status === 'Sold out';

                      return (
                        <div
                          key={phase.tier}
                          className={`phase-row group relative flex items-start gap-3.5 rounded-[14px] border p-4 transition-[transform,border-color] duration-300 hover:translate-x-1.5 ${
                            isActive
                              ? 'border-[#B6F500]/60 bg-[#0B0B0C]/95'
                              : 'border-white/[0.07] bg-[#0B0B0C]/85 hover:border-[#B6F500]/45'
                          }`}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B6F500]/10 border border-[#B6F500]/30">
                            <PhaseIcon icon={phase.icon} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`text-[11px] font-bold uppercase tracking-[0.06em] ${
                                  isSoldOut ? 'line-through text-white/40' : 'text-white/90'
                                }`}
                              >
                                {phase.tier}
                              </span>

                              {isActive && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#B6F500]/15 border border-[#B6F500]/40 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#B6F500]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#B6F500] status-ping" />
                                  {config.membershipAvailability.label || 'LIMITED SPOTS'}
                                </span>
                              )}
                              {isSoldOut && (
                                <span className="rounded border border-red-500/60 bg-red-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-red-400">
                                  FILLED
                                </span>
                              )}
                              {phase.status === 'Upcoming' && (
                                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8C8C8C]">
                                  UPCOMING
                                </span>
                              )}
                            </div>

                            <div
                              className={`mt-0.5 font-bold text-[15px] leading-tight ${
                                isSoldOut ? 'line-through text-white/40' : 'text-white'
                              }`}
                            >
                              {phase.title}
                            </div>
                            <p
                              className={`mt-1 text-[11px] leading-snug ${
                                isSoldOut ? 'line-through text-[#8C8C8C]/50' : 'text-[#8C8C8C]'
                              }`}
                            >
                              {phase.subtitle}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
        </Reveal>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 section-divider-glow" />
    </section>
  );
});
