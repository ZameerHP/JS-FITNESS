import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY } from '../../config/siteConfig';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Button } from '../ui/Button';
import { SplitReveal } from '../ui/SplitReveal';

export const FounderSection: React.FC = () => {
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

    const ctx = gsap.context(() => {
      // Top & bottom lime framing lines draw across
      gsap.fromTo(
        [topLineRef.current, bottomLineRef.current],
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        }
      );

      // Left photo clip-path wipe & zoom
      gsap.fromTo(
        photoWrapRef.current,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 78%', once: true },
        }
      );

      gsap.fromTo(
        photoImgRef.current,
        { scale: 1.1 },
        {
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 78%', once: true },
        }
      );

      // Neon JS sign flicker effect on enter
      if (neonOverlayRef.current) {
        const flickerTl = gsap.timeline({
          scrollTrigger: { trigger: el, start: 'top 72%', once: true },
        });
        flickerTl
          .to(neonOverlayRef.current, { opacity: 0.9, duration: 0.08 })
          .to(neonOverlayRef.current, { opacity: 0.2, duration: 0.06 })
          .to(neonOverlayRef.current, { opacity: 0.95, duration: 0.07 })
          .to(neonOverlayRef.current, { opacity: 0.35, duration: 0.08 })
          .to(neonOverlayRef.current, { opacity: 0.75, duration: 0.35 });
      }

      // Handwritten script wipe
      if (scriptRef.current) {
        gsap.fromTo(
          scriptRef.current,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          {
            clipPath: 'inset(0 0% 0 0)',
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: { trigger: scriptRef.current, start: 'top 85%', once: true },
          }
        );
      }
    }, el);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#050505]"
    >
      {/* Top & bottom glowing lime horizontal lines */}
      <div
        ref={topLineRef}
        aria-hidden="true"
        className="h-[1px] w-full origin-left bg-gradient-to-r from-[#B6F500]/60 via-[#B6F500]/30 to-transparent"
      />

      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          {/* Left half: Full-bleed photo of Jatinder */}
          <div className="lg:col-span-6 relative">
            <div
              ref={photoWrapRef}
              className="relative h-[440px] sm:h-[520px] overflow-hidden"
            >
              <img
                ref={photoImgRef}
                src="/images/founder.webp"
                alt="Jatinder Singh — Founder & Certified Personal Trainer at JS FITNESS INC"
                loading="lazy"
                className="h-full w-full object-cover object-top"
              />
              {/* Subtle neon glow flicker overlay behind JS sign */}
              <div
                ref={neonOverlayRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-10 right-16 h-40 w-40 rounded-full bg-[#B6F500]/25 blur-3xl opacity-75"
              />
              {/* Edge blending gradients */}
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

          {/* Right half: Bio + Stronger Together script */}
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

              {/* Script text: Stronger Together */}
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
};
