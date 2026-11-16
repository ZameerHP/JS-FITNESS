import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  STRATEGY_ASSESSMENT_AGENDA,
  STRATEGY_CREDIT_CARDS,
  SYSTEM_PILLARS,
} from '../config/siteConfig';
import { useSiteContent } from '../context/ContentContext';
import { SEOHead } from '../components/ui/SEOHead';
import { SplitReveal } from '../components/ui/SplitReveal';
import { TiltCard } from '../components/ui/TiltCard';
import { CountUp } from '../components/ui/CountUp';
import { Button } from '../components/ui/Button';

const PillarMockUI: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'nutrition':
      return (
        <div className="rounded-2xl bg-[#08090A] border border-[#B6F500]/30 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#B6F500] uppercase tracking-wider">
            <span>Google Sheets • Macro Tracker</span>
            <span>On Target 96%</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {[
              { label: 'KCAL', val: '2,450' },
              { label: 'PROTEIN', val: '210g' },
              { label: 'CARBS', val: '255g' },
              { label: 'FATS', val: '65g' },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-white/[0.04] p-2.5 border border-white/10">
                <div className="text-[10px] text-[#8C8C8C]">{m.label}</div>
                <div className="font-bold text-white mt-0.5">{m.val}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'training':
      return (
        <div className="rounded-2xl bg-[#08090A] border border-[#B6F500]/30 p-5 space-y-2.5 text-xs">
          <div className="font-bold text-[#B6F500] uppercase tracking-wider">
            Training App • Upper Power Day
          </div>
          {[
            'Incline DB Press — 4 × 8–10 @ 95 lbs',
            'Chest-Supported Row — 4 × 10 @ 180 lbs',
            'Cable Lateral Raise — 3 × 15 (Video Demo Ready)',
          ].map((ex) => (
            <div
              key={ex}
              className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 border border-white/10 text-white"
            >
              <span>{ex}</span>
              <span className="text-[#B6F500] font-bold">PR +5%</span>
            </div>
          ))}
        </div>
      );
    case 'lifestyle':
      return (
        <div className="rounded-2xl bg-[#08090A] border border-[#B6F500]/30 p-5 grid grid-cols-3 gap-3 text-center">
          {[
            { k: 'Daily Steps', v: '10,420' },
            { k: 'Sleep Avg', v: '7h 48m' },
            { k: 'Hydration', v: '3.5 L' },
          ].map((item) => (
            <div key={item.k} className="rounded-xl bg-white/[0.04] p-3 border border-white/10">
              <div className="text-[10px] text-[#8C8C8C] uppercase">{item.k}</div>
              <div className="font-display italic font-black text-2xl text-[#B6F500] mt-1">
                {item.v}
              </div>
            </div>
          ))}
        </div>
      );
    case 'bodycomp':
      return (
        <div className="rounded-2xl bg-[#08090A] border border-[#B6F500]/30 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-[#B6F500]">12-Week Trend</div>
            <div className="text-2xl font-display italic font-black text-white mt-1">
              -14.2 lbs Body Fat • +4.1 lbs Lean Mass
            </div>
          </div>
          <TrendingUp className="w-8 h-8 text-[#B6F500]" />
        </div>
      );
    case 'checkins':
      return (
        <div className="rounded-2xl bg-[#08090A] border border-[#B6F500]/30 p-5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#B6F500] font-bold uppercase">
            <span>Sunday Check-In Review</span>
            <span>Coach Feedback Sent</span>
          </div>
          <p className="text-[#C9C9C9] leading-relaxed">
            &ldquo;Strength climbed on all primary compounds while waist dropped 0.5 inches.
            Keeping carbs +25g on leg days this week.&rdquo;
          </p>
        </div>
      );
    default:
      return (
        <div className="rounded-2xl bg-[#08090A] border border-[#B6F500]/30 p-5 flex flex-wrap gap-2 text-xs">
          {['High-Protein Grocery Guide', 'Dining Out Playbook', 'Warm-Up & Mobility Flow', 'Travel Workouts'].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#B6F500]/10 border border-[#B6F500]/35 px-3 py-1.5 text-white font-medium"
              >
                {tag}
              </span>
            )
          )}
        </div>
      );
  }
};

export const System: React.FC = () => {
  const { openBooking } = useSiteContent();
  const [activePillar, setActivePillar] = useState(0);

  return (
    <div className="pt-[72px] bg-[#050505]">
      <SEOHead
        title="JS FITNESS SYSTEM & Strategy Assessment ($99.99 CAD)"
        description="Complete transformation coaching system: Nutrition Google Sheets, Training App, Lifestyle Tracking, Body Composition, Weekly Check-ins, and the $99.99 CAD Strategy Assessment."
        path="/system"
      />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 lg:py-28 border-b border-white/[0.08]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[420px] w-[700px] rounded-full bg-[#B6F500]/10 blur-[150px]"
        />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="eyebrow-row mb-5">JS FITNESS SYSTEM</div>
          <h1 className="headline-display text-[52px] sm:text-[72px] lg:text-[84px]">
            <SplitReveal
              text="YOUR COMPLETE TRANSFORMATION"
              mode="words"
              className="block text-metallic"
            />
            <span className="block text-[#B6F500] text-lime-glow">SYSTEM</span>
          </h1>
          <p className="mt-5 max-w-[580px] text-base text-[#C9C9C9]">
            Personalized coaching engineered around six interconnected pillars—so your training,
            nutrition, lifestyle, and accountability move in complete lockstep.
          </p>
        </div>
      </section>

      {/* Interactive 6-Pillar Storytelling */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Pinned Preview */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="rounded-[28px] glass-panel-lime p-7 shadow-lime">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#B6F500]">
                  PILLAR {SYSTEM_PILLARS[activePillar].number}
                </div>
                <h2 className="mt-2 font-display italic font-black text-3xl uppercase text-white">
                  {SYSTEM_PILLARS[activePillar].title}
                </h2>
                <p className="mt-1 text-sm font-medium text-[#B6F500]/90">
                  {SYSTEM_PILLARS[activePillar].subtitle}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-[#C9C9C9]">
                  {SYSTEM_PILLARS[activePillar].description}
                </p>

                <div className="mt-6">
                  <PillarMockUI id={SYSTEM_PILLARS[activePillar].id} />
                </div>
              </div>
            </div>

            {/* Right Pillar Selector Stack */}
            <div className="lg:col-span-7 space-y-4">
              {SYSTEM_PILLARS.map((pillar, idx) => {
                const isSelected = activePillar === idx;
                return (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setActivePillar(idx)}
                    onMouseEnter={() => setActivePillar(idx)}
                    className={`w-full text-left rounded-[24px] p-6 border transition-all duration-300 ${
                      isSelected
                        ? 'glass-panel-lime translate-x-1 shadow-[0_0_25px_rgba(182,245,0,0.14)]'
                        : 'glass-panel border-white/10 hover:border-[#B6F500]/40'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`font-display italic font-black text-3xl ${
                          isSelected ? 'text-[#B6F500]' : 'text-white/30'
                        }`}
                      >
                        {pillar.number}
                      </span>
                      <div>
                        <h3 className="font-display italic font-extrabold text-2xl uppercase text-white">
                          {pillar.title}
                        </h3>
                        <p className="text-sm text-[#C9C9C9] mt-1">{pillar.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Semi-Private Training Mention */}
      <section className="py-12 border-y border-white/[0.08] bg-[#0B0B0C]">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="rounded-[24px] border border-[#B6F500]/40 bg-[#B6F500]/[0.06] p-7 sm:p-9 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#B6F500] text-[#050505]">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#B6F500]">
                  SEMI-PRIVATE COACHING
                </div>
                <h3 className="mt-1 font-display italic font-black text-2xl sm:text-3xl uppercase text-white">
                  MAXIMUM 4 PEOPLE PER SESSION
                </h3>
                <p className="mt-1 text-sm text-[#C9C9C9]">
                  High-focus coaching with small-group accountability. Registration closes
                  immediately when a time slot fills.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => openBooking('assessment')}>
              START WITH ASSESSMENT
            </Button>
          </div>
        </div>
      </section>

      {/* Strategy Assessment Deep-Dive ($99.99 CAD) */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <span className="inline-block rounded-full bg-[#B6F500] px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#050505] mb-4">
                PAID APPOINTMENT
              </span>
              <h2 className="headline-display text-4xl sm:text-5xl text-white">
                STRATEGY <span className="text-[#B6F500]">ASSESSMENT</span>
              </h2>
              <div className="mt-3 font-display italic font-black text-5xl text-[#B6F500] text-lime-glow">
                <CountUp end={99.99} decimals={2} prefix="$" suffix=" CAD" />
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                Non-refundable diagnostic &amp; custom transformation roadmap session
              </p>

              <div className="mt-6 space-y-3 text-sm text-[#C9C9C9]">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#B6F500]" />
                  <span>Duration: Approximately 1 to 2 hours</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#B6F500]" />
                  <span>In-person only at JS FITNESS INC (Calgary NE)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-[#B6F500]" />
                  <span>100% credited toward Coaching or Membership if you join</span>
                </div>
              </div>

              <div className="mt-8">
                <Button variant="primary" pulseRing onClick={() => openBooking('assessment')}>
                  BOOK YOUR STRATEGY ASSESSMENT — $99.99
                </Button>
              </div>
            </div>

            {/* 9-Point Agenda */}
            <div className="lg:col-span-7">
              <div className="rounded-[28px] glass-panel-lime p-7 sm:p-8">
                <h3 className="font-display italic font-extrabold text-2xl uppercase text-white mb-6">
                  9-POINT ASSESSMENT AGENDA
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {STRATEGY_ASSESSMENT_AGENDA.map((point, idx) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/10 p-3.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#B6F500] shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-white/90">
                        <strong className="text-[#B6F500] mr-1">0{idx + 1}.</strong>
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Three "How the Credit Works" Cards */}
          <div className="mt-16">
            <h3 className="font-display italic font-black text-3xl uppercase text-white mb-6 text-center">
              HOW YOUR <span className="text-[#B6F500]">$99.99 CREDIT</span> WORKS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {STRATEGY_CREDIT_CARDS.map((card) => (
                <TiltCard key={card.title} maxTilt={4} className="rounded-[24px]">
                  <div className="h-full rounded-[24px] glass-panel border-[#B6F500]/30 p-7">
                    <h4 className="font-display italic font-extrabold text-2xl uppercase text-[#B6F500] mb-2">
                      {card.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-[#C9C9C9]">{card.description}</p>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
