import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY } from '../../config/siteConfig';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';
import { scheduleChunkedTask } from '../../lib/scheduler';
import { Button } from '../ui/Button';
import { SplitReveal } from '../ui/SplitReveal';

export const FounderSection: React.FC = React.memo(() => {
  const reducedMotion = useReducedMotion();
  const tier = useTier();
  const sectionRef = useRef<HTMLElement>(null);
  const photoWrapRef = useRef<HTMLDivElement>(null);
  const photoImgRef = useRef<HTMLImageElement>(null);
  const neonOverlayRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reducedMotion || tier === 'low') return;

    let ctx: gsap.Context | null = null;
    const cancelTask = scheduleChunkedTask(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          [topLineRef.current, bottomLineRef.current],
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 84%', once: true },
          }
        );

        gsap.fromTo(
          photoWrapRef.current,
          { opacity: 0, x: -24 },
          {
            opacity: 1,
            x: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          }
        );

        gsap.fromTo(
          photoImgRef.current,
          { scale: 1.08 },
          {
            scale: 1,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 80%', once: true },
          }
        );

        if (neonOverlayRef.current && tier === 'high') {
          const flickerTl = gsap.timeline({
            scrollTrigger: { trigger: el, start: 'top 74%', once: true },
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
              duration: 0.85,
              ease: 'power2.out',
              scrollTrigger: { trigger: scriptRef.current, start: 'top 86%', once: true },
            }
          );
        }
      }, el);
    });

    return () => {
      cancelTask();
      ctx?.revert();
    };
  }, [reducedMotion, tier]);

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
                src="/images/founder.webp"
                srcSet="/images/founder-700.webp 700w, /images/founder.webp 1000w"
                sizes="(max-width: 1024px) 100vw, 600px"
                width={1000}
                height={1333}
                alt="Jatinder Singh — Founder & Certified Personal Trainer at JS FITNESS INC"
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
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
              <div className="max-w-[380px]">
                <div className="eyebrow-row mb-4">{HOME_COPY.founder.eyebrow}</div>

                <h2 className="headline-display text-[42px] sm:text-[50px] text-white">
                  <SplitReveal text={HOME_COPY.founder.name} mode="chars" />
                </h2>

                <div className="mt-1.5 text-[15px] font-medium text-[#C9C9C9]">
                  {HOME_COPY.founder.title}
                </div>

                <p className="mt-5 text-[15px] leading-relaxed text-[#C9C9C9]">
                  {HOME_COPY.founder.mission}
                </p>

                <div className="mt-7">
                  <Button variant="outline" to="/about">
                    {HOME_COPY.founder.cta}
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
