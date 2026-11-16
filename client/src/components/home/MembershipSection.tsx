import React, { useEffect, useRef, useState } from 'react';
import { Star, BarChart3, Crown } from 'lucide-react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY, PricingPhase } from '../../config/siteConfig';
import { useSiteContent } from '../../context/ContentContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Button } from '../ui/Button';
import { DrawPath } from '../ui/DrawPath';
import { TiltCard } from '../ui/TiltCard';

const PhaseIcon: React.FC<{ icon: PricingPhase['icon'] }> = ({ icon }) => {
  switch (icon) {
    case 'star':
      return <Star className="w-5 h-5 text-[#B6F500] fill-[#B6F500]/20" />;
    case 'bars':
      return <BarChart3 className="w-5 h-5 text-[#B6F500]" />;
    case 'crown':
      return <Crown className="w-5 h-5 text-[#B6F500]" />;
  }
};

export const MembershipSection: React.FC = () => {
  const { config } = useSiteContent();
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const accessRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [hoursNum, setHoursNum] = useState(reducedMotion ? 24 : 0);
  const [daysNum, setDaysNum] = useState(reducedMotion ? 7 : 0);
  const [slashIn, setSlashIn] = useState(reducedMotion);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      // Background slow parallax zoom
      gsap.fromTo(
        bgRef.current,
        { scale: 1.05 },
        {
          scale: 1.16,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      // Odometer 24 / 7 + ACCESS wipe
      const odometer = { h: 0, d: 0 };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 72%',
          once: true,
        },
      });

      tl.to(odometer, {
        h: 24,
        d: 7,
        duration: 0.9,
        ease: 'power3.out',
        onUpdate: () => {
          setHoursNum(Math.round(odometer.h));
          setDaysNum(Math.round(odometer.d));
        },
      })
        .call(() => setSlashIn(true), [], 0.35)
        .fromTo(
          accessRef.current,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.85, ease: 'power3.out' },
          0.35
        );

      // Card slide in & row stagger
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        );

        const rows = cardRef.current.querySelectorAll('.phase-row');
        gsap.fromTo(
          rows,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.12,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 82%',
              once: true,
            },
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050505] py-24 lg:py-32"
    >
      {/* Full-bleed dark gym interior background */}
      <div className="pointer-events-none absolute inset-0">
        <img
          ref={bgRef}
          src="/images/gym-interior.webp"
          alt=""
          loading="lazy"
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

      {/* Signature Lime Swoosh Curves sweeping across the section */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 620"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full z-[2] overflow-visible"
      >
        <defs>
          <filter id="membership-swoosh-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Top-right curve around card top */}
        <DrawPath
          d="M 940 70 C 1100 10, 1280 55, 1380 120"
          strokeWidth={2.5}
          filterId="membership-swoosh-glow"
        />
        {/* Lower-left sweeping curve under text and climbing right edge of card */}
        <DrawPath
          d="M -40 500 C 160 565, 580 545, 910 510 C 1180 480, 1290 420, 1295 270 C 1300 170, 1235 120, 1140 125"
          strokeWidth={3}
          filterId="membership-swoosh-glow"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
          {/* Left column */}
          <div className="lg:col-span-6">
            <div className="eyebrow-row mb-5">{HOME_COPY.membership.eyebrow}</div>

            <div className="headline-display select-none">
              <div className="text-[88px] sm:text-[112px] lg:text-[120px] leading-[0.86] text-[#B6F500] drop-shadow-[0_0_32px_rgba(182,245,0,0.45)] tabular-nums">
                <span>{hoursNum}</span>
                <span
                  className={`inline-block transition-all duration-300 ${
                    slashIn ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'
                  }`}
                >
                  /
                </span>
                <span>{daysNum}</span>
              </div>
              <div
                ref={accessRef}
                className="text-[78px] sm:text-[96px] lg:text-[106px] leading-[0.88] text-metallic mt-1"
              >
                {HOME_COPY.membership.bigWhite}
              </div>
            </div>

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
                <div className="glass-panel-lime rounded-[24px] p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.75)]">
                  {/* Card Title with thin lime lines on both sides */}
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#B6F500]/70" />
                    <h3 className="font-display italic font-extrabold text-[15px] uppercase tracking-[0.14em] text-white whitespace-nowrap">
                      {HOME_COPY.membership.cardTitle}
                    </h3>
                    <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#B6F500]/70" />
                  </div>

                  {/* Three stacked phase rows — never display gym prices */}
                  <div className="space-y-3">
                    {config.pricingPhases.map((phase) => {
                      const isActive = phase.status === 'Active';
                      const isSoldOut = phase.status === 'Sold out';

                      return (
                        <div
                          key={phase.tier}
                          className={`phase-row group relative flex items-start gap-3.5 rounded-[14px] border p-4 transition-all duration-300 hover:translate-x-1.5 ${
                            isActive
                              ? 'border-[#B6F500]/60 bg-[#0B0B0C]/95 shadow-[0_0_20px_rgba(182,245,0,0.12)]'
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
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#B6F500] animate-ping" />
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
      </div>
    </section>
  );
};
