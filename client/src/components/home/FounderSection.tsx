import React, { useEffect, useRef } from 'react';
import { Award } from 'lucide-react';
import { loadGsap } from '../../lib/gsapBridge';
import { HOME_COPY } from '../../config/siteConfig';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { scheduleChunkedTask } from '../../lib/scheduler';
import { Button } from '../ui/Button';
import { SplitReveal } from '../ui/SplitReveal';
import { Reveal } from '../ui/Reveal';

export const FounderSection: React.FC = React.memo(() => {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const photoWrapRef = useRef<HTMLDivElement>(null);
  const photoImgRef = useRef<HTMLImageElement>(null);
  const neonOverlayRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion) return;

    let cancelled = false;
    let ctx: gsap.Context | null = null;
    const cancelTask = scheduleChunkedTask(() => {
      loadGsap().then(({ gsap }) => {
        if (cancelled || !sectionRef.current) return;
        ctx = gsap.context(() => {
          gsap.fromTo(
            [topLineRef.current, bottomLineRef.current],
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 86%', once: true },
            }
          );

          gsap.fromTo(
            photoWrapRef.current,
            { opacity: 0, x: -24 },
            {
              opacity: 1,
              x: 0,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 82%', once: true },
            }
          );

          gsap.fromTo(
            photoImgRef.current,
            { scale: 1.08 },
            {
              scale: 1,
              duration: 1.05,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 82%', once: true },
            }
          );

          const statTiles = el.querySelectorAll('.founder-stat-tile');
          if (statTiles.length > 0) {
            gsap.fromTo(
              statTiles,
              { y: 14, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.45,
                stagger: 0.09,
                ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 78%', once: true },
              }
            );
          }

          if (neonOverlayRef.current) {
            const flickerTl = gsap.timeline({
              scrollTrigger: { trigger: el, start: 'top 76%', once: true },
            });
            flickerTl
              .to(neonOverlayRef.current, { opacity: 0.9, duration: 0.08 })
              .to(neonOverlayRef.current, { opacity: 0.2, duration: 0.06 })
              .to(neonOverlayRef.current, { opacity: 0.95, duration: 0.07 })
              .to(neonOverlayRef.current, { opacity: 0.35, duration: 0.08 })
              .to(neonOverlayRef.current, { opacity: 0.75, duration: 0.35 });
          }

          if (scriptRef.current) {
            gsap.fromTo(
              scriptRef.current,
              { x: -16, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: { trigger: scriptRef.current, start: 'top 88%', once: true },
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
      className="cv-section relative overflow-hidden bg-[#050505] isolate"
    >
      <div
        ref={topLineRef}
        aria-hidden="true"
        className="h-[1px] w-full origin-left bg-gradient-to-r from-[#B6F500]/60 via-[#B6F500]/30 to-transparent"
      />

      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 relative">
            <div
              ref={photoWrapRef}
              className="relative h-[440px] sm:h-[520px] overflow-hidden"
            >
              <img
                ref={photoImgRef}
                src="/images/facility-neon-logo.webp"
                srcSet="/images/facility-neon-logo-700.webp 700w, /images/facility-neon-logo.webp 1000w"
                sizes="(max-width: 1024px) 100vw, 600px"
                width={1000}
                height={1333}
                alt="JS FITNESS INC Calgary NE neon wall crest"
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-top"
              />
              <div
                ref={neonOverlayRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-10 right-16 h-44 w-44 rounded-full opacity-75"
                style={{
                  background:
                    'radial-gradient(circle, rgba(182, 245, 0, 0.25) 0%, transparent 70%)',
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050505]/70 via-transparent to-[#050505]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40"
              />
            </div>
          </div>

          <div className="lg:col-span-6 py-12 lg:py-16 lg:pl-12 relative">
            <Reveal>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div className="max-w-[420px]">
                  <div className="eyebrow-row mb-4">{HOME_COPY.founder.eyebrow}</div>

                  <h2 className="headline-display text-[42px] sm:text-[50px] text-white">
                    <SplitReveal text={HOME_COPY.founder.name} mode="words" />
                  </h2>

                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#B6F500]/40 bg-[#B6F500]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#B6F500]">
                    <Award className="w-3.5 h-3.5" strokeWidth={1.85} />
                    <span>{HOME_COPY.founder.credentialBadge}</span>
                  </div>

                  <p className="mt-4 text-[15px] leading-relaxed text-[#C9C9C9]">
                    {HOME_COPY.founder.mission}
                  </p>

                  <blockquote className="mt-3 pl-3.5 border-l-2 border-[#B6F500]/65 text-xs italic text-white/80">
                    &ldquo;{HOME_COPY.founder.quote}&rdquo;
                  </blockquote>

                  {/* Verifiable Authority & Coaching Standards Strip */}
                  <div className="mt-5 grid grid-cols-3 gap-2.5">
                    {HOME_COPY.founder.trustStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="founder-stat-tile rounded-xl border border-white/10 bg-[#0B0B0C]/90 px-3 py-2.5"
                      >
                        <div className="font-display italic font-black text-lg leading-none text-[#B6F500]">
                          {stat.value}
                        </div>
                        <div className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#8C8C8C] leading-tight">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7">
                    <Button variant="outline" to="/about">
                      {HOME_COPY.founder.cta}
                      <span className="sr-only"> ABOUT FOUNDER JATINDER SINGH</span>
                    </Button>
                  </div>
                </div>

              <div
                ref={scriptRef}
                style={{ textShadow: '0 0 24px rgba(182, 245, 0, 0.45)' }}
                className="select-none self-end sm:self-center -rotate-8 text-[#B6F500]"
              >
                <div className="font-script text-[46px] sm:text-[56px] leading-[0.88] text-right">
                  <div>{HOME_COPY.founder.scriptTop}</div>
                  <div className="-mt-1">{HOME_COPY.founder.scriptBottom}</div>
                </div>
                <svg viewBox="0 0 180 28" className="w-40 ml-auto mt-1 overflow-visible">
                  <path
                    d="M 10 18 C 55 8, 125 6, 170 12"
                    fill="none"
                    stroke="#B6F500"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <div
        ref={bottomLineRef}
        aria-hidden="true"
        className="h-[1px] w-full origin-right bg-gradient-to-l from-[#B6F500]/60 via-[#B6F500]/25 to-transparent"
      />
    </section>
  );
});
