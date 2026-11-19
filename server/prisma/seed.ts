import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { isSupabaseAuthConfigured, syncAdminUserToSupabaseAuth } from '../src/services/supabase.js';

const rootEnv = path.resolve(process.cwd(), '../.env');
const rootLocalEnv = path.resolve(process.cwd(), '../.env.local');
const localEnv = path.resolve(process.cwd(), '.env');

if (fs.existsSync(localEnv)) dotenv.config({ path: localEnv });
if (fs.existsSync(rootLocalEnv)) dotenv.config({ path: rootLocalEnv });
if (fs.existsSync(rootEnv)) dotenv.config({ path: rootEnv });
else if (!fs.existsSync(localEnv)) dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@jsfitness.ca').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'JSFitness2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  let supabaseUserId: string | undefined;
  if (isSupabaseAuthConfigured()) {
    supabaseUserId = await syncAdminUserToSupabaseAuth({
      email: adminEmail,
      password: adminPassword,
    });
  }

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      ...(supabaseUserId ? { supabaseUserId } : {}),
    },
    create: {
      email: adminEmail,
      passwordHash,
      supabaseUserId: supabaseUserId || null,
      totpEnabled: false,
    },
  });

  const defaultSettings: Record<string, unknown> = {
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
      calendlyTourUrl: process.env.CALENDLY_TOUR_URL || '',
      calendlyAssessmentUrl: process.env.CALENDLY_ASSESSMENT_URL || '',
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

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: JSON.stringify(value) },
    });
  }

  await prisma.transformation.deleteMany({
    where: { isDemo: true },
  });

  const existingGallery = await prisma.galleryItem.count();
  if (existingGallery === 0) {
    await prisma.galleryItem.createMany({
      data: [
        {
          title: 'Train Eat Sleep Repeat — Exterior Sign',
          imageUrl: '/images/facility-sign.webp',
          category: 'Facility',
          visible: true,
          order: 0,
        },
        {
          title: 'JS FITNESS Strength Floor & Wall Crest',
          imageUrl: '/images/facility-strength.webp',
          category: 'Facility',
          visible: true,
          order: 1,
        },
        {
          title: 'Power Racks & Smith Stations',
          imageUrl: '/images/facility-racks.webp',
          category: 'Equipment',
          visible: true,
          order: 2,
        },
        {
          title: 'Pro-Style Dumbbell Line (5–120 lb)',
          imageUrl: '/images/facility-dumbbells.webp',
          category: 'Equipment',
          visible: true,
          order: 3,
        },
        {
          title: 'Plate-Loaded & Selectorized Press Line',
          imageUrl: '/images/facility-machines.webp',
          category: 'Equipment',
          visible: true,
          order: 4,
        },
        {
          title: '45° Leg Press & Lower Body Zone',
          imageUrl: '/images/facility-legpress.webp',
          category: 'Equipment',
          visible: true,
          order: 5,
        },
      ],
    });
  }

  console.log('Supabase seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
