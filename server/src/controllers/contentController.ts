import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

export const prisma = new PrismaClient();

let contentCache: { payload: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export function invalidateContentCache(): void {
  contentCache = null;
}

export const DEFAULT_SETTINGS: Record<string, unknown> = {
  contact: {
    address: 'Unit 3135, 6520 36 Street NE, Calgary, AB, T3J 2L3',
    phone: '403-704-7021',
    email: 'coachingbyjatinder@gmail.com',
    whatsappNumber: '14037047021',
    whatsappUrl: 'https://wa.me/14037047021',
    mapsQuery: 'Unit 3135, 6520 36 Street NE, Calgary, AB, T3J 2L3',
  },
  hours: {
    gymAccess: '24/7 Gym Access',
    personalTraining: 'Personal Training: By Appointment Only',
  },
  socials: {
    instagram: 'https://instagram.com/jatindersinghsra',
    instagramHandle: '@jatindersinghsra',
    tiktok: 'https://tiktok.com/@jatindersinghsra',
    tiktokHandle: '@jatindersinghsra',
    youtube: 'https://youtube.com/@jatindersinghsra',
    youtubeHandle: '@jatindersinghsra',
    facebook: 'https://facebook.com/jatinder.singh.165',
    facebookHandle: 'jatinder.singh.165',
  },
  booking: {
    calendlyTourUrl: env.calendlyTourUrl || '',
    calendlyAssessmentUrl: env.calendlyAssessmentUrl || '',
    assessmentPriceCad: '99.99',
  },
  announcement: {
    enabled: false,
    text: 'Founders Membership spots are open — Book your free gym tour today.',
    link: '/membership',
  },
  membershipAvailability: {
    open: true,
    spotsRemaining: 24,
    label: 'LIMITED SPOTS',
  },
  pricingPhases: [
    {
      tier: 'Tier 1',
      title: 'Founders Membership',
      subtitle: 'Introductory rate with limited spots.',
      status: 'Active',
      icon: 'star',
    },
    {
      tier: 'Tier 2',
      title: 'Second Release',
      subtitle: 'Pricing increases soon.',
      status: 'Upcoming',
      icon: 'bars',
    },
    {
      tier: 'Tier 3',
      title: 'Final Release',
      subtitle: 'Final pricing phase.',
      status: 'Upcoming',
      icon: 'crown',
    },
  ],
  seo: {
    siteTitle: 'JS FITNESS INC | 24/7 Gym & Personal Training Calgary NE',
    defaultDescription:
      'JS FITNESS INC — More than just a gym membership. 24/7 gym access, customized coaching, nutrition tracking, and real transformations in Calgary NE.',
    keywords: 'gym Calgary NE, 24/7 gym Calgary, personal trainer Calgary',
  },
  legal: {
    privacyPolicyUpdated: 'November 2026',
    termsUpdated: 'November 2026',
  },
};

export async function buildPublicContent() {
  const [settingsRows, transformations, testimonials, gallery, videos, certifications] =
    await Promise.all([
      prisma.siteSetting.findMany({ select: { key: true, value: true } }),
      prisma.transformation.findMany({
        where: { visible: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          name: true,
          timeframe: true,
          category: true,
          story: true,
          beforeImage: true,
          afterImage: true,
          isDemo: true,
          visible: true,
          order: true,
        },
      }),
      prisma.testimonial.findMany({
        where: { visible: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          name: true,
          role: true,
          quote: true,
          rating: true,
          avatarUrl: true,
          visible: true,
          order: true,
        },
      }),
      prisma.galleryItem.findMany({
        where: { visible: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          imageUrl: true,
          category: true,
          visible: true,
          order: true,
        },
      }),
      prisma.videoItem.findMany({
        where: { visible: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          url: true,
          thumbnailUrl: true,
          isWalkthrough: true,
          visible: true,
          order: true,
        },
      }),
      prisma.certification.findMany({
        where: { visible: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          issuer: true,
          year: true,
          imageUrl: true,
          visible: true,
          order: true,
        },
      }),
    ]);

  const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of settingsRows) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }

  return {
    settings,
    transformations,
    testimonials,
    gallery,
    videos,
    certifications,
  };
}

export async function getPublicContent(_req: Request, res: Response): Promise<void> {
  try {
    if (contentCache && Date.now() - contentCache.timestamp < CACHE_TTL_MS) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
      res.json(contentCache.payload);
      return;
    }

    const payload = await buildPublicContent();
    contentCache = { payload, timestamp: Date.now() };
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
    res.json(payload);
  } catch (error) {
    console.error('Error building public content:', error);
    res.status(500).json({ error: 'Failed to load site content' });
  }
}
