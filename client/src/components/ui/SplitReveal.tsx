import React, { useEffect, useRef } from 'react';
import { loadGsap } from '../../lib/gsapBridge';
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

const SplitRevealAnimated: React.FC<SplitRevealProps> = ({
  text,
  mode = 'words',
  className = '',
  as: Tag = 'div',
  stagger = 0.025,
  delay = 0,
  trigger = false,
  active = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (trigger && !active) return;

    const tokens = el.querySelectorAll('.split-token');
    if (tokens.length === 0) return;

    const startYPercent = trigger ? 80 : 100;
    const startOpacity = trigger ? 1 : 0;
    let cancelled = false;
    let ctx: gsap.Context | null = null;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !containerRef.current) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          tokens,
          { yPercent: startYPercent, skewY: 5, opacity: startOpacity },
          {
            yPercent: 0,
            skewY: 0,
            opacity: 1,
            duration: 0.65,
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
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [text, mode, stagger, delay, trigger, active]);

  const words = text.split(' ');

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={className} aria-label={text}>
      {words.map((word, wIdx) => (
        <span key={`${word}-${wIdx}`} className="inline-block whitespace-nowrap">
          {mode === 'words' ? (
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

export const SplitReveal: React.FC<SplitRevealProps> = React.memo((props) => {
  const { text, className = '', as: Tag = 'div' } = props;
  const reducedMotion = useReducedMotion();
  const tier = useTier();
  const isAutomated = typeof navigator !== 'undefined' && Boolean(navigator.webdriver);

  if (reducedMotion || tier !== 'high' || isAutomated) {
    return (
      <Tag className={className} aria-label={text}>
        {text}
      </Tag>
    );
  }

  return <SplitRevealAnimated {...props} />;
});
