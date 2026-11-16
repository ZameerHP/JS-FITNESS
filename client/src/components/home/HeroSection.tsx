import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY } from '../../config/siteConfig';
import { useSiteContent } from '../../context/ContentContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier, hasHardwareWebGL } from '../../lib/perfTier';
import { subscribePointerTick } from '../../lib/pointer';
import { Button } from '../ui/Button';
import { SplitReveal } from '../ui/SplitReveal';

const HeroParticlesCanvas = lazy(() => import('../three/HeroParticlesCanvas'));

interface HeroSectionProps {
  ready: boolean;
  onPrefetchCalendly?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = React.memo(
  ({ ready, onPrefetchCalendly }) => {
    const { openBooking, videos, setVideoModalOpen } = useSiteContent();
    const reducedMotion = useReducedMotion();
    const tier = useTier();
    const [isMobile, setIsMobile] = useState(() =>
      typeof window !== 'undefined' ? window.innerWidth < 768 : false
    );
    const [mountParticles, setMountParticles] = useState(false);
    const [heroVisible, setHeroVisible] = useState(true);

    const sectionRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLImageElement>(null);
    const athleteWrapRef = useRef<HTMLDivElement>(null);
    const athleteImgRef = useRef<HTMLImageElement>(null);
    const triangleRef = useRef<SVGPolygonElement>(null);
    const triangleGlowRef = useRef<SVGPolygonElement>(null);
    const triangleWrapRef = useRef<HTMLDivElement>(null);
    const watermarkRef = useRef<HTMLDivElement>(null);
    const sublineRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const rightTaglineRef = useRef<HTMLDivElement>(null);
    const rightUnderlineRef = useRef<HTMLDivElement>(null);
    const pointerRef = useRef({ normX: 0, normY: 0 });

    const hasWalkthroughVideo = videos.some((v) => v.visible);

    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', check, { passive: true });
      return () => window.removeEventListener('resize', check);
    }, []);

    // Track Hero visibility + tab visibility for pausing WebGL & breathing loop
    useEffect(() => {
      const el = sectionRef.current;
      if (!el) return;
      let inViewport = true;

      const sync = () => {
        setHeroVisible(inViewport && !document.hidden);
      };

      const io = new IntersectionObserver(
        (entries) => {
          inViewport = Boolean(entries[0]?.isIntersecting);
          sync();
        },
        { threshold: 0.02 }
      );
      io.observe(el);
      document.addEventListener('visibilitychange', sync);

      return () => {
        io.disconnect();
        document.removeEventListener('visibilitychange', sync);
      };
    }, []);

    // Mount Three.js particles ONLY on hardware-WebGL desktop high tier after 3s idle delay
    useEffect(() => {
      if (!ready || reducedMotion || tier !== 'high' || isMobile || !hasHardwareWebGL()) {
        setMountParticles(false);
        return;
      }

      let cancelled = false;
      let idleId: number | undefined;
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };

      const timerId = window.setTimeout(() => {
        if (w.requestIdleCallback) {
          idleId = w.requestIdleCallback(
            () => {
              if (!cancelled) setMountParticles(true);
            },
            { timeout: 1000 }
          );
        } else if (!cancelled) {
          setMountParticles(true);
        }
      }, 3000);

      return () => {
        cancelled = true;
        clearTimeout(timerId);
        if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      };
    }, [ready, reducedMotion, tier, isMobile]);

    // Single global pointer subscription via GSAP quickTo (zero extra RAF, zero React re-renders)
    useEffect(() => {
      if (reducedMotion || isMobile || tier !== 'high' || !heroVisible) return;

      const aX = athleteWrapRef.current
        ? gsap.quickTo(athleteWrapRef.current, 'x', { duration: 0.55, ease: 'power3.out' })
        : null;
      const aY = athleteWrapRef.current
        ? gsap.quickTo(athleteWrapRef.current, 'y', { duration: 0.55, ease: 'power3.out' })
        : null;
      const tX = triangleWrapRef.current
        ? gsap.quickTo(triangleWrapRef.current, 'x', { duration: 0.55, ease: 'power3.out' })
        : null;
      const tY = triangleWrapRef.current
        ? gsap.quickTo(triangleWrapRef.current, 'y', { duration: 0.55, ease: 'power3.out' })
        : null;
      const wX = watermarkRef.current
        ? gsap.quickTo(watermarkRef.current, 'x', { duration: 0.55, ease: 'power3.out' })
        : null;
      const wY = watermarkRef.current
        ? gsap.quickTo(watermarkRef.current, 'y', { duration: 0.55, ease: 'power3.out' })
        : null;

      return subscribePointerTick((ptr) => {
        pointerRef.current.normX = ptr.normX;
        pointerRef.current.normY = ptr.normY;
        if (!ptr.dirty) return;
        aX?.(ptr.normX * 12);
        aY?.(ptr.normY * 8);
        tX?.(ptr.normX * 24);
        tY?.(ptr.normY * 16);
        wX?.(ptr.normX * -8);
        wY?.(ptr.normY * -5);
      });
    }, [reducedMotion, isMobile, tier, heroVisible]);

    // Entrance & scroll timelines
    useEffect(() => {
      if (!ready) return;
      const section = sectionRef.current;
      if (!section) return;

      if (reducedMotion || tier === 'low') {
        gsap.set([bgRef.current, athleteImgRef.current, sublineRef.current, buttonsRef.current], {
          opacity: 1,
          scale: 1,
          y: 0,
        });
        return;
      }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        tl.fromTo(
          bgRef.current,
          { scale: 1.12 },
          { scale: 1, duration: 1.8, ease: 'power3.out' },
          0
        );

        const polyTargets = [triangleGlowRef.current, triangleRef.current].filter(
          Boolean
        ) as SVGPolygonElement[];
        if (polyTargets.length > 0) {
          const len = polyTargets[0].getTotalLength();
          gsap.set(polyTargets, { strokeDasharray: len, strokeDashoffset: len, opacity: 0.4 });
          tl.to(polyTargets, { strokeDashoffset: 0, opacity: 1, duration: 1.3, ease: 'power3.out' }, 0.1);
        }

        // GPU-only athlete entrance keeping opacity: 1 for immediate LCP paint
        if (athleteImgRef.current && !isMobile) {
          tl.fromTo(
            athleteImgRef.current,
            { y: 28, scale: 0.985 },
            { y: 0, scale: 1, duration: 0.85, ease: 'power3.out' },
            0.12
          );
        }

        if (tier === 'high') {
          tl.fromTo(
            sublineRef.current,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
            0.55
          );

          if (buttonsRef.current) {
            tl.fromTo(
              buttonsRef.current.children,
              { scale: 0.92, opacity: 0, y: 14 },
              { scale: 1, opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'back.out(1.3)' },
              0.65
            );
          }

          if (rightTaglineRef.current) {
            tl.fromTo(
              rightTaglineRef.current.querySelectorAll('.tagline-line'),
              { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power3.out' },
              0.6
            );
          }
          if (rightUnderlineRef.current) {
            tl.fromTo(
              rightUnderlineRef.current,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.5, ease: 'power3.out' },
              0.9
            );
          }
        }

        if (tier === 'high') {
          gsap.to(watermarkRef.current, {
            y: -50,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });

          gsap.to(athleteWrapRef.current, {
            y: 55,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      }, section);

      return () => ctx.revert();
    }, [ready, reducedMotion, isMobile, tier]);

    const particleCount = tier === 'high' ? (isMobile ? 60 : 150) : 60;

    return (
      <section
        ref={sectionRef}
        className="relative min-h-[100svh] lg:min-h-[820px] flex items-center overflow-hidden bg-[#050505] pt-[72px] pb-24 isolate"
      >
        {/* Layer 1: Dark gym background with green haze */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            ref={bgRef}
            src="/images/hero-bg.webp"
            srcSet="/images/hero-bg-800.webp 800w, /images/hero-bg-1200.webp 1200w, /images/hero-bg.webp 1920w"
            sizes="100vw"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
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

        {/* Layer 2: Lazy-loaded GPU Shader Three.js particles (only mounted when high + hw WebGL + idle) */}
        {mountParticles && tier === 'high' && !isMobile && !reducedMotion && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
            <Suspense fallback={null}>
              <HeroParticlesCanvas
                pointerRef={pointerRef}
                particleCount={particleCount}
                isMobile={isMobile}
                active={heroVisible}
              />
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

        {/* Layer 4: Neon lime triangle outline (dual-stroke glow, zero live SVG feGaussianBlur) */}
        <div
          ref={triangleWrapRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[62%] z-[3] flex items-center justify-center"
        >
          <svg
            viewBox="0 0 600 640"
            className="w-[82%] max-w-[560px] h-auto overflow-visible opacity-90"
          >
            <polygon
              ref={triangleGlowRef}
              points="100,115 545,48 395,555"
              fill="none"
              stroke="#B6F500"
              strokeWidth="16"
              strokeOpacity="0.18"
              strokeLinejoin="round"
            />
            <polygon
              ref={triangleRef}
              points="100,115 545,48 395,555"
              fill="none"
              stroke="#B6F500"
              strokeWidth="5"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Layer 5: Athlete cutout on right half with static radial back-glow */}
        <div
          ref={athleteWrapRef}
          className="pointer-events-none absolute right-0 bottom-0 top-[68px] w-full md:w-[58%] lg:w-[54%] z-[4] flex items-end justify-center lg:justify-end pr-0 lg:pr-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-10 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 55% 45%, rgba(182, 245, 0, 0.14) 0%, transparent 65%)',
            }}
          />
          <img
            ref={athleteImgRef}
            src="/images/hero-athlete.webp"
            srcSet="/images/hero-athlete-700.webp 700w, /images/hero-athlete.webp 1100w"
            sizes="(max-width: 768px) 360px, 600px"
            width={1100}
            height={1466}
            fetchPriority="high"
            decoding="async"
            alt="Muscular athlete representing JS FITNESS INC discipline"
            className={`relative z-10 h-[78%] sm:h-[90%] lg:h-[96%] w-auto max-w-none object-contain object-bottom opacity-100 ${
              heroVisible && tier === 'high' && !isMobile ? 'athlete-breathe' : ''
            }`}
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
                  <span
                    className="inline-block"
                    style={{ textShadow: '0 0 22px rgba(182, 245, 0, 0.4)' }}
                  >
                    <SplitReveal
                      text={HOME_COPY.hero.headlineLine2Accent}
                      mode="chars"
                      trigger
                      active={ready}
                      delay={0.38}
                      className="inline-block text-lime-glow"
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

              <div ref={buttonsRef} className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  variant="primary"
                  pulseRing={heroVisible}
                  onPrefetch={onPrefetchCalendly}
                  onClick={() => openBooking('tour')}
                >
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

              <div className="mt-14 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8C8C8C]">
                <span className="flex h-6 w-3.5 items-start justify-center rounded-full border border-white/30 p-1">
                  <span className="h-1.5 w-1 rounded-full bg-[#B6F500] scroll-dot-anim" />
                </span>
                <span>{HOME_COPY.hero.scrollLabel}</span>
              </div>
            </div>

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
  }
);
