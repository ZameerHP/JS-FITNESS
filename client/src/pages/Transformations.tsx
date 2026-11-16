import React, { useMemo, useState } from 'react';
import { MoveHorizontal, Quote, Star } from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';
import { TransformationItem } from '../lib/api';
import { SEOHead } from '../components/ui/SEOHead';
import { SplitReveal } from '../components/ui/SplitReveal';
import { Button } from '../components/ui/Button';
import { BookingCardsSection } from '../components/home/BookingCardsSection';

const InteractiveTransformationCard: React.FC<{ item: TransformationItem }> = ({ item }) => {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="rounded-[24px] glass-panel border-white/10 hover:border-[#B6F500]/45 p-5 transition-colors">
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

      {/* Interactive comparison */}
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/15 select-none cursor-ew-resize"
        data-cursor="drag"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = ((e.clientX - rect.left) / rect.width) * 100;
          setSliderPos(Math.max(5, Math.min(95, pct)));
        }}
        onTouchMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const touch = e.touches[0];
          if (!touch) return;
          const pct = ((touch.clientX - rect.left) / rect.width) * 100;
          setSliderPos(Math.max(5, Math.min(95, pct)));
        }}
      >
        <img
          src={item.afterImage}
          alt={`${item.name} after`}
          className="h-full w-full object-cover"
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
            <MoveHorizontal className="w-4 h-4" />
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
    <div className="pt-[72px] bg-[#050505]">
      <SEOHead
        title="Client Transformations & Results"
        description="Real people, real results at JS FITNESS INC Calgary NE. View client before-and-after transformations and success stories."
        path="/transformations"
      />

      <section className="py-20 lg:py-24 border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="eyebrow-row mb-4">CLIENT TRANSFORMATIONS</div>
          <h1 className="headline-display text-[52px] sm:text-[72px]">
            <SplitReveal text="REAL PEOPLE." mode="words" className="block text-cream-metallic" />
            <span className="block">
              REAL <span className="text-[#B6F500] text-lime-glow">RESULTS.</span>
            </span>
          </h1>
          <p className="mt-4 max-w-[520px] text-base text-[#C9C9C9]">
            Drag across any card below to compare before and after milestones built through
            training, nutrition, and accountability.
          </p>
        </div>
      </section>

      {visibleTransformations.length > 0 ? (
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
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
              {filtered.map((item) => (
                <InteractiveTransformationCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 text-center px-5">
          <div className="mx-auto max-w-xl rounded-[24px] glass-panel-lime p-10">
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
        </section>
      )}

      {/* Testimonials — hidden until admin adds entries */}
      {visibleTestimonials.length > 0 && (
        <section className="py-20 border-t border-white/[0.08] bg-[#0B0B0C]/60">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <div className="eyebrow-row mb-4">MEMBER VOICES</div>
            <h2 className="headline-display text-4xl sm:text-5xl text-white mb-10">
              CLIENT <span className="text-[#B6F500]">TESTIMONIALS</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-[24px] glass-panel-lime p-7 flex flex-col justify-between"
                >
                  <div>
                    <Quote className="w-7 h-7 text-[#B6F500]/60 mb-4" />
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
          </div>
        </section>
      )}

      <BookingCardsSection />
    </div>
  );
};
