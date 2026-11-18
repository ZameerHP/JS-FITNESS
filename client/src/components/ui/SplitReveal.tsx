import React, { useEffect, useRef } from 'react';
import { loadGsap } from '../../lib/gsapBridge';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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

const GRADIENT_TEXT_CLASSES = ['text-metallic', 'text-cream-metallic', 'text-lime-glow'];

function partitionClasses(className: string): { wrapperClass: string; tokenClass: string } {
  const tokens = className.split(/\s+/).filter(Boolean);
  const tokenClasses: string[] = [];
  const wrapperClasses: string[] = [];
  for (const cls of tokens) {
    if (GRADIENT_TEXT_CLASSES.includes(cls)) {
      tokenClasses.push(cls);
    } else {
      wrapperClasses.push(cls);
    }
  }
  return {
    wrapperClass: wrapperClasses.join(' '),
    tokenClass: tokenClasses.join(' '),
  };
}

const SplitRevealAnimated: React.FC<SplitRevealProps> = ({
  text,
  className = '',
  as: Tag = 'div',
  stagger = 0.055,
  delay = 0,
  trigger = false,
  active = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { wrapperClass, tokenClass } = partitionClasses(className);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (trigger && !active) return;

    const tokens = el.querySelectorAll('.split-token');
    if (tokens.length === 0) return;

    const startY = trigger ? 16 : 22;
    const startOpacity = trigger ? 0.92 : 0;
    let cancelled = false;
    let ctx: gsap.Context | null = null;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !containerRef.current) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          tokens,
          { y: startY, opacity: startOpacity },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger,
            delay,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
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
  }, [text, stagger, delay, trigger, active]);

  const words = text.split(' ');

  return (
    <Tag ref={containerRef as React.RefObject<never>} className={wrapperClass} aria-label={text}>
      {words.map((word, wIdx) => (
        <React.Fragment key={`${word}-${wIdx}`}>
          <span
            className={`split-token inline-block ${tokenClass ? `${tokenClass} pr-[0.04em] -mr-[0.04em]` : ''}`}
          >
            {word}
          </span>
          {wIdx < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </Tag>
  );
};

export const SplitReveal: React.FC<SplitRevealProps> = React.memo((props) => {
  const { text, className = '', as: Tag = 'div' } = props;
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <Tag className={className} aria-label={text}>
        {text}
      </Tag>
    );
  }

  return <SplitRevealAnimated {...props} />;
});
