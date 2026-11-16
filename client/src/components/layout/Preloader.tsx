import React, { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface PreloaderProps {
  onComplete: () => void;
}

const SESSION_KEY = 'js_preloader_seen';

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [count, setCount] = useState(0);
  const [plates, setPlates] = useState(0);
  const [activeWord, setActiveWord] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const topCurtainRef = useRef<HTMLDivElement>(null);
  const bottomCurtainRef = useRef<HTMLDivElement>(null);
  const centerLineRef = useRef<HTMLDivElement>(null);
  const logoGroupRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLDivElement>(null);
  const fitnessIncRef = useRef<HTMLDivElement>(null);
  const jsStrokeJRef = useRef<SVGPathElement>(null);
  const jsStrokeSRef = useRef<SVGPathElement>(null);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    sessionStorage.setItem(SESSION_KEY, '1');
    setVisible(false);
    onComplete();
  };

  useEffect(() => {
    if (!visible) {
      onComplete();
      return;
    }

    // Preload hero assets while preloader runs
    ['/images/hero-athlete.webp', '/images/hero-bg.webp'].forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    if (reducedMotion) {
      const timer = setTimeout(finish, 400);
      return () => clearTimeout(timer);
    }

    const hardCap = setTimeout(() => {
      finish();
    }, 4000);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 0.0s: thin lime line draws across center
      tl.fromTo(
        centerLineRef.current,
        { scaleX: 0, opacity: 1 },
        { scaleX: 1, duration: 0.55, ease: 'power3.out' }
      );

      // 0.35s: SVG JS logo strokes draw on with lime glow
      [jsStrokeJRef.current, jsStrokeSRef.current].forEach((p) => {
        if (p) {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        }
      });

      tl.to(
        [jsStrokeJRef.current, jsStrokeSRef.current],
        {
          strokeDashoffset: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power2.inOut',
        },
        0.35
      );

      // Fill metallic & slash streak
      tl.fromTo(
        streakRef.current,
        { xPercent: -160, opacity: 0 },
        { xPercent: 200, opacity: 1, duration: 0.6, ease: 'power2.inOut' },
        1.0
      );

      // FITNESS INC tracks in from wide letter-spacing
      tl.fromTo(
        fitnessIncRef.current,
        { letterSpacing: '0.75em', opacity: 0 },
        { letterSpacing: '0.28em', opacity: 1, duration: 0.65, ease: 'power3.out' },
        0.95
      );

      // Counter 000 -> 100 and barbell plates
      const counterObj = { val: 0 };
      tl.to(
        counterObj,
        {
          val: 100,
          duration: 2.3,
          ease: 'power2.inOut',
          onUpdate: () => {
            const v = Math.round(counterObj.val);
            setCount(v);
            setPlates(Math.floor(v / 25));
          },
        },
        0.2
      );

      // Words flash one by one
      tl.call(() => setActiveWord(0), [], 1.25)
        .call(() => setActiveWord(1), [], 1.55)
        .call(() => setActiveWord(2), [], 1.85)
        .call(() => setActiveWord(3), [], 2.15);

      // Exit: logo scales into lime ring, top and bottom black panels split open
      tl.to(
        logoGroupRef.current,
        {
          scale: 1.15,
          opacity: 0,
          duration: 0.45,
          ease: 'power3.in',
        },
        2.75
      )
        .to(
          topCurtainRef.current,
          { yPercent: -100, duration: 0.65, ease: 'expo.inOut' },
          3.0
        )
        .to(
          bottomCurtainRef.current,
          {
            yPercent: 100,
            duration: 0.65,
            ease: 'expo.inOut',
            onComplete: finish,
          },
          3.0
        );
    }, rootRef);

    return () => {
      clearTimeout(hardCap);
      ctx.revert();
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
      {/* Top & bottom split black panels */}
      <div
        ref={topCurtainRef}
        className="absolute top-0 left-0 right-0 h-1/2 bg-[#050505]"
      >
        <div className="film-grain absolute inset-0 pointer-events-none" />
      </div>
      <div
        ref={bottomCurtainRef}
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#050505]"
      >
        <div className="film-grain absolute inset-0 pointer-events-none" />
      </div>

      {/* Center thin lime divider line */}
      <div
        ref={centerLineRef}
        className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#B6F500] to-transparent shadow-[0_0_20px_rgba(182,245,0,0.8)]"
      />

      {/* Center Monogram & Words */}
      <div className="relative z-10 m-auto flex flex-col items-center justify-center px-4 text-center">
        <div
          ref={logoGroupRef}
          className="relative flex flex-col items-center p-6 rounded-full"
        >
          {/* SVG JS Mark */}
          <div className="relative overflow-hidden px-4 py-2">
            <svg
              viewBox="0 0 180 96"
              className="w-36 h-20 drop-shadow-[0_0_18px_rgba(182,245,0,0.55)]"
            >
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
            {/* Light streak slash */}
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

          {/* Flashed words */}
          <div className="mt-5 flex items-center gap-3 h-7">
            {words.map((word, idx) => (
              <span
                key={word}
                className={`font-display italic font-black text-xl uppercase transition-all duration-150 ${
                  activeWord >= idx ? 'opacity-100 scale-100' : 'opacity-15 scale-90'
                } ${idx === 3 ? 'text-[#B6F500] drop-shadow-[0_0_14px_rgba(182,245,0,0.75)]' : 'text-white'}`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom HUD: Counter (left), Barbell loader (center), Skip (right) */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pb-8">
        {/* Counter 000 - 100 */}
        <div className="font-display italic font-black text-2xl sm:text-3xl tracking-wider text-white/90 tabular-nums">
          {String(count).padStart(3, '0')}
          <span className="text-[#B6F500] text-base ml-0.5">%</span>
        </div>

        {/* Barbell plate loader */}
        <div className="flex items-center gap-1" aria-hidden="true">
          <div className="flex items-center gap-0.5">
            {[4, 3, 2, 1].map((p) => (
              <span
                key={`l-${p}`}
                className={`w-2 rounded-sm transition-all duration-200 ${
                  plates >= p ? 'bg-[#B6F500] shadow-[0_0_8px_#B6F500]' : 'bg-white/15'
                }`}
                style={{ height: `${14 + p * 4}px` }}
              />
            ))}
          </div>
          <div className="w-16 sm:w-24 h-1.5 bg-white/30 rounded-full" />
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4].map((p) => (
              <span
                key={`r-${p}`}
                className={`w-2 rounded-sm transition-all duration-200 ${
                  plates >= p ? 'bg-[#B6F500] shadow-[0_0_8px_#B6F500]' : 'bg-white/15'
                }`}
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
