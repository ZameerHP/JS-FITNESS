import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Navigation,
  Clock,
} from 'lucide-react';
import { useSiteContent } from '../context/ContentContext';
import { submitContact } from '../lib/api';
import { SEOHead } from '../components/ui/SEOHead';
import { SplitReveal } from '../components/ui/SplitReveal';
import { Button } from '../components/ui/Button';
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el || mapLoaded || navigator.webdriver) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setMapLoaded(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mapLoaded]);

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

  const mapQuery = encodeURIComponent(config.contact.address);

  return (
    <div className="pt-[72px] bg-[#050505]">
      <SEOHead
        title="Contact JS FITNESS INC Calgary NE"
        description="Visit JS FITNESS INC at Unit 3135, 6520 36 Street NE, Calgary, AB, T3J 2L3. Call 403-704-7021, message on WhatsApp, or book your free gym tour."
        path="/contact"
      />

      {/* Header */}
      <section className="py-16 lg:py-24 border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="eyebrow-row mb-4">GET IN TOUCH</div>
          <h1 className="headline-display text-[52px] sm:text-[72px]">
            <SplitReveal text="CONTACT" mode="chars" className="inline-block text-metallic mr-3" />
            <span className="text-[#B6F500] text-lime-glow">JS FITNESS INC</span>
          </h1>
          <p className="mt-4 max-w-[560px] text-base text-[#C9C9C9]">
            Questions about 24/7 gym membership phases, personal training, or booking your Strategy
            Assessment? Send us a message or reach out directly on WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Grid: Form + Business Info & Map */}
      <section id="contact-form-section" className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form */}
            <div className="lg:col-span-7">
              <div className="rounded-[28px] glass-panel-lime p-7 sm:p-9">
                {submitted ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#B6F500]/15 border border-[#B6F500] text-[#B6F500]">
                      <CheckCircle2 className="w-8 h-8" />
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
            </div>

            {/* Direct Info + WhatsApp + Google Maps */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-[28px] glass-panel border-white/10 p-7 space-y-5">
                <h2 className="font-display italic font-extrabold text-2xl uppercase text-white">
                  CALGARY NE FACILITY
                </h2>

                <div className="space-y-4 text-sm text-[#C9C9C9]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#B6F500] shrink-0 mt-0.5" />
                    <span>{config.contact.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-[#B6F500] shrink-0" />
                    <a
                      href={`tel:${config.contact.phone.replace(/[^0-9+]/g, '')}`}
                      className="hover:text-[#B6F500]"
                    >
                      {config.contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-[#B6F500] shrink-0" />
                    <a href={`mailto:${config.contact.email}`} className="hover:text-[#B6F500]">
                      {config.contact.email}
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#B6F500] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">{config.hours.gymAccess}</div>
                      <div>{config.hours.personalTraining}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    href={config.contact.whatsappUrl}
                    icon={<MessageCircle className="w-4 h-4" />}
                  >
                    WHATSAPP JATINDER
                  </Button>
                  <Button
                    variant="outline"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                    icon={<Navigation className="w-4 h-4" />}
                  >
                    GET DIRECTIONS
                  </Button>
                </div>
              </div>

              {/* Google Map Facade (loads iframe on demand or within 1 viewport) */}
              <div
                ref={mapContainerRef}
                className="relative overflow-hidden rounded-[24px] border border-[#B6F500]/30 bg-[#0B0B0C] h-64"
              >
                {mapLoaded ? (
                  <iframe
                    title="JS FITNESS INC Location Map"
                    src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="h-full w-full grayscale invert contrast-125 opacity-85"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0B0B0C] to-[#121610]">
                    <MapPin className="w-8 h-8 text-[#B6F500] mb-2" />
                    <div className="text-sm font-bold text-white">{config.contact.address}</div>
                    <button
                      type="button"
                      onClick={() => setMapLoaded(true)}
                      className="mt-4 rounded-full border border-[#B6F500] px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-[#B6F500] hover:bg-[#B6F500] hover:text-black transition-colors"
                    >
                      Load Interactive Map
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingCardsSection />
    </div>
  );
});
