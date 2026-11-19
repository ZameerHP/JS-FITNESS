import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { COACHING_PHILOSOPHY, HOME_COPY } from '../config/siteConfig';
import { useSiteContent } from '../context/ContentContext';
import { SEOHead } from '../components/ui/SEOHead';
import { SplitReveal } from '../components/ui/SplitReveal';
import { TiltCard } from '../components/ui/TiltCard';
import { Button } from '../components/ui/Button';
import { Reveal } from '../components/ui/Reveal';
import { BookingCardsSection } from '../components/home/BookingCardsSection';

export const About: React.FC = () => {
  const { certifications, openBooking } = useSiteContent();
  const visibleCerts = certifications.filter((c) => c.visible);

  return (
    <div className="pt-[76px] bg-[#050505]">
      <SEOHead
        title="About Jatinder Singh & Coaching Philosophy"
        description="Meet Jatinder Singh, Certified Personal Trainer and Founder of JS FITNESS INC in Calgary NE. Discover our mission and six coaching philosophy pillars."
        path="/about"
      />

      {/* Founder Hero */}
      <section className="relative overflow-hidden py-20 lg:py-24 border-b border-white/[0.08]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-[#B6F500]/10 blur-[140px]"
        />
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12">
            <Reveal immediate direction="left" className="lg:col-span-6">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="eyebrow-row">ABOUT JS FITNESS INC</div>
                <span className="badge-shimmer relative overflow-hidden inline-flex items-center gap-1.5 rounded-full border border-[#B6F500]/40 bg-[#B6F500]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#B6F500]">
                  <Award className="w-3 h-3" strokeWidth={1.85} />
                  {HOME_COPY.founder.credentialBadge}
                </span>
              </div>
              <h1 className="headline-display text-[52px] sm:text-[68px] lg:text-[78px]">
                <SplitReveal text="JATINDER SINGH" mode="words" trigger className="block text-metallic" />
                <span className="block text-[#B6F500] text-[34px] sm:text-[44px] mt-1">
                  FOUNDER &amp; HEAD COACH
                </span>
              </h1>
              <p className="mt-6 text-[16px] leading-relaxed text-[#C9C9C9] max-w-[520px]">
                {HOME_COPY.founder.mission} JS FITNESS INC was built in Calgary NE to replace
                crowded, impersonal box gyms with a disciplined, 24/7 facility where coaching,
                accountability, and community drive permanent change.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3 max-w-[480px]">
                {HOME_COPY.founder.trustStats.map((stat, idx) => (
                  <Reveal key={stat.label} immediate delayMs={160 + idx * 80} direction="up">
                    <div className="card-unified card-hover-lift p-3.5 text-left">
                      <div className="font-display italic font-black text-xl text-[#B6F500]">
                        {stat.value}
                      </div>
                      <div className="text-[11px] uppercase tracking-wider text-[#8C8C8C] mt-0.5">
                        {stat.label}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button variant="primary" onClick={() => openBooking('tour')}>
                  BOOK YOUR FREE GYM TOUR
                </Button>
                <Button variant="outline" onClick={() => openBooking('assessment')}>
                  STRATEGY ASSESSMENT — $99.99 CAD
                </Button>
              </div>
            </Reveal>

            <Reveal immediate direction="right" delayMs={140} className="lg:col-span-6">
              <div className="relative mx-auto max-w-[460px] overflow-hidden rounded-[24px] card-unified-lime card-hover-lift">
                <img
                  src="/images/facility-neon-logo.webp"
                  alt="JS FITNESS INC Calgary NE neon wall crest"
                  className="w-full h-[460px] sm:h-[480px] object-cover object-center"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6">
                  <div className="font-script text-4xl text-[#B6F500]">Stronger Together</div>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/80">
                    Certified Personal Trainer • Calgary, AB
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Story & Mission */}
      <section className="relative py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <Reveal>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5">
                <div className="eyebrow-row mb-4">THE STORY</div>
                <h2 className="headline-display text-4xl sm:text-5xl text-metallic">
                  BUILT ON DISCIPLINE. DRIVEN BY RESULTS.
                </h2>
              </div>
              <div className="lg:col-span-7 space-y-5 text-[#C9C9C9] text-[15px] leading-relaxed">
                <p>
                  Too many gym memberships hand you a keycard and leave you guessing—no programming,
                  no nutritional structure, and nobody holding you to the standard you promised
                  yourself.
                </p>
                <p>
                  Jatinder Singh founded JS FITNESS INC around a clear standard: <strong className="text-white">MORE THAN JUST A GYM MEMBERSHIP.</strong> Every detail—from equipment selection and 24/7 floor access to Google Sheets nutrition calibration, weekly check-ins, and our WhatsApp fitness community—exists to help members build real strength, real discipline, and lasting health.
                </p>
                <div className="card-unified-lime card-hover-lift p-6 mt-4">
                  <div className="flex items-center gap-3 text-[#B6F500] font-bold text-xs uppercase tracking-[0.2em] mb-2">
                    <ShieldCheck className="w-4 h-4" strokeWidth={1.85} /> OUR MISSION
                  </div>
                  <p className="text-white text-lg font-medium italic">
                    &ldquo;My mission is to help you become the strongest, healthiest version of yourself.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 section-divider-glow" />
      </section>

      {/* Certifications Grid — hidden until admin adds certifications */}
      {visibleCerts.length > 0 && (
        <section className="py-20 lg:py-24 bg-[#0B0B0C]/60 border-b border-white/[0.08]">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <Reveal>
              <div className="eyebrow-row mb-4">CREDENTIALS</div>
              <h2 className="headline-display text-4xl sm:text-5xl text-white mb-10">
                CERTIFICATIONS &amp; <span className="text-[#B6F500]">QUALIFICATIONS</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCerts.map((cert) => (
                  <div
                    key={cert.id}
                    className="card-unified-lime card-hover-lift p-6 flex items-start gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B6F500]/15 border border-[#B6F500]/40 text-[#B6F500]">
                      <Award className="w-5 h-5" strokeWidth={1.85} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{cert.title}</h3>
                      <p className="text-sm text-[#C9C9C9] mt-1">{cert.issuer}</p>
                      {cert.year && (
                        <span className="inline-block mt-2 text-xs font-semibold text-[#B6F500]">
                          {cert.year}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Coaching Philosophy: 6 Animated Cards */}
      <section className="relative py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <Reveal>
            <div className="eyebrow-row mb-4">COACHING PHILOSOPHY</div>
            <h2 className="headline-display text-4xl sm:text-5xl mb-12">
              <span className="text-metallic">SIX PILLARS OF</span>{' '}
              <span className="text-[#B6F500]">TRANSFORMATION</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {COACHING_PHILOSOPHY.map((item, idx) => (
                <Reveal key={item.title} delayMs={idx * 70} className="h-full">
                  <TiltCard maxTilt={5} className="h-full rounded-[24px]">
                    <div className="h-full card-unified card-hover-lift p-7">
                      <div className="font-display italic font-black text-3xl text-[#B6F500]/40 mb-3">
                        0{idx + 1}
                      </div>
                      <h3 className="font-display italic font-extrabold text-2xl uppercase text-white mb-2.5">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#C9C9C9]">{item.description}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <BookingCardsSection />
    </div>
  );
};
