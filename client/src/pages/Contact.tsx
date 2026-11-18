import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Navigation,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';
import { submitContact } from '../lib/api';
import { SEOHead } from '../components/ui/SEOHead';
import { SplitReveal } from '../components/ui/SplitReveal';
import { Button } from '../components/ui/Button';
import { WhatsAppIcon } from '../components/ui/Icons';
import { Reveal } from '../components/ui/Reveal';
import { BookingCardsSection } from '../components/home/BookingCardsSection';

const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z.string().trim().optional().default(''),
  interest: z.enum(['Free gym tour', 'Strategy assessment', 'Other']),
  message: z.string().trim().min(5, 'Please include a short message'),
  website: z.string().optional().default(''),
});

type ContactFormData = z.infer<typeof contactFormSchema>;
const contactFormResolver = zodResolver(contactFormSchema);

export const Contact: React.FC = React.memo(() => {
  const { config } = useSiteContent();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  const params = new URLSearchParams(window.location.search);
  const preselected = params.get('interest');
  const defaultInterest: ContactFormData['interest'] =
    preselected === 'Strategy assessment'
      ? 'Strategy assessment'
      : preselected === 'Other'
      ? 'Other'
      : 'Free gym tour';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: contactFormResolver,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      interest: defaultInterest,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setServerError('');
    try {
      await submitContact({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        interest: data.interest,
        message: data.message,
        website: data.website || '',
      });
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unable to send message');
    }
  };

  const DEFAULT_ADDRESS = 'Unit 3135, 6520 36 Street NE, Calgary, AB, T3J 2L3';
  const fullAddress = config.contact.address || DEFAULT_ADDRESS;
  const directionsQuery = encodeURIComponent(fullAddress);
  const rawMapsQuery = (config.contact.mapsQuery || fullAddress).trim();
  const isDefaultLocation = rawMapsQuery.toLowerCase().includes('6520 36');
  const mapEmbedSrc = isDefaultLocation
    ? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2504.45!2d-113.9805442!3d51.1107855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5371647c15e141bb%3A0x6cbb6fe896c44529!2s6520%2036%20St%20NE%2C%20Calgary%2C%20AB%20T3J%204C8%2C%20Canada!5e0!3m2!1sen!2sca!4v1731700000000!5m2!1sen!2sca'
    : `https://www.google.com/maps?q=${encodeURIComponent(rawMapsQuery)}&t=m&z=16&ie=UTF8&iwloc=A&output=embed`;
  const whatsappUrl =
    (config.contact.whatsappUrl || '').trim() || 'https://wa.me/14037047021';

  return (
    <div className="pt-[76px] bg-[#050505]">
      <SEOHead
        title="Contact JS FITNESS INC Calgary NE"
        description="Visit JS FITNESS INC at Unit 3135, 6520 36 Street NE, Calgary, AB, T3J 2L3. Call 403-704-7021, message on WhatsApp, or book your free gym tour."
        path="/contact"
      />

      {/* Header */}
      <section className="py-20 lg:py-24 border-b border-white/[0.08]">
        <Reveal immediate direction="up" className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="eyebrow-row mb-4">GET IN TOUCH</div>
          <h1 className="headline-display text-[52px] sm:text-[72px]">
            <SplitReveal text="CONTACT" mode="words" trigger className="inline-block text-metallic mr-3" />
            <span className="text-[#B6F500] text-lime-glow">JS FITNESS INC</span>
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-[#C9C9C9]">
            Questions about 24/7 gym membership phases, personal training, or booking your Strategy
            Assessment? Send us a message or reach out directly on WhatsApp.
          </p>
        </Reveal>
      </section>

      {/* Main Grid: Form + Business Info & Map */}
      <section id="contact-form-section" className="relative py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Form */}
            <Reveal direction="left" className="lg:col-span-7">
                <div className="card-unified-lime p-7 sm:p-9">
                  {submitted ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#B6F500]/15 border border-[#B6F500] text-[#B6F500]">
                        <CheckCircle2 className="w-8 h-8" strokeWidth={1.85} />
                      </div>
                      <h2 className="font-display italic font-black text-3xl uppercase text-white">
                        MESSAGE RECEIVED
                      </h2>
                      <p className="mt-2 text-sm text-[#C9C9C9] max-w-md mx-auto">
                        Thank you for reaching out to JS FITNESS INC. Jatinder will review your
                        inquiry and reply shortly.
                      </p>
                      <div className="mt-6">
                        <Button variant="outline" onClick={() => setSubmitted(false)}>
                          SEND ANOTHER MESSAGE
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                      {/* Honeypot field hidden from real users */}
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="hidden"
                        {...register('website')}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            placeholder="Your name"
                            {...register('name')}
                            className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#B6F500] focus:outline-none"
                          />
                          {errors.name && (
                            <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            {...register('email')}
                            className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#B6F500] focus:outline-none"
                          />
                          {errors.email && (
                            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            placeholder="403-555-0199"
                            {...register('phone')}
                            className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#B6F500] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                            I am interested in *
                          </label>
                          <select
                            {...register('interest')}
                            className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-3 text-sm text-white focus:border-[#B6F500] focus:outline-none"
                          >
                            <option value="Free gym tour">Free gym tour</option>
                            <option value="Strategy assessment">
                              Strategy assessment ($99.99 CAD)
                            </option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white/80 mb-2">
                          Message *
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Tell us about your fitness goals or preferred days/times..."
                          {...register('message')}
                          className="w-full rounded-xl border border-white/15 bg-[#0B0B0C] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#B6F500] focus:outline-none"
                        />
                        {errors.message && (
                          <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>
                        )}
                      </div>

                      {serverError && (
                        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
                          {serverError}
                        </div>
                      )}

                      <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                      </Button>
                    </form>
                  )}
                </div>
              </Reveal>

              {/* Direct Info + WhatsApp + Google Maps */}
              <Reveal direction="right" delayMs={110} className="lg:col-span-5 space-y-6">
                <div className="card-unified card-hover-lift p-7 space-y-5">
                  <h2 className="font-display italic font-extrabold text-2xl uppercase text-white">
                    CALGARY NE FACILITY
                  </h2>

                  <div className="space-y-4 text-sm text-[#C9C9C9]">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#B6F500] shrink-0 mt-0.5" strokeWidth={1.85} />
                      <span>{fullAddress}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#B6F500] shrink-0" strokeWidth={1.85} />
                      <a
                        href={`tel:${config.contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="hover:text-[#B6F500] transition-colors"
                      >
                        {config.contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#B6F500] shrink-0" strokeWidth={1.85} />
                      <a href={`mailto:${config.contact.email}`} className="hover:text-[#B6F500] transition-colors">
                        {config.contact.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#B6F500] shrink-0 mt-0.5" strokeWidth={1.85} />
                      <div>
                        <div className="text-white font-semibold">{config.hours.gymAccess}</div>
                        <div>{config.hours.personalTraining}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      href={whatsappUrl}
                      icon={<WhatsAppIcon className="w-4 h-4" />}
                    >
                      WHATSAPP JATINDER
                    </Button>
                    <Button
                      variant="outline"
                      href={`https://www.google.com/maps/dir/?api=1&destination=${directionsQuery}`}
                      icon={<Navigation className="w-4 h-4" strokeWidth={1.85} />}
                    >
                      GET DIRECTIONS
                    </Button>
                  </div>
                </div>

                {/* Live Embedded Google Map for Unit 3135, 6520 36 Street NE, Calgary, AB, T3J 2L3 */}
                <div className="relative isolate overflow-hidden rounded-[24px] card-unified border-[#B6F500]/35 bg-[#0B0B0C]">
                  <div className="h-72 w-full relative overflow-hidden rounded-t-[24px]">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#0B0B0C] text-center px-6"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 50% 45%, rgba(182, 245, 0, 0.12) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '100% 100%, 28px 28px, 28px 28px',
                      }}
                    >
                      <MapPin className="w-7 h-7 text-[#B6F500] mb-2" strokeWidth={1.85} />
                      <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                        JS FITNESS INC • Calgary NE
                      </span>
                      <span className="text-[11px] text-[#8C8C8C] mt-1">{fullAddress}</span>
                    </div>
                    <iframe
                      title="JS FITNESS INC Location Map — Unit 3135, 6520 36 Street NE, Calgary"
                      src={mapEmbedSrc}
                      className="relative z-10 h-full w-full border-0 block"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-[#0B0B0C] px-4 py-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0 text-white/90">
                      <MapPin className="w-4 h-4 text-[#B6F500] shrink-0" strokeWidth={1.85} />
                      <span className="truncate">{fullAddress}</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${directionsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] text-[#B6F500] hover:underline shrink-0"
                    >
                      Open Map <ExternalLink className="w-3 h-3" strokeWidth={1.85} />
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 section-divider-glow" />
      </section>

      <BookingCardsSection />
    </div>
  );
});
