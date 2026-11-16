import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY } from '../../config/siteConfig';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';
import { onFirstUserInteraction, scheduleChunkedTask } from '../../lib/scheduler';
import { Button } from '../ui/Button';
import { SplitReveal } from '../ui/SplitReveal';
import { JSLogo } from '../ui/JSLogo';

const BASE_BARS = [
  24, 30, 28, 38, 34, 44, 42, 52, 48, 58, 56, 66, 62, 74, 70, 80, 76, 86, 84, 94,
];

export const SystemSection: React.FC = React.memo(() => {
  const reducedMotion = useReducedMotion();
  const tier = useTier();
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const athleteRef = useRef<HTMLImageElement>(null);
  const ringCircleRef = useRef<SVGCircleElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);
  const orbitCometRef = useRef<SVGPathElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const rxToRef = useRef<gsap.QuickToFunc | null>(null);
  const ryToRef = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const circle = ringCircleRef.current;
    const radius = 56;
    const circumference = 2 * Math.PI * radius;

    if (reducedMotion || tier !== 'high' || navigator.webdriver) {
      if (pctRef.current) pctRef.current.textContent = '92%';
      if (circle) {
        circle.style.strokeDasharray = `${circumference.toFixed(1)}px`;
        circle.style.strokeDashoffset = `${(circumference - 0.92 * circumference).toFixed(1)}px`;
      }
      return;
    }

    let floatTween: gsap.core.Tween | null = null;
    let cometTween: gsap.core.Tween | null = null;
    let jitterInterval: ReturnType<typeof setInterval> | null = null;
    let inView = false;
    let ctx: gsap.Context | null = null;
    let cancelTask: (() => void) | null = null;

    const bars = Array.from(el.querySelectorAll<HTMLElement>('.mockup-bar'));
    const syncLoops = () => {
      const shouldRun = inView && !document.hidden;
      if (shouldRun) {
        floatTween?.play();
        cometTween?.play();
        if (!jitterInterval) {
          jitterInterval = setInterval(() => {
            bars.forEach((bar, i) => {
              const base = BASE_BARS[i] || 50;
              const nextScale = Math.max(0.25, Math.min(1.05, (base + (Math.random() - 0.5) * 14) / base));
              bar.style.transform = `scaleY(${nextScale.toFixed(2)})`;
            });
          }, 3000);
        }
      } else {
        floatTween?.pause();
        cometTween?.pause();
        if (jitterInterval) {
          clearInterval(jitterInterval);
          jitterInterval = null;
        }
      }
    };

    const cancelInteract = onFirstUserInteraction(() => {
      cancelTask = scheduleChunkedTask(() => {
        ctx = gsap.context(() => {
          if (phoneRef.current) {
            gsap.set(phoneRef.current, { transformPerspective: 1100, rotateY: -6 });
            rxToRef.current = gsap.quickTo(phoneRef.current, 'rotateX', {
              duration: 0.4,
              ease: 'power3.out',
            });
            ryToRef.current = gsap.quickTo(phoneRef.current, 'rotateY', {
              duration: 0.4,
              ease: 'power3.out',
            });
          }

          floatTween = gsap.to(phoneRef.current, {
            y: -10,
            duration: 2.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            paused: true,
          });

          if (orbitCometRef.current) {
            const cometEl = orbitCometRef.current;
            cometEl.style.strokeDashoffset = '840px';
            const cometObj = { offset: 840 };
            cometTween = gsap.to(cometObj, {
              offset: 0,
              duration: 4.5,
              repeat: -1,
              ease: 'none',
              paused: true,
              onUpdate: () => {
                cometEl.style.strokeDashoffset = `${cometObj.offset.toFixed(1)}px`;
              },
            });
          }

          if (athleteRef.current) {
            gsap.fromTo(
              athleteRef.current,
              { y: 36 },
              {
                y: -30,
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

          if (circle) {
            circle.style.strokeDasharray = `${circumference.toFixed(1)}px`;
            circle.style.strokeDashoffset = `${circumference.toFixed(1)}px`;

            const obj = { val: 0 };
            let lastPct = -1;
            gsap.to(obj, {
              val: 92,
              duration: 1.4,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 74%',
                once: true,
              },
              onUpdate: () => {
                const v = Math.round(obj.val);
                if (v !== lastPct) {
                  lastPct = v;
                  if (pctRef.current) pctRef.current.textContent = `${v}%`;
                  circle.style.strokeDashoffset = `${(circumference - (v / 100) * circumference).toFixed(1)}px`;
                }
              },
            });
          }

          if (checklistRef.current) {
            const items = checklistRef.current.querySelectorAll('.check-item');
            gsap.fromTo(
              items,
              { x: -16, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                duration: 0.45,
                stagger: 0.07,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: checklistRef.current,
                  start: 'top 86%',
                  once: true,
                },
              }
            );
          }

          const barNodes = el.querySelectorAll('.mockup-bar');
          gsap.fromTo(
            barNodes,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.55,
              stagger: 0.03,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: phoneRef.current,
                start: 'top 84%',
                once: true,
              },
            }
          );
        }, el);
        syncLoops();
      });
    });

    const io = new IntersectionObserver(
      (entries) => {
        inView = Boolean(entries[0]?.isIntersecting);
        syncLoops();
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    document.addEventListener('visibilitychange', syncLoops);

    return () => {
      cancelInteract();
      cancelTask?.();
      io.disconnect();
      document.removeEventListener('visibilitychange', syncLoops);
      if (jitterInterval) clearInterval(jitterInterval);
      rxToRef.current = null;
      ryToRef.current = null;
      ctx?.revert();
    };
  }, [reducedMotion, tier]);

  const handleEnter = () => {
    if (!sectionRef.current || reducedMotion || tier !== 'high') return;
    rectRef.current = sectionRef.current.getBoundingClientRect();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion || tier !== 'high' || e.pointerType === 'touch' || window.innerWidth < 1024) return;
    const rect = rectRef.current || sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    rectRef.current = rect;
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    rxToRef.current?.(-ny * 5);
    ryToRef.current?.(nx * 8 - 4);
  };

  const handleLeave = () => {
    rectRef.current = null;
    rxToRef.current?.(0);
    ryToRef.current?.(-6);
  };

  return (
    <section
      ref={sectionRef}
      onPointerEnter={handleEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handleLeave}
      className="cv-section relative overflow-hidden bg-[#050505] py-24 lg:py-32 isolate"
    >
      {/* Pre-baked radial glow instead of heavy blur-[140px] */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/4 h-[520px] w-[520px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(182, 245, 0, 0.08) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-10 h-[520px] w-[520px] rounded-full border-[40px] border-white/[0.02] opacity-80"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-14">
          {/* Left column */}
          <div className="lg:col-span-6">
            <div className="eyebrow-row mb-5">{HOME_COPY.system.eyebrow}</div>

            <h2 className="headline-display text-[44px] sm:text-[56px] lg:text-[62px] leading-[0.94]">
              <SplitReveal
                text={HOME_COPY.system.titleLine1}
                mode="words"
                className="block text-metallic"
              />
              <span className="block mt-1">
                <span className="lime-sweep-text text-lime-glow mr-3">
                  {HOME_COPY.system.titleAccent}
                </span>
                <span className="text-metallic">{HOME_COPY.system.titleSuffix}</span>
              </span>
            </h2>

            <p className="mt-5 max-w-[440px] text-[15px] text-[#C9C9C9]">
              {HOME_COPY.system.description}
            </p>

            {/* 2-column checklist */}
            <div
              ref={checklistRef}
              className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 max-w-[480px]"
            >
              {HOME_COPY.system.checklist.map((item) => (
                <div key={item} className="check-item flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#B6F500]/15 border border-[#B6F500]/70">
                    <svg
                      viewBox="0 0 14 14"
                      className="w-3 h-3 stroke-[#B6F500] fill-none"
                      strokeWidth="2.2"
                    >
                      <path d="M2.5 7.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] font-medium text-white/95">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-9">
              <Button variant="outline" to="/system">
                {HOME_COPY.system.cta}
                <span className="sr-only"> ABOUT THE JS FITNESS TRANSFORMATION SYSTEM</span>
              </Button>
            </div>
          </div>

          {/* Right column: Phone Mockup + Overlapping Female Athlete + Orbit Ring */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-start min-h-[460px] sm:min-h-[540px]">
            <div
              ref={phoneRef}
              className="relative z-10 w-[250px] sm:w-[270px] h-[500px] sm:h-[530px] rounded-[38px] border-[2px] border-[#B6F500]/45 bg-[#080909] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_32px_rgba(182,245,0,0.14)] flex flex-col justify-between"
            >
              <div className="mx-auto h-4 w-24 rounded-full bg-black border border-white/10" />

              <div className="mt-2 flex flex-col items-center">
                <JSLogo size="sm" />
              </div>

              <div className="my-auto flex flex-col items-center">
                <div className="relative h-36 w-36 flex items-center justify-center">
                  <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                    <circle
                      cx="70"
                      cy="70"
                      r="56"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="10"
                    />
                    {/* Dual-stroke soft glow underneath */}
                    <circle
                      cx="70"
                      cy="70"
                      r="56"
                      fill="none"
                      stroke="rgba(182,245,0,0.2)"
                      strokeWidth="16"
                    />
                    <circle
                      ref={ringCircleRef}
                      cx="70"
                      cy="70"
                      r="56"
                      fill="none"
                      stroke="#B6F500"
                      strokeWidth="10"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      ref={pctRef}
                      className="font-display italic font-black text-4xl text-white tabular-nums"
                    >
                      92%
                    </span>
                  </div>
                </div>
                <span className="mt-2 text-[11px] font-medium tracking-[0.06em] text-[#C9C9C9]">
                  Weekly Progress
                </span>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-end justify-between gap-[3px] h-16">
                  {BASE_BARS.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="mockup-bar flex-1 origin-bottom rounded-t-[2px] bg-gradient-to-t from-[#8FCC00] to-[#B6F500] transition-transform duration-700"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Female athlete cutout without expensive CSS drop-shadow filter */}
            <img
              ref={athleteRef}
              src="/images/system-athlete.webp"
              srcSet="/images/system-athlete-400.webp 400w, /images/system-athlete-600.webp 600w, /images/system-athlete.webp 900w"
              sizes="(max-width: 768px) 190px, 420px"
              width={900}
              height={1200}
              alt="Female fitness athlete using JS FITNESS SYSTEM"
              loading="lazy"
              decoding="async"
              className="pointer-events-none relative -ml-14 sm:-ml-16 z-20 h-[370px] sm:h-[460px] w-auto object-contain grayscale contrast-125"
            />

            {/* Glowing lime elliptical orbit ring (dual stroke, no live feGaussianBlur) */}
            <svg
              aria-hidden="true"
              viewBox="0 0 680 260"
              className="pointer-events-none absolute -left-24 bottom-6 w-[135%] max-w-[700px] z-30 overflow-visible"
            >
              <path
                d="M 40 210 C 120 120, 260 110, 440 165 C 580 205, 650 185, 665 135 C 675 95, 595 55, 480 48"
                fill="none"
                stroke="rgba(182,245,0,0.22)"
                strokeWidth="7"
              />
              <path
                ref={orbitCometRef}
                d="M 40 210 C 120 120, 260 110, 440 165 C 580 205, 650 185, 665 135 C 675 95, 595 55, 480 48"
                fill="none"
                stroke="#B6F500"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="160 680"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
});
