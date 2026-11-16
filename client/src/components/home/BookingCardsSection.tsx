import React, { useEffect, useRef } from 'react';
import { CalendarDays, Diamond } from 'lucide-react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY } from '../../config/siteConfig';
import { useSiteContent } from '../../context/ContentContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';
import { scheduleChunkedTask } from '../../lib/scheduler';
import { Button } from '../ui/Button';
import { TiltCard } from '../ui/TiltCard';
import { CountUp } from '../ui/CountUp';
import { DrawPath } from '../ui/DrawPath';

interface BookingCardsSectionProps {
  onPrefetchCalendly?: () => void;
}

export const BookingCardsSection: React.FC<BookingCardsSectionProps> = React.memo(
  ({ onPrefetchCalendly }) => {
    const { openBooking } = useSiteContent();
    const reducedMotion = useReducedMotion();
    const tier = useTier();
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const dumbbellsRef = useRef<HTMLImageElement>(null);
    const shakerRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const el = sectionRef.current;
      if (!el || reducedMotion || tier === 'low') return;

      let floatD: gsap.core.Tween | null = null;
      let floatS: gsap.core.Tween | null = null;
      let ctx: gsap.Context | null = null;
      let inView = false;

      const sync = () => {
        if (inView && !document.hidden) {
          floatD?.play();
          floatS?.play();
        } else {
          floatD?.pause();
          floatS?.pause();
        }
      };

      const cancelTask = scheduleChunkedTask(() => {
        ctx = gsap.context(() => {
          if (cardsRef.current) {
            gsap.fromTo(
              cardsRef.current.children,
              { y: 36, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.7,
                stagger: 0.14,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: cardsRef.current,
                  start: 'top 86%',
                  once: true,
                },
              }
            );
          }

          if (tier === 'high') {
            floatD = gsap.to(dumbbellsRef.current, {
              y: -8,
              rotation: 2,
              duration: 2.8,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              paused: true,
            });

            floatS = gsap.to(shakerRef.current, {
              y: -8,
              rotation: -2,
              duration: 3.1,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              paused: true,
            });
          }
        }, el);
        sync();
      });

      const io = new IntersectionObserver(
        (entries) => {
          inView = Boolean(entries[0]?.isIntersecting);
          sync();
        },
        { threshold: 0.05 }
      );
      io.observe(el);
      document.addEventListener('visibilitychange', sync);

      return () => {
        cancelTask();
        io.disconnect();
        document.removeEventListener('visibilitychange', sync);
        ctx?.revert();
      };
    }, [reducedMotion, tier]);

    return (
      <section
        ref={sectionRef}
        className="cv-section relative overflow-hidden bg-[#050505] pt-20 pb-24 lg:py-28 isolate"
      >
        {/* Full-width glowing lime swoosh curve running under both cards into footer (dual stroke, zero live feGaussianBlur) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 w-full z-[1] overflow-visible"
        >
          <DrawPath
            d="M -40 240 C 320 285, 760 275, 1180 215 C 1320 195, 1410 155, 1480 120"
            strokeWidth={2.8}
            dualGlow
          />
        </svg>

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-8">
          <div
            ref={cardsRef}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch"
          >
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
                    <Button
                      variant="dark-pill"
                      onPrefetch={onPrefetchCalendly}
                      onClick={() => openBooking('tour')}
                    >
                      {HOME_COPY.bookingCards.tour.cta}
                    </Button>
                  </div>
                </div>

                <img
                  ref={dumbbellsRef}
                  src="/images/dumbbells.webp"
                  width={720}
                  height={333}
                  alt="Black hex dumbbells"
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none hidden sm:block absolute -right-4 -bottom-6 w-52 lg:w-60 h-auto object-contain"
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
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(182,245,0,0.2) 0%, transparent 70%)',
                  }}
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#B6F500]/10 border border-[#B6F500]/35 text-[#B6F500]">
                    <Diamond className="w-5 h-5" />
                  </div>

                  <span className="relative overflow-hidden rounded-full bg-[#B6F500] px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#050505]">
                    {HOME_COPY.bookingCards.assessment.badge}
                  </span>
                </div>

                <div className="relative z-10 mt-3 max-w-[330px]">
                  <h3 className="font-display italic font-black text-[28px] sm:text-[32px] leading-[0.95] uppercase text-white">
                    {HOME_COPY.bookingCards.assessment.title}
                  </h3>

                  <div
                    className="mt-1 font-display italic font-black text-[36px] sm:text-[40px] leading-none text-[#B6F500] tabular-nums"
                    style={{ textShadow: '0 0 20px rgba(182,245,0,0.4)' }}
                  >
                    <CountUp end={99.99} decimals={2} prefix="$" suffix=" CAD" />
                  </div>

                  <p className="mt-2 text-[14px] leading-snug text-[#C9C9C9]">
                    {HOME_COPY.bookingCards.assessment.description}
                  </p>

                  <div className="mt-5">
                    <Button
                      variant="outline"
                      onPrefetch={onPrefetchCalendly}
                      onClick={() => openBooking('assessment')}
                    >
                      {HOME_COPY.bookingCards.assessment.cta}
                    </Button>
                  </div>
                </div>

                <img
                  ref={shakerRef}
                  src="/images/shaker.webp"
                  width={520}
                  height={468}
                  alt="JS FITNESS shaker bottle"
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none hidden sm:block absolute right-4 -bottom-4 w-32 lg:w-36 h-auto object-contain"
                />
              </div>
            </TiltCard>
          </div>
        </div>
      </section>
    );
  }
);
