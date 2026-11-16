import React, { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';

interface SplitRevealProps {
  text: string;
  mode?: 'chars' | 'words';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  stagger?: number;
  delay?: number;
  trigger?: boolean;
  active?: boolean;
  revertOnComplete?: boolean;
}

export const SplitReveal: React.FC<SplitRevealProps> = ({
  text,
  mode = 'words',
  className = '',
  as: Tag = 'div',
  stagger = 0.025,
  delay = 0,
  trigger = false,
  active = true,
  revertOnComplete = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const tier = useTier();
  const isPlainBelowFold = !trigger && tier !== 'high';

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (trigger && !active) return;

    if (reducedMotion || tier === 'low') {
      const tokens = el.querySelectorAll('.split-token');
      if (tokens.length > 0) gsap.set(tokens, { yPercent: 0, skewY: 0, opacity: 1 });
      gsap.set(el, { y: 0, opacity: 1 });
      return;
    }

    if (isPlainBelowFold) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          }
        );
      }, el);
      return () => ctx.revert();
    }

    const tokens = el.querySelectorAll('.split-token');
    if (tokens.length === 0) return;

    const startYPercent = trigger && tier !== 'high' ? 28 : trigger ? 80 : 100;
    const startOpacity = trigger ? 1 : 0;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tokens,
        { yPercent: startYPercent, skewY: tier === 'high' ? 5 : 0, opacity: startOpacity },
        {
          yPercent: 0,
          skewY: 0,
          opacity: 1,
          duration: tier === 'high' ? 0.65 : 0.45,
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
  }, [text, mode, stagger, delay, trigger, active, reducedMotion, tier, isPlainBelowFold]);

  const effectiveMode = tier === 'high' ? mode : 'words';
  const words = text.split(' ');

  if (isPlainBelowFold || reducedMotion || tier === 'low') {
    return (
      <Tag ref={containerRef as React.RefObject<never>} className={className} aria-label={text}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={className} aria-label={text}>
      {words.map((word, wIdx) => (
        <span key={`${word}-${wIdx}`} className="inline-block whitespace-nowrap">
          {effectiveMode === 'words' ? (
            <span className="inline-block overflow-hidden align-bottom pb-[0.06em]">
              <span className="split-token inline-block">{word}</span>
            </span>
          ) : (
            word.split('').map((char, cIdx) => (
              <span
                key={`${wIdx}-${cIdx}`}
                className="inline-block overflow-hidden align-bottom pb-[0.06em]"
              >
                <span className="split-token inline-block">{char}</span>
              </span>
            ))
          )}
          {wIdx < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </Tag>
  );
};
