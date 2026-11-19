import React, { useEffect, useRef, useState } from 'react';
import { loadGsap } from '../../lib/gsapBridge';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { startPerfWatchdog } from '../../lib/perfTier';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);
  const centerLineRef = useRef<HTMLDivElement>(null);
  const logoGroupRef = useRef<HTMLDivElement>(null);
  const logoBadgeRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const platesRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setVisible(false);
    startPerfWatchdog();
    onComplete();
  };

  useEffect(() => {
    if (!visible) {
      startPerfWatchdog();
      onComplete();
      return;
    }

    // Decode hero images during preloader so hero entrance has zero decode frame drops
    ['/images/hero-athlete.webp', '/images/hero-bg.webp'].forEach((src) => {
      const img = new Image();
      img.src = src;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    });

    if (reducedMotion) {
      const timer = setTimeout(finish, 250);
      return () => clearTimeout(timer);
    }

    const hardCap = setTimeout(finish, 2800);
    let cancelled = false;
    let ctx: gsap.Context | null = null;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !rootRef.current) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline();

        tl.fromTo(
          centerLineRef.current,
          { scaleX: 0, opacity: 1 },
          { scaleX: 1, duration: 0.38, ease: 'power3.out' }
        );

        tl.fromTo(
          logoBadgeRef.current,
          { opacity: 0, scale: 0.78, y: 12 },
          { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.4)' },
          0.12
        );

        tl.fromTo(
          streakRef.current,
          { xPercent: -180, opacity: 0 },
          { xPercent: 240, opacity: 0.9, duration: 0.55, ease: 'power2.inOut' },
          0.52
        );

        tl.fromTo(
          taglineRef.current,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' },
          0.5
        );

        const counterObj = { val: 0 };
        const plateEls = platesRef.current?.querySelectorAll<HTMLElement>('[data-plate]') || [];
        let lastCount = -1;
        let lastPlates = 0;

        tl.to(
          counterObj,
          {
            val: 100,
            duration: 1.45,
            ease: 'power2.out',
            onUpdate: () => {
              const p = counterObj.val;
              if (barFillRef.current) {
                barFillRef.current.style.transform = `scaleX(${(p / 100).toFixed(4)})`;
              }
              const v = Math.min(100, Math.round(p));
              if (v !== lastCount) {
                lastCount = v;
                if (countRef.current) countRef.current.textContent = String(v).padStart(3, '0');
              }
              const pCount = Math.floor(v / 25);
              if (pCount !== lastPlates) {
                lastPlates = pCount;
                plateEls.forEach((el) => {
                  const idx = Number(el.dataset.plate || 99);
                  el.style.backgroundColor = idx <= pCount ? '#B6F500' : 'rgba(255,255,255,0.15)';
                });
              }
            },
          },
          0.1
        );

        if (wordsRef.current) {
          const wEls = wordsRef.current.children;
          tl.to(wEls, { opacity: 1, scale: 1, duration: 0.16, stagger: 0.2, ease: 'back.out(1.6)' }, 0.65);
        }

        tl.to(
          logoGroupRef.current,
          { scale: 1.08, opacity: 0, duration: 0.28, ease: 'power3.in' },
          1.72
        )
          .to(topCurtainRef.current, { yPercent: -100, duration: 0.45, ease: 'expo.inOut' }, 1.85)
          .to(
            bottomCurtainRef.current,
            { yPercent: 100, duration: 0.45, ease: 'expo.inOut', onComplete: finish },
            1.85
          );
      }, rootRef);
    });

    return () => {
      cancelled = true;
      clearTimeout(hardCap);
      ctx?.revert();
    };
  }, [visible, reducedMotion]);

  if (!visible) return null;

  const words = ['TRAIN.', 'EAT.', 'SLEEP.', 'REPEAT.'];

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[9995] flex flex-col justify-between overflow-hidden pointer-events-auto"
      role="status"
      aria-label="Loading JS FITNESS INC"
    >
      <div ref={topCurtainRef} className="absolute top-0 left-0 right-0 h-1/2 bg-[#050505]" />
      <div ref={bottomCurtainRef} className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#050505]" />

      <div
        ref={centerLineRef}
        className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#B6F500] to-transparent"
      />

      <div className="relative z-10 m-auto flex flex-col items-center justify-center px-4 text-center">
        <div ref={logoGroupRef} className="relative flex flex-col items-center p-6 rounded-full">
          {/* Expanding radar rings around crest */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full border border-[#B6F500]/35 radar-pulse"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full border border-[#B6F500]/25 radar-pulse"
            style={{ animationDelay: '0.8s' }}
          />

          <div
            ref={logoBadgeRef}
            className="relative overflow-hidden px-4 py-2 flex items-center justify-center"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 50% 48%, rgba(34, 243, 27, 0.24) 0%, rgba(182, 245, 0, 0.08) 46%, transparent 74%)',
              }}
            />
            <img
              src="/images/js-logo-256.webp"
              srcSet="/images/js-logo-256.webp 256w, /images/js-logo.webp 512w"
              sizes="140px"
              width={512}
              height={557}
              alt="JS FITNESS INC"
              decoding="sync"
              className="relative z-10 h-28 sm:h-36 w-auto object-contain select-none"
            />
            <div
              ref={streakRef}
              className="pointer-events-none absolute -inset-y-4 z-20 w-16 -skew-x-12 opacity-0"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
              }}
            />
          </div>

          <div
            ref={taglineRef}
            className="mt-2 font-display font-bold text-xs uppercase tracking-[0.34em] text-white/80"
          >
            MORE THAN JUST A GYM
          </div>

          <div ref={wordsRef} className="mt-5 flex items-center gap-3 h-7">
            {words.map((word, idx) => (
              <span
                key={word}
                style={{ opacity: 0.15, transform: 'scale(0.88)' }}
                className={`font-display italic font-black text-xl uppercase ${
                  idx === 3 ? 'text-[#B6F500]' : 'text-white'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pb-8">
        <div className="flex flex-col gap-2 min-w-[110px]">
          <div className="font-display italic font-black text-2xl sm:text-3xl tracking-wider text-white/90 tabular-nums leading-none">
            <span ref={countRef}>000</span>
            <span className="text-[#B6F500] text-base ml-0.5">%</span>
          </div>
          <div className="h-[3px] w-28 overflow-hidden rounded-full bg-white/10">
            <div
              ref={barFillRef}
              className="h-full w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#8FCC00] to-[#B6F500] shadow-[0_0_10px_#B6F500]"
            />
          </div>
        </div>

        <div ref={platesRef} className="flex items-center gap-1" aria-hidden="true">
          <div className="flex items-center gap-0.5">
            {[4, 3, 2, 1].map((p) => (
              <span
                key={`l-${p}`}
                data-plate={p}
                className="w-2 rounded-sm bg-white/15 transition-colors duration-150"
                style={{ height: `${14 + p * 4}px` }}
              />
            ))}
          </div>
          <div className="w-16 sm:w-24 h-1.5 bg-white/30 rounded-full" />
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4].map((p) => (
              <span
                key={`r-${p}`}
                data-plate={p}
                className="w-2 rounded-sm bg-white/15 transition-colors duration-150"
                style={{ height: `${14 + p * 4}px` }}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={finish}
          className="rounded-full border border-white/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80 hover:border-[#B6F500] hover:text-[#B6F500] transition-colors cursor-pointer"
        >
          Skip
        </button>
      </div>
    </div>
  );
};
