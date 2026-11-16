import React, { useEffect, useRef } from 'react';
import { CalendarDays, Diamond } from 'lucide-react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY } from '../../config/siteConfig';
import { useSiteContent } from '../../context/ContentContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Button } from '../ui/Button';
import { TiltCard } from '../ui/TiltCard';
import { CountUp } from '../ui/CountUp';
import { DrawPath } from '../ui/DrawPath';

export const BookingCardsSection: React.FC = () => {
  const { openBooking } = useSiteContent();
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const dumbbellsRef = useRef<HTMLImageElement>(null);
  const shakerRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.16,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 84%',
              once: true,
            },
          }
        );
      }

      gsap.to(dumbbellsRef.current, {
        y: -8,
        rotation: 2,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      gsap.to(shakerRef.current, {
        y: -8,
        rotation: -2,
        duration: 3.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050505] pt-20 pb-24 lg:py-28"
    >
      {/* Full-width glowing lime swoosh curve running under both cards into footer */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 w-full z-[1] overflow-visible"
      >
        <defs>
          <filter id="booking-swoosh-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <DrawPath
          d="M -40 240 C 320 285, 760 275, 1180 215 C 1320 195, 1410 155, 1480 120"
          strokeWidth={2.8}
          filterId="booking-swoosh-glow"
        />
      </svg>

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-8">
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Left Lime Card: BOOK YOUR FREE GYM TOUR */}
          <TiltCard
            maxTilt={5}
            baseRotate={-2.5}
            straightenOnHover
            glareColor="rgba(255, 255, 255, 0.25)"
            className="rounded-[28px]"
          >
            <div
              className="relative flex min-h-[250px] h-full flex-col justify-between overflow-visible rounded-[28px] p-7 sm:p-8 shadow-[0_24px_60px_rgba(182,245,0,0.2)]"
              style={{
                background: 'linear-gradient(135deg, #C6FF1A 0%, #A6E600 100%)',
              }}
            >
              <div className="relative z-10 max-w-[330px]">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/10 text-[#050505]">
                  <CalendarDays className="w-6 h-6 stroke-[2.2]" />
                </div>

                <h3 className="font-display italic font-black text-[30px] sm:text-[36px] leading-[0.94] uppercase text-[#050505]">
                  {HOME_COPY.bookingCards.tour.titleLine1}
                  <br />
                  {HOME_COPY.bookingCards.tour.titleLine2}
                </h3>

                <p className="mt-2.5 text-[14px] font-medium leading-snug text-[#050505]/80">
                  {HOME_COPY.bookingCards.tour.description}
                </p>

                <div className="mt-6">
                  <Button variant="dark-pill" onClick={() => openBooking('tour')}>
                    {HOME_COPY.bookingCards.tour.cta}
                  </Button>
                </div>
              </div>

              {/* Overflowing Hex Dumbbells bottom-right */}
              <img
                ref={dumbbellsRef}
                src="/images/dumbbells.webp"
                alt="Black hex dumbbells"
                loading="lazy"
                className="pointer-events-none hidden sm:block absolute -right-4 -bottom-6 w-52 lg:w-60 h-auto object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.65)]"
              />
            </div>
          </TiltCard>

          {/* Right Dark Card: STRATEGY ASSESSMENT $99.99 CAD */}
          <TiltCard
            maxTilt={5}
            glareColor="rgba(182, 245, 0, 0.16)"
            className="rounded-[28px]"
          >
            <div className="relative flex min-h-[250px] h-full flex-col justify-between overflow-hidden rounded-[28px] glass-panel-lime p-7 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
              {/* Green radial ambient glow inside dark card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -bottom-10 h-60 w-60 rounded-full bg-[#B6F500]/18 blur-3xl"
              />

              {/* Top row: diamond icon left, PAID APPOINTMENT pill right */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#B6F500]/10 border border-[#B6F500]/35 text-[#B6F500]">
                  <Diamond className="w-5 h-5" />
                </div>

                <span className="relative overflow-hidden rounded-full bg-[#B6F500] px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#050505]">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 -translate-x-full animate-[lime-shimmer_4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  />
                  {HOME_COPY.bookingCards.assessment.badge}
                </span>
              </div>

              <div className="relative z-10 mt-3 max-w-[330px]">
                <h3 className="font-display italic font-black text-[28px] sm:text-[32px] leading-[0.95] uppercase text-white">
                  {HOME_COPY.bookingCards.assessment.title}
                </h3>

                <div className="mt-1 font-display italic font-black text-[36px] sm:text-[40px] leading-none text-[#B6F500] drop-shadow-[0_0_20px_rgba(182,245,0,0.45)] tabular-nums">
                  <CountUp end={99.99} decimals={2} prefix="$" suffix=" CAD" />
                </div>

                <p className="mt-2 text-[14px] leading-snug text-[#C9C9C9]">
                  {HOME_COPY.bookingCards.assessment.description}
                </p>

                <div className="mt-5">
                  <Button variant="outline" onClick={() => openBooking('assessment')}>
                    {HOME_COPY.bookingCards.assessment.cta}
                  </Button>
                </div>
              </div>

              {/* Matte black JS shaker bottle bottom-right */}
              <img
                ref={shakerRef}
                src="/images/shaker.webp"
                alt="JS FITNESS shaker bottle"
                loading="lazy"
                className="pointer-events-none hidden sm:block absolute right-4 -bottom-4 w-32 lg:w-36 h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
              />
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
};
