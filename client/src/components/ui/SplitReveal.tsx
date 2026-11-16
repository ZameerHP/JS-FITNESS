import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface SplitRevealProps {
  text: string;
  mode?: 'chars' | 'words';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  stagger?: number;
  delay?: number;
  trigger?: boolean; // If false, plays via ScrollTrigger; if true, waits for active prop
  active?: boolean;
}

export const SplitReveal: React.FC<SplitRevealProps> = ({
  text,
  mode = 'chars',
  className = '',
  as: Tag = 'div',
  stagger = 0.025,
  delay = 0,
  trigger = false,
  active = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (trigger && !active) return;

    const tokens = el.querySelectorAll('.split-token');
    if (tokens.length === 0) return;

    if (reducedMotion) {
      gsap.set(tokens, { yPercent: 0, skewY: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tokens,
        { yPercent: 115, skewY: 8, opacity: 0 },
        {
          yPercent: 0,
          skewY: 0,
          opacity: 1,
          duration: 0.75,
          stagger,
          delay,
          ease: 'power4.out',
          scrollTrigger: trigger
            ? undefined
            : {
                trigger: el,
                start: 'top 88%',
                once: true,
              },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [text, mode, stagger, delay, trigger, active, reducedMotion]);

  const words = text.split(' ');

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={className} aria-label={text}>
      {words.map((word, wIdx) => (
        <span key={`${word}-${wIdx}`} className="inline-block whitespace-nowrap">
          {mode === 'words' ? (
            <span className="inline-block overflow-hidden align-bottom pb-[0.06em]">
              <span className="split-token inline-block will-change-transform">{word}</span>
            </span>
          ) : (
            word.split('').map((char, cIdx) => (
              <span
                key={`${wIdx}-${cIdx}`}
                className="inline-block overflow-hidden align-bottom pb-[0.06em]"
              >
                <span className="split-token inline-block will-change-transform">{char}</span>
              </span>
            ))
          )}
          {wIdx < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
};
