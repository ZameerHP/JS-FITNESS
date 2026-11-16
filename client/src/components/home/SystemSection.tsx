import React, { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { HOME_COPY } from '../../config/siteConfig';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Button } from '../ui/Button';
import { SplitReveal } from '../ui/SplitReveal';
import { JSLogo } from '../ui/JSLogo';

const BASE_BARS = [
  24, 30, 28, 38, 34, 44, 42, 52, 48, 58, 56, 66, 62, 74, 70, 80, 76, 86, 84, 94,
];

export const SystemSection: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const athleteRef = useRef<HTMLImageElement>(null);
  const ringCircleRef = useRef<SVGCircleElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);

  const [progressPct, setProgressPct] = useState(reducedMotion ? 92 : 0);
  const [barHeights, setBarHeights] = useState<number[]>(BASE_BARS);
  const [tilt, setTilt] = useState({ rx: 0, ry: -6 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      // Float phone subtly
      gsap.to(phoneRef.current, {
        y: -10,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Athlete scroll parallax
      gsap.fromTo(
        athleteRef.current,
        { y: 40 },
        {
          y: -35,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );

      // Progress ring 0 -> 92%
      const circle = ringCircleRef.current;
      if (circle) {
        const radius = 56;
        const circumference = 2 * Math.PI * radius;
        gsap.set(circle, {
          strokeDasharray: circumference,
          strokeDashoffset: circumference,
        });

        const obj = { val: 0 };
        gsap.to(obj, {
          val: 92,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 72%',
            once: true,
          },
          onUpdate: () => {
            const v = Math.round(obj.val);
            setProgressPct(v);
            const offset = circumference - (v / 100) * circumference;
            circle.style.strokeDashoffset = String(offset);
          },
        });
      }

      // Checklist stagger
      if (checklistRef.current) {
        const items = checklistRef.current.querySelectorAll('.check-item');
        gsap.fromTo(
          items,
          { x: -18, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: checklistRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      // Bars grow stagger
      const bars = el.querySelectorAll('.mockup-bar');
      gsap.fromTo(
        bars,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.6,
          stagger: 0.04,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: phoneRef.current,
            start: 'top 82%',
            once: true,
          },
        }
      );
    }, el);

    // Live jitter on bars every 3s
    const interval = setInterval(() => {
      setBarHeights(
        BASE_BARS.map((val) =>
          Math.max(18, Math.min(98, val + Math.round((Math.random() - 0.5) * 14)))
        )
      );
    }, 3000);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, [reducedMotion]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion || window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ rx: -ny * 5, ry: nx * 8 - 4 });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-[#050505] py-24 lg:py-32"
    >
      {/* Subtle smoky green glow & dim diagonal barbell plate silhouette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/3 h-[500px] w-[500px] rounded-full bg-[#B6F500]/[0.07] blur-[140px]"
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
              </Button>
            </div>
          </div>

          {/* Right column: Interactive Phone Mockup + Overlapping Female Athlete + Orbit Ring */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-start min-h-[460px] sm:min-h-[540px]">
            {/* Phone mockup */}
            <div
              ref={phoneRef}
              style={{
                transform: `perspective(1100px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transition: 'transform 220ms ease-out',
              }}
              className="relative z-10 w-[250px] sm:w-[270px] h-[500px] sm:h-[530px] rounded-[38px] border-[2px] border-[#B6F500]/45 bg-[#080909] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(182,245,0,0.16)] flex flex-col justify-between"
            >
              {/* Notch */}
              <div className="mx-auto h-4 w-24 rounded-full bg-black border border-white/10" />

              {/* Top Logo */}
              <div className="mt-2 flex flex-col items-center">
                <JSLogo size="sm" />
              </div>

              {/* Circular 92% Weekly Progress Ring */}
              <div className="my-auto flex flex-col items-center">
                <div className="relative h-36 w-36 flex items-center justify-center">
                  <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                    <defs>
                      <filter id="ring-glow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <circle
                      cx="70"
                      cy="70"
                      r="56"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="10"
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
                      filter="url(#ring-glow)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display italic font-black text-4xl text-white tabular-nums">
                      {progressPct}%
                    </span>
                  </div>
                </div>
                <span className="mt-2 text-[11px] font-medium tracking-[0.06em] text-[#C9C9C9]">
                  Weekly Progress
                </span>
              </div>

              {/* Bottom 20-bar animated lime chart */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3">
                <div className="flex items-end justify-between gap-[3px] h-16">
                  {barHeights.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="mockup-bar flex-1 origin-bottom rounded-t-[2px] bg-gradient-to-t from-[#8FCC00] to-[#B6F500] transition-all duration-700"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Grayscale high-contrast female athlete cutout overlapping right edge */}
            <img
              ref={athleteRef}
              src="/images/system-athlete.webp"
              alt="Female fitness athlete using JS FITNESS SYSTEM"
              loading="lazy"
              className="pointer-events-none relative -ml-14 sm:-ml-16 z-20 h-[370px] sm:h-[460px] w-auto object-contain grayscale contrast-125 drop-shadow-[0_0_28px_rgba(0,0,0,0.95)]"
            />

            {/* Glowing lime elliptical orbit ring wrapping lower left & sweeping left */}
            <svg
              aria-hidden="true"
              viewBox="0 0 680 260"
              className="pointer-events-none absolute -left-24 bottom-6 w-[135%] max-w-[700px] z-30 overflow-visible"
            >
              <defs>
                <filter id="orbit-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 40 210 C 120 120, 260 110, 440 165 C 580 205, 650 185, 665 135 C 675 95, 595 55, 480 48"
                fill="none"
                stroke="rgba(182,245,0,0.35)"
                strokeWidth="2"
              />
              <path
                d="M 40 210 C 120 120, 260 110, 440 165 C 580 205, 650 185, 665 135 C 675 95, 595 55, 480 48"
                fill="none"
                stroke="#B6F500"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="160 680"
                filter="url(#orbit-glow)"
              >
                {!reducedMotion && (
                  <animate
                    attributeName="stroke-dashoffset"
                    from="840"
                    to="0"
                    dur="4.5s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
