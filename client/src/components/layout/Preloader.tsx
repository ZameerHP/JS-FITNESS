import React, { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { startPerfWatchdog, useTier, hasHardwareWebGL } from '../../lib/perfTier';

interface PreloaderProps {
  onComplete: () => void;
}

const SESSION_KEY = 'js_preloader_seen';

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const reducedMotion = useReducedMotion();
  const tier = useTier();
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (sessionStorage.getItem(SESSION_KEY)) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const t = document.documentElement.dataset.perf || 'high';
    if (t !== 'high' || !hasHardwareWebGL()) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return false;
    }
    return true;
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);
  const centerLineRef = useRef<HTMLDivElement>(null);
  const logoGroupRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);
  const fitnessIncRef = useRef<HTMLDivElement>(null);
  const jsStrokeJRef = useRef<SVGPathElement>(null);
  const jsStrokeSRef = useRef<SVGPathElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const platesRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    sessionStorage.setItem(SESSION_KEY, '1');
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

    // Decode hero images during preloader so hero entrance has zero image decode jank
    ['/images/hero-athlete.webp', '/images/hero-bg.webp'].forEach((src) => {
      const img = new Image();
      img.src = src;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    });

    if (reducedMotion || tier === 'low') {
      const timer = setTimeout(finish, 300);
      return () => clearTimeout(timer);
    }

    const hardCap = setTimeout(finish, 3800);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.fromTo(
        centerLineRef.current,
        { scaleX: 0, opacity: 1 },
        { scaleX: 1, duration: 0.45, ease: 'power3.out' }
      );

      const strokeItems = [jsStrokeJRef.current, jsStrokeSRef.current]
        .filter(Boolean)
        .map((p) => {
          const len = p!.getTotalLength();
          const lenPx = `${len.toFixed(1)}px`;
          p!.style.strokeDasharray = lenPx;
          p!.style.strokeDashoffset = lenPx;
          return { el: p!, len };
        });

      const strokeObj = { p: 1 };
      tl.to(
        strokeObj,
        {
          p: 0,
          duration: 0.85,
          ease: 'power2.inOut',
          onUpdate: () => {
            for (let i = 0; i < strokeItems.length; i += 1) {
              strokeItems[i].el.style.strokeDashoffset = `${(strokeItems[i].len * strokeObj.p).toFixed(1)}px`;
            }
          },
        },
        0.25
      );

      tl.fromTo(
        streakRef.current,
        { xPercent: -160, opacity: 0 },
        { xPercent: 200, opacity: 1, duration: 0.5, ease: 'power2.inOut' },
        0.8
      );

      tl.fromTo(
        fitnessIncRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
        0.75
      );

      // Update counter & plates directly on DOM refs (zero React re-renders)
      const counterObj = { val: 0 };
      const plateEls = platesRef.current?.querySelectorAll<HTMLElement>('[data-plate]') || [];
      let lastCount = -1;
      let lastPlates = 0;

      tl.to(
        counterObj,
        {
          val: 100,
          duration: 1.9,
          ease: 'power2.inOut',
          onUpdate: () => {
            const v = Math.round(counterObj.val);
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
        0.15
      );

      if (wordsRef.current) {
        const wEls = wordsRef.current.children;
        tl.to(wEls, { opacity: 1, scale: 1, duration: 0.15, stagger: 0.25 }, 0.95);
      }

      tl.to(
        logoGroupRef.current,
        { scale: 1.12, opacity: 0, duration: 0.35, ease: 'power3.in' },
        2.35
      )
        .to(topCurtainRef.current, { yPercent: -100, duration: 0.55, ease: 'expo.inOut' }, 2.55)
        .to(
          bottomCurtainRef.current,
          { yPercent: 100, duration: 0.55, ease: 'expo.inOut', onComplete: finish },
          2.55
        );
    }, rootRef);

    return () => {
      clearTimeout(hardCap);
      ctx.revert();
    };
  }, [visible, reducedMotion, tier]);

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
          <div className="relative overflow-hidden px-4 py-2">
            <svg viewBox="0 0 180 96" className="w-36 h-20">
              <path
                ref={jsStrokeJRef}
                d="M66 16 L54 64 C51 76 42 82 30 82 C20 82 14 76 16 66"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                ref={jsStrokeSRef}
                d="M148 24 C140 16 122 14 110 22 C98 30 100 42 118 48 C138 54 142 68 128 76 C114 84 94 82 86 72"
                fill="none"
                stroke="#B6F500"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </svg>
            <div
              ref={streakRef}
              className="pointer-events-none absolute inset-y-0 w-10 -skew-x-25 bg-gradient-to-r from-transparent via-white/80 to-transparent"
            />
          </div>

          <div
            ref={fitnessIncRef}
            className="mt-2 font-display font-bold text-sm uppercase tracking-[0.28em] text-white/90"
          >
            FITNESS INC
          </div>

          <div ref={wordsRef} className="mt-5 flex items-center gap-3 h-7">
            {words.map((word, idx) => (
              <span
                key={word}
                style={{ opacity: 0.15, transform: 'scale(0.92)' }}
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
        <div className="font-display italic font-black text-2xl sm:text-3xl tracking-wider text-white/90 tabular-nums">
          <span ref={countRef}>000</span>
          <span className="text-[#B6F500] text-base ml-0.5">%</span>
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
