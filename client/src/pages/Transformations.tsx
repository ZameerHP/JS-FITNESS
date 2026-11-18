import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MoveHorizontal, Quote, Star } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';
import { TransformationItem } from '../lib/api';
import { SEOHead } from '../components/ui/SEOHead';
import { SplitReveal } from '../components/ui/SplitReveal';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';
import { BookingCardsSection } from '../components/home/BookingCardsSection';

const InteractiveTransformationCard: React.FC<{ item: TransformationItem }> = ({ item }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const draggingRef = useRef(false);
  const userInteractedRef = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let rafId = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || userInteractedRef.current) return;
        io.disconnect();
        const start = performance.now();
        const peek = (now: number) => {
          if (userInteractedRef.current) return;
          const elapsed = now - start;
          if (elapsed > 1100) {
            setSliderPos(50);
            return;
          }
          const t = elapsed / 1100;
          setSliderPos(50 + Math.sin(t * Math.PI * 2) * 14);
          rafId = window.requestAnimationFrame(peek);
        };
        rafId = window.requestAnimationFrame(peek);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  const updateFromClientX = (el: HTMLDivElement, clientX: number) => {
    userInteractedRef.current = true;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pct)));
  };

  return (
    <div ref={frameRef} className="card-unified card-hover-lift p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-lg">{item.name}</h3>
            {item.isDemo && (
              <span className="rounded bg-[#B6F500]/20 border border-[#B6F500]/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#B6F500]">
                DEMO
              </span>
            )}
          </div>
          <p className="text-xs text-[#B6F500] uppercase tracking-wider font-semibold">
            {item.timeframe} • {item.category}
          </p>
        </div>
      </div>

      {/* Interactive comparison — works on pointer drag, click, hover scrub, and touch */}
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 select-none cursor-ew-resize"
        style={{ touchAction: 'pan-y' }}
        data-cursor="drag"
        onPointerDown={(e) => {
          draggingRef.current = true;
          updateFromClientX(e.currentTarget, e.clientX);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
        onPointerLeave={() => {
          draggingRef.current = false;
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'touch' && !draggingRef.current) return;
          updateFromClientX(e.currentTarget, e.clientX);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          if (touch) updateFromClientX(e.currentTarget, touch.clientX);
        }}
      >
        <img
          src={item.afterImage}
          alt={`${item.name} after`}
          className="h-full w-full object-cover"
          draggable={false}
        />
        <span className="absolute bottom-3 right-3 rounded-full bg-black/80 border border-[#B6F500]/60 px-3 py-0.5 text-[10px] font-bold uppercase text-[#B6F500]">
          AFTER
        </span>

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src={item.beforeImage}
            alt={`${item.name} before`}
            className="h-full w-full object-cover"
            draggable={false}
          />
          <span className="absolute bottom-3 left-3 rounded-full bg-black/80 border border-white/25 px-3 py-0.5 text-[10px] font-bold uppercase text-white">
            BEFORE
          </span>
        </div>

        <div
          style={{ left: `${sliderPos}%` }}
          className="absolute inset-y-0 w-[2px] bg-[#B6F500] shadow-[0_0_12px_#B6F500]"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-[#B6F500] text-black shadow-lg">
            <MoveHorizontal className="w-4 h-4" strokeWidth={1.85} />
          </div>
        </div>
      </div>

      {item.story && (
        <p className="mt-4 text-sm leading-relaxed text-[#C9C9C9]">{item.story}</p>
      )}
    </div>
  );
};

export const Transformations: React.FC = () => {
  const { transformations, testimonials, openBooking } = useSiteContent();
  const visibleTransformations = transformations.filter((t) => t.visible);
  const visibleTestimonials = testimonials.filter((t) => t.visible);

  const categories = useMemo(() => {
    const cats = new Set(visibleTransformations.map((t) => t.category || 'All'));
    return ['All', ...Array.from(cats)];
  }, [visibleTransformations]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = visibleTransformations.filter(
    (t) => selectedCategory === 'All' || t.category === selectedCategory
  );

  return (
    <div className="pt-[76px] bg-[#050505]">
      <SEOHead
        title="Client Transformations & Results"
        description="Real people, real results at JS FITNESS INC Calgary NE. View client before-and-after transformations and success stories."
        path="/transformations"
      />

      <section className="py-20 lg:py-24 border-b border-white/[0.08]">
        <Reveal immediate direction="up" className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="eyebrow-row mb-4">CLIENT TRANSFORMATIONS</div>
          <h1 className="headline-display text-[52px] sm:text-[72px]">
            <SplitReveal text="REAL PEOPLE." mode="words" trigger className="block text-cream-metallic" />
            <span className="block">
              REAL <span className="text-[#B6F500] text-lime-glow">RESULTS.</span>
            </span>
          </h1>
          <p className="mt-4 max-w-[540px] text-base text-[#C9C9C9]">
            {visibleTransformations.length > 0
              ? 'Drag across any card below to compare before and after milestones built through training, nutrition, and accountability.'
              : 'Consented client before-and-after stories are published regularly by our Calgary NE coaching team.'}
          </p>
        </Reveal>
      </section>

      {visibleTransformations.length > 0 ? (
        <section className="relative py-20 lg:py-24">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <Reveal>
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2.5 mb-10">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#B6F500] text-[#050505]'
                        : 'border border-white/15 bg-white/[0.03] text-white/80 hover:border-[#B6F500]/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filtered.map((item, idx) => (
                  <Reveal key={item.id} delayMs={idx * 100}>
                    <InteractiveTransformationCard item={item} />
                  </Reveal>
                ))}
              </div>
            </Reveal>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 section-divider-glow" />
        </section>
      ) : (
        <section className="py-20 lg:py-24 text-center px-5">
          <Reveal>
            <div className="mx-auto max-w-xl card-unified-lime p-10">
              <h2 className="font-display italic font-black text-3xl uppercase text-white">
                CLIENT TRANSFORMATIONS COMING SOON
              </h2>
              <p className="mt-3 text-sm text-[#C9C9C9]">
                New consented member transformations are added directly by our coaching team. Ready to
                start your own transformation?
              </p>
              <div className="mt-6">
                <Button variant="primary" onClick={() => openBooking('tour')}>
                  BOOK YOUR FREE GYM TOUR
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Testimonials — hidden until admin adds entries */}
      {visibleTestimonials.length > 0 && (
        <section className="py-20 lg:py-24 border-t border-white/[0.08] bg-[#0B0B0C]/60">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <Reveal>
              <div className="eyebrow-row mb-4">MEMBER VOICES</div>
              <h2 className="headline-display text-4xl sm:text-5xl text-white mb-10">
                CLIENT <span className="text-[#B6F500]">TESTIMONIALS</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleTestimonials.map((t) => (
                  <div
                    key={t.id}
                    className="card-unified-lime card-hover-lift p-7 flex flex-col justify-between"
                  >
                    <div>
                      <Quote className="w-7 h-7 text-[#B6F500]/60 mb-4" strokeWidth={1.85} />
                      <p className="text-sm leading-relaxed text-white/90">&ldquo;{t.quote}&rdquo;</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">{t.name}</div>
                        <div className="text-xs text-[#8C8C8C]">{t.role}</div>
                      </div>
                      <div className="flex gap-0.5 text-[#B6F500]">
                        {Array.from({ length: t.rating }).map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <BookingCardsSection />
    </div>
  );
};
