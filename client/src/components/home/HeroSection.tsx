import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY } from '../../config/siteConfig';
import { useSiteContent } from '../../context/ContentContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Button } from '../ui/Button';
import { SplitReveal } from '../ui/SplitReveal';

const HeroParticlesCanvas = lazy(() => import('../three/HeroParticlesCanvas'));

interface HeroSectionProps {
  ready: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ ready }) => {
  const { openBooking, videos, setVideoModalOpen } = useSiteContent();
  const reducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const athleteWrapRef = useRef<HTMLDivElement>(null);
  const athleteImgRef = useRef<HTMLImageElement>(null);
  const triangleRef = useRef<SVGPolygonElement>(null);
  const triangleWrapRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const rightTaglineRef = useRef<HTMLDivElement>(null);
  const rightUnderlineRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ normX: 0, normY: 0 });

  const hasWalkthroughVideo = videos.some((v) => v.visible);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Mouse parallax loop (lerped)
  useEffect(() => {
    if (reducedMotion || isMobile) return;

    let currentX = 0;
    let currentY = 0;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      mouseRef.current.normX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.normY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      currentX += (mouseRef.current.normX - currentX) * 0.08;
      currentY += (mouseRef.current.normY - currentY) * 0.08;

      if (athleteWrapRef.current) {
        athleteWrapRef.current.style.transform = `translate3d(${(currentX * 12).toFixed(2)}px, ${(
          currentY * 8
        ).toFixed(2)}px, 0)`;
      }
      if (triangleWrapRef.current) {
        triangleWrapRef.current.style.transform = `translate3d(${(currentX * 24).toFixed(2)}px, ${(
          currentY * 16
        ).toFixed(2)}px, 0)`;
      }
      if (watermarkRef.current) {
        watermarkRef.current.style.transform = `translate3d(${(currentX * -8).toFixed(2)}px, ${(
          currentY * -5
        ).toFixed(2)}px, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, isMobile]);

  // Entrance & scroll timelines
  useEffect(() => {
    if (!ready) return;
    const section = sectionRef.current;
    if (!section) return;

    if (reducedMotion) {
      gsap.set([bgRef.current, athleteImgRef.current, sublineRef.current, buttonsRef.current], {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'blur(0px)',
      });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Background scale 1.15 -> 1 over 2.2s
      tl.fromTo(
        bgRef.current,
        { scale: 1.15 },
        { scale: 1, duration: 2.2, ease: 'power3.out' },
        0
      );

      // Neon triangle draw-on
      if (triangleRef.current) {
        const len = triangleRef.current.getTotalLength();
        gsap.set(triangleRef.current, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.4 });
        tl.to(
          triangleRef.current,
          { strokeDashoffset: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
          0.15
        );
      }

      // Athlete rise from y:60 + blur 12px -> crisp over 1.2s, then continuous slow breathing
      if (athleteImgRef.current && !isMobile) {
        tl.fromTo(
          athleteImgRef.current,
          { y: 60, opacity: 0, filter: 'blur(12px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
          0.2
        );
        gsap.to(athleteImgRef.current, {
          scale: 1.015,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.4,
        });
      }

      // Subline tracking tightening
      tl.fromTo(
        sublineRef.current,
        { opacity: 0, letterSpacing: '0.3em' },
        { opacity: 1, letterSpacing: '0.12em', duration: 0.9, ease: 'power3.out' },
        0.65
      );

      // Buttons stagger
      if (buttonsRef.current) {
        tl.fromTo(
          buttonsRef.current.children,
          { scale: 0.88, opacity: 0, y: 18 },
          { scale: 1, opacity: 1, y: 0, duration: 0.65, stagger: 0.14, ease: 'back.out(1.4)' },
          0.8
        );
      }

      // Right tagline line-by-line + underline draw
      if (rightTaglineRef.current) {
        tl.fromTo(
          rightTaglineRef.current.querySelectorAll('.tagline-line'),
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.09, ease: 'power3.out' },
          0.75
        );
      }
      if (rightUnderlineRef.current) {
        tl.fromTo(
          rightUnderlineRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: 'power3.out' },
          1.1
        );
      }

      // Scroll parallax out
      gsap.to(section, {
        scale: 0.96,
        opacity: 0.72,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(watermarkRef.current, {
        y: -55,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to(athleteWrapRef.current, {
        y: 65,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [ready, reducedMotion, isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen lg:min-h-[820px] flex items-center overflow-hidden bg-[#050505] pt-[72px] pb-24"
    >
      {/* Layer 1: Dark gym background with green haze */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          ref={bgRef}
          src="/images/hero-bg.webp"
          alt="JS FITNESS INC Calgary gym interior"
          className="h-full w-full object-cover opacity-35"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 68% 45%, rgba(182, 245, 0, 0.18) 0%, rgba(10, 22, 5, 0.55) 45%, #050505 85%)',
          }}
        />
      </div>

      {/* Layer 2: R3F Three.js lime embers & volumetric light */}
      {!reducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
          <Suspense fallback={null}>
            <HeroParticlesCanvas mouseRef={mouseRef} isMobile={isMobile} />
          </Suspense>
        </div>
      )}

      {/* Layer 3: Giant ghost outlined JS watermark */}
      <div
        ref={watermarkRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 z-[2] select-none"
      >
        <div
          className="font-display italic font-black text-[180px] sm:text-[260px] lg:text-[320px] leading-none tracking-tighter text-transparent"
          style={{ WebkitTextStroke: '2px rgba(182, 245, 0, 0.08)' }}
        >
          JS
        </div>
      </div>

      {/* Layer 4: Neon lime triangle outline behind athlete right shoulder */}
      <div
        ref={triangleWrapRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[62%] z-[3] flex items-center justify-center"
      >
        <svg
          viewBox="0 0 600 640"
          className="w-[82%] max-w-[560px] h-auto overflow-visible opacity-90"
        >
          <defs>
            <filter id="hero-triangle-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon
            ref={triangleRef}
            points="100,115 545,48 395,555"
            fill="none"
            stroke="#B6F500"
            strokeWidth="5"
            strokeLinejoin="round"
            filter="url(#hero-triangle-glow)"
          />
        </svg>
      </div>

      {/* Layer 5: Athlete cutout on right half */}
      <div
        ref={athleteWrapRef}
        className="pointer-events-none absolute right-0 bottom-0 top-[68px] w-full md:w-[58%] lg:w-[54%] z-[4] flex items-end justify-center lg:justify-end pr-0 lg:pr-10"
      >
        <img
          ref={athleteImgRef}
          src="/images/hero-athlete.webp"
          alt="Muscular athlete representing JS FITNESS INC discipline"
          className="h-[78%] sm:h-[90%] lg:h-[96%] w-auto max-w-none object-contain object-bottom opacity-100 drop-shadow-[0_0_45px_rgba(182,245,0,0.18)]"
        />
      </div>

      {/* Layer 6: Left and bottom legibility vignettes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent lg:w-[65%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-44 z-[5] bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent"
      />

      {/* Foreground Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 lg:px-8 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-end gap-8">
          {/* Left column */}
          <div className="lg:col-span-7">
            <div className="eyebrow-row mb-5">{HOME_COPY.hero.eyebrow}</div>

            <h1 className="headline-display text-[clamp(3.3rem,7.2vw,6.5rem)] leading-[0.92]">
              <SplitReveal
                text={HOME_COPY.hero.headlineLine1}
                mode="chars"
                trigger
                active={ready}
                className="block text-metallic"
              />
              <span className="block mt-1">
                <SplitReveal
                  text={HOME_COPY.hero.headlineLine2Prefix}
                  mode="chars"
                  trigger
                  active={ready}
                  delay={0.22}
                  className="inline-block text-metallic mr-3 sm:mr-4"
                />
                <span className="inline-block filter drop-shadow-[0_0_20px_rgba(182,245,0,0.45)]">
                  <SplitReveal
                    text={HOME_COPY.hero.headlineLine2Accent}
                    mode="chars"
                    trigger
                    active={ready}
                    delay={0.38}
                    className="inline-block lime-sweep-text"
                  />
                </span>
              </span>
            </h1>

            <p
              ref={sublineRef}
              className="mt-5 text-[13px] sm:text-[15px] font-medium uppercase tracking-[0.12em] text-[#C9C9C9]"
            >
              {HOME_COPY.hero.subline}
            </p>

            {/* Primary & Secondary CTAs */}
            <div ref={buttonsRef} className="mt-8 flex flex-wrap items-center gap-4">
              <Button variant="primary" pulseRing onClick={() => openBooking('tour')}>
                {HOME_COPY.hero.primaryCta}
              </Button>

              <Button
                variant="white-outline"
                showArrow={false}
                disabled={!hasWalkthroughVideo}
                onClick={() => hasWalkthroughVideo && setVideoModalOpen(true)}
                ariaLabel={
                  hasWalkthroughVideo
                    ? 'Watch our gym walkthrough video'
                    : 'Gym walkthrough video coming soon'
                }
                icon={
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/60 group-hover:border-black/50">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                }
              >
                <span data-cursor={hasWalkthroughVideo ? 'play' : undefined}>
                  {HOME_COPY.hero.secondaryCta}
                </span>
              </Button>
            </div>

            {/* Bottom-left scroll indicator */}
            <div className="mt-14 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8C8C8C]">
              <span className="flex h-6 w-3.5 items-start justify-center rounded-full border border-white/30 p-1">
                <span className="h-1.5 w-1 rounded-full bg-[#B6F500] animate-bounce" />
              </span>
              <span>{HOME_COPY.hero.scrollLabel}</span>
            </div>
          </div>

          {/* Right edge lower third: MORE THAN JUST A GYM MEMBERSHIP. */}
          <div className="lg:col-span-5 flex justify-end items-end pb-14 lg:pb-16">
            <div ref={rightTaglineRef} className="text-right">
              {HOME_COPY.hero.rightTagline.map((line) => (
                <div
                  key={line}
                  className="tagline-line font-display italic font-extrabold text-xl sm:text-2xl leading-[1.05] uppercase text-white/95"
                >
                  {line}
                </div>
              ))}
              <div
                ref={rightUnderlineRef}
                className="ml-auto mt-2.5 h-[3px] w-14 origin-right rounded-full bg-[#B6F500] shadow-[0_0_12px_rgba(182,245,0,0.75)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
