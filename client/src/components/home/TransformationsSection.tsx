import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import { HOME_COPY } from '../../config/siteConfig';
import { useSiteContent } from '../../context/ContentContext';
import { TransformationItem } from '../../lib/api';
import { Button } from '../ui/Button';
import { SplitReveal } from '../ui/SplitReveal';
import { ImageSlot } from '../ui/ImageSlot';

const TransformationPairCard: React.FC<{ item: TransformationItem }> = React.memo(({ item }) => {
  const [compareMode, setCompareMode] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div
      onMouseEnter={() => setCompareMode(false)}
      className="group relative rounded-2xl bg-[#0B0B0C]/80 border border-white/10 p-2.5 transition-colors duration-300 hover:border-[#B6F500]/45"
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-[11px] font-bold text-white">{item.name}</span>
          {item.isDemo && (
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#B6F500]">
              DEMO
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCompareMode((p) => !p)}
          title="Toggle interactive Before/After wipe slider"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/75 hover:border-[#B6F500] hover:text-[#B6F500]"
        >
          <MoveHorizontal className="w-2.5 h-2.5" />
          {compareMode ? 'Split' : 'Wipe'}
        </button>
      </div>

      {!compareMode ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10">
            <ImageSlot
              src={item.beforeImage}
              alt={`${item.name} before transformation`}
              className="h-full w-full"
            />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/80 border border-white/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/90">
              BEFORE
            </span>
          </div>

          <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-[#B6F500]/45 shadow-[0_0_18px_rgba(182,245,0,0.14)]">
            <ImageSlot
              src={item.afterImage}
              alt={`${item.name} after transformation`}
              className="h-full w-full"
            />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/80 border border-[#B6F500]/60 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#B6F500]">
              AFTER
            </span>
          </div>
        </div>
      ) : (
        <div
          className="relative aspect-[3/2] overflow-hidden rounded-xl border border-[#B6F500]/45 select-none"
          style={{ touchAction: 'pan-y' }}
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setSliderPos(Math.max(5, Math.min(95, pct)));
          }}
        >
          <img
            src={item.afterImage}
            alt="After transformation"
            loading="lazy"
            decoding="async"
            width={600}
            height={800}
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={item.beforeImage}
              alt="Before transformation"
              loading="lazy"
              decoding="async"
              width={600}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
          <div
            style={{ left: `${sliderPos}%` }}
            className="absolute inset-y-0 w-[2px] bg-[#B6F500] shadow-[0_0_12px_#B6F500]"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#B6F500] text-black shadow-lg">
              <MoveHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export const TransformationsSection: React.FC = React.memo(() => {
  const { transformations } = useSiteContent();
  const visibleItems = transformations.filter((t) => t.visible);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const pageCount = Math.max(1, Math.ceil(visibleItems.length / 2));

  useEffect(() => {
    if (visibleItems.length <= 2 || paused) return;
    const timer = setInterval(() => {
      if (!document.hidden) {
        setIndex((prev) => (prev + 1) % pageCount);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [visibleItems.length, pageCount, paused]);

  if (visibleItems.length === 0) return null;

  const currentPairs = [
    visibleItems[(index * 2) % visibleItems.length],
    visibleItems.length > 1 ? visibleItems[(index * 2 + 1) % visibleItems.length] : null,
  ].filter(Boolean) as TransformationItem[];

  const handleNext = () => setIndex((prev) => (prev + 1) % pageCount);
  const handlePrev = () => setIndex((prev) => (prev - 1 + pageCount) % pageCount);

  return (
    <section className="cv-section relative overflow-hidden bg-[#050505] py-24 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
          <div className="lg:col-span-5">
            <div className="eyebrow-row mb-5">{HOME_COPY.transformations.eyebrow}</div>

            <h2 className="headline-display text-[44px] sm:text-[54px] lg:text-[60px] leading-[0.94]">
              <SplitReveal
                text={HOME_COPY.transformations.titleLine1}
                mode="words"
                className="block text-cream-metallic"
              />
              <span className="block mt-1">
                <span className="text-metallic mr-3">
                  {HOME_COPY.transformations.titleWhite}
                </span>
                <span className="text-lime-glow">
                  {HOME_COPY.transformations.titleAccent}
                </span>
              </span>
            </h2>

            <p className="mt-5 max-w-[360px] text-[15px] text-[#C9C9C9]">
              {HOME_COPY.transformations.description}
            </p>

            <div className="mt-8">
              <Button variant="outline" to="/transformations">
                {HOME_COPY.transformations.cta}
              </Button>
            </div>
          </div>

          <div
            className="lg:col-span-7 relative"
            style={{ touchAction: 'pan-y' }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            data-cursor="drag"
          >
            <div className="relative rounded-[24px] glass-panel border-white/10 p-4 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.8)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentPairs.map((pair) => (
                  <TransformationPairCard key={pair.id} item={pair} />
                ))}
              </div>

              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous client transformations"
                className="absolute -left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-[#B6F500]/50 bg-[#0B0B0C]/95 text-[#B6F500] hover:bg-[#B6F500] hover:text-black transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next client transformations"
                className="absolute -right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-[#B6F500]/50 bg-[#0B0B0C]/95 text-[#B6F500] hover:bg-[#B6F500] hover:text-black transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1">
              {Array.from({ length: Math.max(3, pageCount) }).map((_, i) => {
                const isActive = i === index % Math.max(3, pageCount);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i % pageCount)}
                    aria-label={`View transformation slide ${i + 1}`}
                    className="inline-flex h-6 min-w-6 px-1 items-center justify-center rounded-full"
                  >
                    <span
                      className={`block h-2 rounded-full transition-[width,background-color] duration-300 ${
                        isActive
                          ? 'w-7 bg-[#B6F500] shadow-[0_0_10px_#B6F500]'
                          : 'w-2 bg-white/25 hover:bg-white/50'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
