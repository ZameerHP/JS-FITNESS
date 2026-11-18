import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { loadGsap } from '../../lib/gsapBridge';
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
    const eyebrowRef = useRef<HTMLDivElement>(null);
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
      if (!el || reducedMotion) return;
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
    }, [reducedMotion]);

    // Mount Three.js particles on hardware-WebGL desktop as soon as Preloader clears
    useEffect(() => {
      if (!ready || reducedMotion || isMobile || !hasHardwareWebGL()) {
        setMountParticles(false);
        return;
      }

      const timerId = window.setTimeout(() => {
        setMountParticles(true);
      }, 150);

      return () => {
        clearTimeout(timerId);
      };
    }, [ready, reducedMotion, isMobile]);

    // Single global pointer subscription via GSAP quickTo (zero extra RAF, zero React re-renders)
    useEffect(() => {
      if (reducedMotion || isMobile || !heroVisible) return;

      let cancelled = false;
      let ctx: gsap.Context | null = null;
      let unsub: (() => void) | null = null;

      loadGsap().then(({ gsap }) => {
        if (cancelled || !sectionRef.current) return;

        let aX: gsap.QuickToFunc | null = null;
        let aY: gsap.QuickToFunc | null = null;
        let tX: gsap.QuickToFunc | null = null;
        let tY: gsap.QuickToFunc | null = null;
        let wX: gsap.QuickToFunc | null = null;
        let wY: gsap.QuickToFunc | null = null;

        ctx = gsap.context(() => {
          aX = athleteWrapRef.current
            ? gsap.quickTo(athleteWrapRef.current, 'x', { duration: 0.55, ease: 'power3.out' })
            : null;
          aY = athleteWrapRef.current
            ? gsap.quickTo(athleteWrapRef.current, 'y', { duration: 0.55, ease: 'power3.out' })
            : null;
          tX = triangleWrapRef.current
            ? gsap.quickTo(triangleWrapRef.current, 'x', { duration: 0.55, ease: 'power3.out' })
            : null;
          tY = triangleWrapRef.current
            ? gsap.quickTo(triangleWrapRef.current, 'y', { duration: 0.55, ease: 'power3.out' })
            : null;
          wX = watermarkRef.current
            ? gsap.quickTo(watermarkRef.current, 'x', { duration: 0.55, ease: 'power3.out' })
            : null;
          wY = watermarkRef.current
            ? gsap.quickTo(watermarkRef.current, 'y', { duration: 0.55, ease: 'power3.out' })
            : null;
        }, sectionRef);

        unsub = subscribePointerTick((ptr) => {
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
      });

      return () => {
        cancelled = true;
        unsub?.();
        ctx?.revert();
      };
    }, [reducedMotion, isMobile, tier, heroVisible]);

    // Entrance & scroll timelines (runs cleanly on every refresh across devices)
    useEffect(() => {
      if (!ready) return;
      const section = sectionRef.current;
      if (!section || reducedMotion) return;

      let cancelled = false;
      let ctx: gsap.Context | null = null;

      loadGsap().then(({ gsap }) => {
        if (cancelled || !sectionRef.current) return;
        ctx = gsap.context(() => {
          const tl = gsap.timeline();

          tl.fromTo(
            bgRef.current,
            { scale: 1.14 },
            { scale: 1.06, duration: 1.4, ease: 'power3.out' },
            0
          );

          if (eyebrowRef.current) {
            tl.fromTo(
              eyebrowRef.current,
              { x: -18, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
              0.05
            );
          }

          const polyTargets = [triangleGlowRef.current, triangleRef.current].filter(
            Boolean
          ) as SVGPolygonElement[];
          if (polyTargets.length > 0) {
            const len = polyTargets[0].getTotalLength();
            const lenPx = `${len.toFixed(1)}px`;
            polyTargets.forEach((pt) => {
              pt.style.strokeDasharray = lenPx;
              pt.style.strokeDashoffset = lenPx;
              pt.style.opacity = '0.4';
            });
            const triState = { p: 1, op: 0.4 };
            tl.to(
              triState,
              {
                p: 0,
                op: 1,
                duration: 1.2,
                ease: 'power3.out',
                onUpdate: () => {
                  const off = `${(len * triState.p).toFixed(1)}px`;
                  const op = triState.op.toFixed(2);
                  for (let i = 0; i < polyTargets.length; i += 1) {
                    polyTargets[i].style.strokeDashoffset = off;
                    polyTargets[i].style.opacity = op;
                  }
                },
              },
              0.08
            );
          }

          if (athleteImgRef.current && !isMobile) {
            tl.fromTo(
              athleteImgRef.current,
              { y: 28, scale: 0.98 },
              { y: 0, scale: 1, duration: 0.8, ease: 'power3.out' },
              0.1
            );
          }

          tl.fromTo(
            sublineRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' },
            0.38
          );

          if (buttonsRef.current) {
            tl.fromTo(
              buttonsRef.current.children,
              { scale: 0.9, opacity: 0, y: 14 },
              { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.4)' },
              0.48
            );
          }

          if (rightTaglineRef.current) {
            tl.fromTo(
              rightTaglineRef.current.querySelectorAll('.tagline-line'),
              { y: 18, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.42, stagger: 0.08, ease: 'power3.out' },
              0.45
            );
          }
          if (rightUnderlineRef.current) {
            tl.fromTo(
              rightUnderlineRef.current,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.48, ease: 'power3.out' },
              0.72
            );
          }

          if (bgRef.current) {
            gsap.fromTo(
              bgRef.current,
              { yPercent: 0, scale: 1.06 },
              {
                yPercent: 14,
                scale: 1.12,
                ease: 'none',
                scrollTrigger: {
                  trigger: section,
                  start: 'top top',
                  end: 'bottom top',
                  scrub: true,
                },
              }
            );
          }

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
        }, section);
      });

      return () => {
        cancelled = true;
        ctx?.revert();
      };
    }, [ready, reducedMotion, isMobile]);

    const particleCount = tier === 'high' ? (isMobile ? 60 : 150) : 60;

    return (
      <section
        ref={sectionRef}
        className="relative min-h-[100svh] lg:min-h-[820px] flex items-center overflow-hidden bg-[#050505] pt-[76px] pb-24 isolate"
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
            fetchPriority="low"
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

        {/* Layer 2: Lazy-loaded GPU Shader Three.js particles (hardware WebGL desktop) */}
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
            className="w-[82%] max-w-[560px] h-auto overflow-visible opacity-90 triangle-breathe"
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
            srcSet="/images/hero-athlete-480.webp 480w, /images/hero-athlete-700.webp 700w, /images/hero-athlete.webp 1100w"
            sizes="(max-width: 768px) 220px, 550px"
            width={1100}
            height={1466}
            fetchPriority="high"
            alt="Muscular athlete representing JS FITNESS INC discipline"
            className={`relative z-10 h-[78%] sm:h-[90%] lg:h-[96%] w-auto max-w-none object-contain object-bottom opacity-100 ${
              heroVisible && !reducedMotion ? 'athlete-breathe' : ''
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
              <div ref={eyebrowRef} className="mb-5 flex flex-wrap items-center gap-3">
                <div className="eyebrow-row">{HOME_COPY.hero.eyebrow}</div>
                <span className="badge-shimmer relative overflow-hidden inline-flex items-center gap-2 rounded-full border border-[#B6F500]/45 bg-[#B6F500]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#B6F500]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B6F500] status-ping" />
                  {HOME_COPY.hero.availabilityBadge}
                </span>
              </div>

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
                      ? 'Watch our gym — walkthrough video'
                      : 'Watch our gym — video coming soon'
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
