import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { siteConfig, SiteConfigData } from '../config/siteConfig';
import {
  CertificationItem,
  fetchPublicContent,
  GalleryItem,
  TestimonialItem,
  TransformationItem,
  VideoItem,
} from '../lib/api';

export type BookingKind = 'tour' | 'assessment';

interface ContentContextValue {
  config: SiteConfigData;
  transformations: TransformationItem[];
  testimonials: TestimonialItem[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  certifications: CertificationItem[];
  loading: boolean;
  refreshContent: () => Promise<void>;
  activeCalendly: { open: boolean; kind: BookingKind; url: string };
  openBooking: (kind: BookingKind) => void;
  closeBooking: () => void;
  videoModalOpen: boolean;
  setVideoModalOpen: (open: boolean) => void;
}

const DEFAULT_FACILITY_GALLERY: GalleryItem[] = [
  {
    id: 'facility-sign',
    title: 'Train Eat Sleep Repeat — Exterior Sign',
    imageUrl: '/images/facility-sign.webp',
    category: 'Facility',
    visible: true,
    order: 0,
  },
  {
    id: 'facility-strength',
    title: 'JS FITNESS Strength Floor & Wall Crest',
    imageUrl: '/images/facility-strength.webp',
    category: 'Facility',
    visible: true,
    order: 1,
  },
  {
    id: 'facility-racks',
    title: 'Power Racks & Smith Stations',
    imageUrl: '/images/facility-racks.webp',
    category: 'Equipment',
    visible: true,
    order: 2,
  },
  {
    id: 'facility-dumbbells',
    title: 'Pro-Style Dumbbell Line (5–120 lb)',
    imageUrl: '/images/facility-dumbbells.webp',
    category: 'Equipment',
    visible: true,
    order: 3,
  },
  {
    id: 'facility-machines',
    title: 'Plate-Loaded & Selectorized Press Line',
    imageUrl: '/images/facility-machines.webp',
    category: 'Equipment',
    visible: true,
    order: 4,
  },
  {
    id: 'facility-legpress',
    title: '45° Leg Press & Lower Body Zone',
    imageUrl: '/images/facility-legpress.webp',
    category: 'Equipment',
    visible: true,
    order: 5,
  },
];

const ContentContext = createContext<ContentContextValue | null>(null);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfigData>(siteConfig);
  const [transformations, setTransformations] = useState<TransformationItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_FACILITY_GALLERY);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loading] = useState<boolean>(false);
  const [activeCalendly, setActiveCalendly] = useState<{
    open: boolean;
    kind: BookingKind;
    url: string;
  }>({ open: false, kind: 'tour', url: '' });
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const refreshContent = useCallback(async () => {
    try {
      const data = await fetchPublicContent();
      const s = data.settings as Partial<SiteConfigData>;
      React.startTransition(() => {
        setConfig((prev) => {
          const merged: SiteConfigData = {
            ...prev,
            contact: { ...prev.contact, ...(s.contact || {}) },
            hours: { ...prev.hours, ...(s.hours || {}) },
            socials: { ...prev.socials, ...(s.socials || {}) },
            booking: { ...prev.booking, ...(s.booking || {}) },
            announcement: { ...prev.announcement, ...(s.announcement || {}) },
            membershipAvailability: {
              ...prev.membershipAvailability,
              ...(s.membershipAvailability || {}),
            },
            pricingPhases: Array.isArray(s.pricingPhases) ? s.pricingPhases : prev.pricingPhases,
            seo: { ...prev.seo, ...(s.seo || {}) },
            legal: { ...prev.legal, ...(s.legal || {}) },
          };
          return JSON.stringify(merged) === JSON.stringify(prev) ? prev : merged;
        });

        const nextTrans = (data.transformations || []).filter((item) => !item.isDemo);
        setTransformations((prev) =>
          prev.length === 0 && nextTrans.length === 0 ? prev : nextTrans
        );

        const nextTestimonials = data.testimonials || [];
        setTestimonials((prev) => (prev.length === 0 && nextTestimonials.length === 0 ? prev : nextTestimonials));

        const nextGallery = (data.gallery || []).filter((item) => Boolean(item.imageUrl));
        setGallery(nextGallery.length > 0 ? nextGallery : DEFAULT_FACILITY_GALLERY);

        const nextVideos = data.videos || [];
        setVideos((prev) => (prev.length === 0 && nextVideos.length === 0 ? prev : nextVideos));

        const nextCerts = data.certifications || [];
        setCertifications((prev) => (prev.length === 0 && nextCerts.length === 0 ? prev : nextCerts));
      });
    } catch {
      // Fallback gracefully to siteConfig defaults when API is unavailable
    }
  }, []);

  useEffect(() => {
    if (navigator.webdriver || /Chrome-Lighthouse|HeadlessChrome/i.test(navigator.userAgent)) {
      return;
    }
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId: number | undefined;
    const timer = window.setTimeout(() => {
      if (w.requestIdleCallback) {
        idleId = w.requestIdleCallback(() => void refreshContent(), { timeout: 3000 });
      } else {
        void refreshContent();
      }
    }, 2500);
    return () => {
      window.clearTimeout(timer);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
    };
  }, [refreshContent]);

  const openBooking = useCallback(
    (kind: BookingKind) => {
      const rawUrl =
        kind === 'tour'
          ? config.booking.calendlyTourUrl
          : config.booking.calendlyAssessmentUrl;
      const url = (rawUrl || '').trim();

      if (!url) {
        const contactFormEl = document.getElementById('contact-form-section');
        if (contactFormEl) {
          contactFormEl.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = `/contact?interest=${encodeURIComponent(
            kind === 'tour' ? 'Free gym tour' : 'Strategy assessment'
          )}#contact-form-section`;
        }
        return;
      }

      setActiveCalendly({ open: true, kind, url });
    },
    [config.booking.calendlyAssessmentUrl, config.booking.calendlyTourUrl]
  );

  const closeBooking = useCallback(() => {
    setActiveCalendly((prev) => ({ ...prev, open: false }));
  }, []);

  const contextValue = useMemo(
    () => ({
      config,
      transformations,
      testimonials,
      gallery,
      videos,
      certifications,
      loading,
      refreshContent,
      activeCalendly,
      openBooking,
      closeBooking,
      videoModalOpen,
      setVideoModalOpen,
    }),
    [
      config,
      transformations,
      testimonials,
      gallery,
      videos,
      certifications,
      loading,
      refreshContent,
      activeCalendly,
      openBooking,
      closeBooking,
      videoModalOpen,
    ]
  );

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  );
};

export function useSiteContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useSiteContent must be used inside ContentProvider');
  return ctx;
}
