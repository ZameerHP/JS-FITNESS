import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

const DEFAULT_DEMO_TRANSFORMATIONS: TransformationItem[] = [
  {
    id: 'demo-1',
    name: 'Demo Client — Arjun S.',
    timeframe: '16 Weeks',
    category: 'Fat Loss & Muscle',
    story: 'Demo placeholder transformation showing structured nutrition, custom workouts, and weekly check-ins.',
    beforeImage: '/images/transform-male-before.webp',
    afterImage: '/images/transform-male-after.webp',
    isDemo: true,
    visible: true,
    order: 0,
  },
  {
    id: 'demo-2',
    name: 'Demo Client — Priya K.',
    timeframe: '16 Weeks',
    category: 'Body Recomposition',
    story: 'Demo placeholder transformation showing consistent strength training and lifestyle tracking.',
    beforeImage: '/images/transform-female-before.webp',
    afterImage: '/images/transform-female-after.webp',
    isDemo: true,
    visible: true,
    order: 1,
  },
];

const ContentContext = createContext<ContentContextValue | null>(null);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfigData>(siteConfig);
  const [transformations, setTransformations] = useState<TransformationItem[]>(
    DEFAULT_DEMO_TRANSFORMATIONS
  );
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
      setConfig((prev) => ({
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
      }));
      setTransformations(data.transformations || []);
      setTestimonials(data.testimonials || []);
      setGallery(data.gallery || []);
      setVideos(data.videos || []);
      setCertifications(data.certifications || []);
    } catch {
      // Fallback gracefully to siteConfig defaults when API is unavailable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContent();
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

  return (
    <ContentContext.Provider
      value={{
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
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};

export function useSiteContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useSiteContent must be used inside ContentProvider');
  return ctx;
}
