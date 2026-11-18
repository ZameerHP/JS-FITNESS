import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import '../src/config/env.js';
import { env } from '../src/config/env.js';
import {
  getSupabaseAdmin,
  isSupabaseAuthConfigured,
  isSupabaseStorageConfigured,
  syncAdminUserToSupabaseAuth,
} from '../src/services/supabase.js';

interface SqliteSnapshot {
  exportedAt: string;
  source: string;
  tables: {
    adminUsers: Array<{
      id: string;
      email: string;
      passwordHash: string;
      totpSecret: string | null;
      totpEnabled: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    siteSettings: Array<{
      key: string;
      value: string;
      updatedAt: string;
    }>;
    transformations: Array<{
      id: string;
      name: string;
      timeframe: string;
      category: string;
      story: string;
      beforeImage: string;
      afterImage: string;
      isDemo: boolean;
      visible: boolean;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>;
    testimonials: Array<{
      id: string;
      name: string;
      role: string;
      quote: string;
      rating: number;
      avatarUrl: string | null;
      visible: boolean;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>;
    galleryItems: Array<{
      id: string;
      title: string;
      imageUrl: string;
      category: string;
      visible: boolean;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>;
    videoItems: Array<{
      id: string;
      title: string;
      url: string;
      thumbnailUrl: string | null;
      isWalkthrough: boolean;
      visible: boolean;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>;
    certifications: Array<{
      id: string;
      title: string;
      issuer: string;
      year: string;
      imageUrl: string | null;
      visible: boolean;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>;
    contactSubmissions: Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      interest: string;
      message: string;
      read: boolean;
      createdAt: string;
    }>;
  };
}

async function migrateLocalUploadsIfPresent(): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir) || !isSupabaseStorageConfigured()) {
    return urlMap;
  }

  const files = fs.readdirSync(uploadsDir).filter((f) => /\.(webp|avif|png|jpe?g)$/i.test(f));
  if (files.length === 0) return urlMap;

  const supabase = getSupabaseAdmin();
  const bucket = env.supabaseStorageBucket || 'media';

  const { data: existingBucket } = await supabase.storage.getBucket(bucket);
  if (!existingBucket) {
    await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 12 * 1024 * 1024,
      allowedMimeTypes: ['image/webp', 'image/avif', 'image/jpeg', 'image/png'],
    });
  }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const contentType =
      ext === '.webp'
        ? 'image/webp'
        : ext === '.avif'
          ? 'image/avif'
          : ext === '.png'
            ? 'image/png'
            : 'image/jpeg';

    const buffer = fs.readFileSync(path.join(uploadsDir, file));
    const objectPath = `uploads/${file}`;
    const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
      contentType,
      cacheControl: '31536000',
      upsert: true,
    });
    if (error) {
      throw new Error(`Failed migrating upload ${file} to Supabase Storage: ${error.message}`);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    urlMap.set(`/uploads/${file}`, data.publicUrl);
  }

  console.log(`Migrated ${urlMap.size} upload file(s) to Supabase Storage bucket "${bucket}".`);
  return urlMap;
}

function rewriteUploadUrl(url: string | null | undefined, map: Map<string, string>): string | null | undefined {
  if (!url) return url;
  return map.get(url) ?? url;
}

async function main() {
  const snapshotPath = path.resolve(process.cwd(), 'prisma/backups/sqlite-export.json');
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot file missing at ${snapshotPath}`);
  }

  if (!env.databaseUrl && !env.directUrl) {
    throw new Error('DATABASE_URL or DIRECT_URL must be set to migrate to Supabase PostgreSQL.');
  }

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8')) as SqliteSnapshot;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: env.directUrl || env.databaseUrl,
      },
    },
  });

  try {
    const uploadMap = await migrateLocalUploadsIfPresent();

    // 1. Admin Users (preserve IDs, passwordHash, totpSecret, totpEnabled, timestamps)
    for (const u of snapshot.tables.adminUsers) {
      let supabaseUserId: string | undefined;
      if (isSupabaseAuthConfigured()) {
        // Provision admin into Supabase Auth; uses ADMIN_PASSWORD from env if creating brand new user
        supabaseUserId = await syncAdminUserToSupabaseAuth({
          email: u.email,
          password: env.adminPassword,
        });
      }

      await prisma.adminUser.upsert({
        where: { id: u.id },
        update: {
          email: u.email.toLowerCase(),
          passwordHash: u.passwordHash,
          totpSecret: u.totpSecret,
          totpEnabled: u.totpEnabled,
          ...(supabaseUserId ? { supabaseUserId } : {}),
        },
        create: {
          id: u.id,
          email: u.email.toLowerCase(),
          passwordHash: u.passwordHash,
          supabaseUserId: supabaseUserId || null,
          totpSecret: u.totpSecret,
          totpEnabled: u.totpEnabled,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        },
      });
    }

    // 2. Site Settings
    for (const s of snapshot.tables.siteSettings) {
      await prisma.siteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: {
          key: s.key,
          value: s.value,
          updatedAt: new Date(s.updatedAt),
        },
      });
    }

    // 3. Transformations
    for (const t of snapshot.tables.transformations) {
      await prisma.transformation.upsert({
        where: { id: t.id },
        update: {
          name: t.name,
          timeframe: t.timeframe,
          category: t.category,
          story: t.story,
          beforeImage: rewriteUploadUrl(t.beforeImage, uploadMap) || t.beforeImage,
          afterImage: rewriteUploadUrl(t.afterImage, uploadMap) || t.afterImage,
          isDemo: t.isDemo,
          visible: t.visible,
          order: t.order,
        },
        create: {
          id: t.id,
          name: t.name,
          timeframe: t.timeframe,
          category: t.category,
          story: t.story,
          beforeImage: rewriteUploadUrl(t.beforeImage, uploadMap) || t.beforeImage,
          afterImage: rewriteUploadUrl(t.afterImage, uploadMap) || t.afterImage,
          isDemo: t.isDemo,
          visible: t.visible,
          order: t.order,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        },
      });
    }

    // 4. Testimonials
    for (const item of snapshot.tables.testimonials) {
      await prisma.testimonial.upsert({
        where: { id: item.id },
        update: {
          name: item.name,
          role: item.role,
          quote: item.quote,
          rating: item.rating,
          avatarUrl: rewriteUploadUrl(item.avatarUrl, uploadMap) ?? null,
          visible: item.visible,
          order: item.order,
        },
        create: {
          id: item.id,
          name: item.name,
          role: item.role,
          quote: item.quote,
          rating: item.rating,
          avatarUrl: rewriteUploadUrl(item.avatarUrl, uploadMap) ?? null,
          visible: item.visible,
          order: item.order,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        },
      });
    }

    // 5. Gallery Items
    for (const g of snapshot.tables.galleryItems) {
      await prisma.galleryItem.upsert({
        where: { id: g.id },
        update: {
          title: g.title,
          imageUrl: rewriteUploadUrl(g.imageUrl, uploadMap) || g.imageUrl,
          category: g.category,
          visible: g.visible,
          order: g.order,
        },
        create: {
          id: g.id,
          title: g.title,
          imageUrl: rewriteUploadUrl(g.imageUrl, uploadMap) || g.imageUrl,
          category: g.category,
          visible: g.visible,
          order: g.order,
          createdAt: new Date(g.createdAt),
          updatedAt: new Date(g.updatedAt),
        },
      });
    }

    // 6. Video Items
    for (const v of snapshot.tables.videoItems) {
      await prisma.videoItem.upsert({
        where: { id: v.id },
        update: {
          title: v.title,
          url: v.url,
          thumbnailUrl: rewriteUploadUrl(v.thumbnailUrl, uploadMap) ?? null,
          isWalkthrough: v.isWalkthrough,
          visible: v.visible,
          order: v.order,
        },
        create: {
          id: v.id,
          title: v.title,
          url: v.url,
          thumbnailUrl: rewriteUploadUrl(v.thumbnailUrl, uploadMap) ?? null,
          isWalkthrough: v.isWalkthrough,
          visible: v.visible,
          order: v.order,
          createdAt: new Date(v.createdAt),
          updatedAt: new Date(v.updatedAt),
        },
      });
    }

    // 7. Certifications
    for (const c of snapshot.tables.certifications) {
      await prisma.certification.upsert({
        where: { id: c.id },
        update: {
          title: c.title,
          issuer: c.issuer,
          year: c.year,
          imageUrl: rewriteUploadUrl(c.imageUrl, uploadMap) ?? null,
          visible: c.visible,
          order: c.order,
        },
        create: {
          id: c.id,
          title: c.title,
          issuer: c.issuer,
          year: c.year,
          imageUrl: rewriteUploadUrl(c.imageUrl, uploadMap) ?? null,
          visible: c.visible,
          order: c.order,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
        },
      });
    }

    // 8. Contact Submissions
    for (const msg of snapshot.tables.contactSubmissions) {
      await prisma.contactSubmission.upsert({
        where: { id: msg.id },
        update: {
          name: msg.name,
          email: msg.email,
          phone: msg.phone,
          interest: msg.interest,
          message: msg.message,
          read: msg.read,
        },
        create: {
          id: msg.id,
          name: msg.name,
          email: msg.email,
          phone: msg.phone,
          interest: msg.interest,
          message: msg.message,
          read: msg.read,
          createdAt: new Date(msg.createdAt),
        },
      });
    }

    console.log('Migration to Supabase PostgreSQL completed:', {
      adminUsers: await prisma.adminUser.count(),
      siteSettings: await prisma.siteSetting.count(),
      transformations: await prisma.transformation.count(),
      testimonials: await prisma.testimonial.count(),
      galleryItems: await prisma.galleryItem.count(),
      videoItems: await prisma.videoItem.count(),
      certifications: await prisma.certification.count(),
      contactSubmissions: await prisma.contactSubmission.count(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
