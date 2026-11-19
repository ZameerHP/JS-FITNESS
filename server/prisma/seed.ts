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

  const existingTransforms = await prisma.transformation.count();
  if (existingTransforms === 0) {
    await prisma.transformation.createMany({
      data: [
        {
          name: 'Demo Client — Arjun S.',
          timeframe: '16 Weeks',
          category: 'Fat Loss & Muscle',
          story:
            'Demo placeholder transformation showing structured nutrition, custom workouts, and weekly check-ins. Replace with real client photos in /admin.',
          beforeImage: '/images/transform-male-before.webp',
          afterImage: '/images/transform-male-after.webp',
          isDemo: true,
          visible: true,
          order: 0,
        },
        {
          name: 'Demo Client — Priya K.',
          timeframe: '16 Weeks',
          category: 'Body Recomposition',
          story:
            'Demo placeholder transformation showing consistent strength training and lifestyle tracking. Replace with real client photos in /admin.',
          beforeImage: '/images/transform-female-before.webp',
          afterImage: '/images/transform-female-after.webp',
          isDemo: true,
          visible: true,
          order: 1,
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
