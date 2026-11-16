import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Crown,
  Dumbbell,
  Play,
  Star,
  BarChart3,
} from 'lucide-react';
import {
  EQUIPMENT_LIST,
  MEMBERSHIP_BENEFITS,
  MEMBERSHIP_FAQS,
} from '../config/siteConfig';
import { useSiteContent } from '../context/ContentContext';
import { SEOHead } from '../components/ui/SEOHead';
import { SplitReveal } from '../components/ui/SplitReveal';
import { TiltCard } from '../components/ui/TiltCard';
import { Button } from '../components/ui/Button';
import { ImageSlot } from '../components/ui/ImageSlot';

export const Membership: React.FC = () => {
  const { config, gallery, videos, openBooking, setVideoModalOpen } = useSiteContent();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const visibleGallery = gallery.filter((g) => g.visible);
  const visibleVideos = videos.filter((v) => v.visible);

  return (
    <div className="pt-[72px] bg-[#050505]">
      <SEOHead
        title="24/7 Gym Membership Calgary NE"
        description="Unlimited 24/7 access, fitness app with video demos, workout logging, progressive overload tracking, and a supportive Calgary NE community. Book your free gym tour."
        path="/membership"
      />

      {/* 24/7 Hero */}
      <section className="relative overflow-hidden py-24 lg:py-32 border-b border-white/[0.08]">
        <div className="pointer-events-none absolute inset-0">
          <img
            src="/images/gym-interior.webp"
            alt="JS FITNESS INC 24/7 gym floor"
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-[#050505]/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="eyebrow-row mb-5">GYM MEMBERSHIP</div>
          <h1 className="headline-display text-[58px] sm:text-[82px] lg:text-[98px] leading-[0.88]">
            <span className="block text-[#B6F500] text-lime-glow">24/7</span>
            <SplitReveal text="GYM ACCESS" mode="words" className="block text-metallic" />
          </h1>
          <p className="mt-6 max-w-[540px] text-base text-[#C9C9C9]">
            Get unlimited access to our state-of-the-art Calgary NE facility, powered by a fitness
            app, expert resources, and a supportive community. Book your free in-person gym tour to
            explore the floor and lock in your spot.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button variant="primary" pulseRing onClick={() => openBooking('tour')}>
              BOOK YOUR FREE GYM TOUR
            </Button>
            {visibleVideos.length > 0 && (
              <Button
                variant="white-outline"
                showArrow={false}
                onClick={() => setVideoModalOpen(true)}
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                WATCH GYM WALKTHROUGH
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 7 Core Benefits */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="eyebrow-row mb-4">INCLUDED WITH MEMBERSHIP</div>
          <h2 className="headline-display text-4xl sm:text-5xl mb-12">
            <span className="text-metallic">EVERYTHING YOU NEED TO</span>{' '}
            <span className="text-[#B6F500]">PROGRESS</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MEMBERSHIP_BENEFITS.map((item) => (
              <TiltCard key={item.title} maxTilt={4} className="rounded-[24px]">
                <div className="h-full rounded-[24px] glass-panel border-white/10 hover:border-[#B6F500]/45 p-7 transition-colors">
                  <CheckCircle2 className="w-6 h-6 text-[#B6F500] mb-4" />
                  <h3 className="font-display italic font-extrabold text-xl uppercase text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#C9C9C9]">{item.description}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Equipment Icon Grid */}
      <section className="py-20 bg-[#0B0B0C]/70 border-y border-white/[0.08]">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="eyebrow-row mb-4">THE FLOOR</div>
          <h2 className="headline-display text-4xl sm:text-5xl text-white mb-10">
            PREMIUM <span className="text-[#B6F500]">EQUIPMENT LINEUP</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {EQUIPMENT_LIST.map((eq) => (
              <div
                key={eq.name}
                className="group rounded-2xl glass-panel border-white/10 hover:border-[#B6F500]/55 p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#B6F500]/10 border border-[#B6F500]/30 text-[#B6F500] group-hover:bg-[#B6F500] group-hover:text-black transition-colors">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-white">{eq.name}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#8C8C8C]">
                  {eq.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pricing Phases Stepper — NO gym membership prices displayed */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="eyebrow-row mb-4">ENROLLMENT PHASES</div>
              <h2 className="headline-display text-4xl sm:text-5xl">
                <span className="text-metallic">THREE</span>{' '}
                <span className="text-[#B6F500]">MEMBERSHIP PHASES</span>
              </h2>
            </div>
            <p className="text-sm text-[#C9C9C9] max-w-[380px]">
              Membership spots open in structured phases to preserve floor space. Membership rates
              are shared exclusively in person during your free gym tour.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {config.pricingPhases.map((phase) => {
              const isActive = phase.status === 'Active';
              const isSoldOut = phase.status === 'Sold out';
              return (
                <div
                  key={phase.tier}
                  className={`relative rounded-[24px] p-7 border transition-all ${
                    isActive
                      ? 'glass-panel-lime shadow-[0_0_32px_rgba(182,245,0,0.16)]'
                      : 'glass-panel border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B6F500]/15 border border-[#B6F500]/40 text-[#B6F500]">
                      {phase.icon === 'star' ? (
                        <Star className="w-5 h-5" />
                      ) : phase.icon === 'bars' ? (
                        <BarChart3 className="w-5 h-5" />
                      ) : (
                        <Crown className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
                        isActive
                          ? 'bg-[#B6F500] text-[#050505]'
                          : isSoldOut
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-white/10 text-[#C9C9C9]'
                      }`}
                    >
                      {isSoldOut ? 'FILLED' : phase.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#B6F500]">
                    {phase.tier}
                  </div>
                  <h3
                    className={`mt-1 font-display italic font-black text-2xl uppercase ${
                      isSoldOut ? 'line-through text-white/40' : 'text-white'
                    }`}
                  >
                    {phase.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#C9C9C9]">{phase.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery — hidden until admin adds items */}
      {visibleGallery.length > 0 && (
        <section className="py-20 border-t border-white/[0.08]">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <div className="eyebrow-row mb-4">FACILITY GALLERY</div>
            <h2 className="headline-display text-4xl sm:text-5xl text-white mb-10">
              INSIDE <span className="text-[#B6F500]">JS FITNESS INC</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleGallery.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-[24px] border border-white/10 aspect-[4/3]"
                >
                  <ImageSlot src={img.imageUrl} alt={img.title} className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Accordion */}
      <section className="py-20 border-t border-white/[0.08] bg-[#0B0B0C]/60">
        <div className="mx-auto max-w-[900px] px-5 lg:px-8">
          <div className="text-center mb-12">
            <div className="eyebrow-row justify-center mb-4">COMMON QUESTIONS</div>
            <h2 className="headline-display text-4xl sm:text-5xl">
              <span className="text-metallic">MEMBERSHIP</span>{' '}
              <span className="text-[#B6F500]">FAQ</span>
            </h2>
          </div>

          <div className="space-y-3">
            {MEMBERSHIP_FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl glass-panel border-white/10 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left font-bold text-white hover:text-[#B6F500] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#B6F500] shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm leading-relaxed text-[#C9C9C9]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <Button variant="primary" pulseRing onClick={() => openBooking('tour')}>
              BOOK YOUR FREE GYM TOUR
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
