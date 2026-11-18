import fs from 'fs';
import path from 'path';
import assert from 'node:assert/strict';
import '../src/config/env.js';
import { env } from '../src/config/env.js';
import { prisma } from '../src/lib/prisma.js';
import {
  createSupabaseAuthClient,
  getSupabaseAdmin,
  isSupabaseAuthConfigured,
  isSupabaseStorageConfigured,
} from '../src/services/supabase.js';

async function verifyDatabase() {
  const ping = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
  assert.equal(ping[0]?.ok, 1, 'Postgres connectivity ping failed');

  const rlsRows = await prisma.$queryRaw<Array<{ tablename: string; rowsecurity: boolean }>>`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename IN (
        'admin_users',
        'site_settings',
        'transformations',
        'testimonials',
        'gallery_items',
        'video_items',
        'certifications',
        'contact_submissions'
      )
    ORDER BY tablename;
  `;

  assert.equal(rlsRows.length, 8, 'Expected all 8 tables in public schema');
  for (const row of rlsRows) {
    assert.equal(row.rowsecurity, true, `RLS must be enabled on public.${row.tablename}`);
  }

  const counts = {
    adminUsers: await prisma.adminUser.count(),
    siteSettings: await prisma.siteSetting.count(),
    transformations: await prisma.transformation.count(),
    testimonials: await prisma.testimonial.count(),
    galleryItems: await prisma.galleryItem.count(),
    videoItems: await prisma.videoItem.count(),
    certifications: await prisma.certification.count(),
    contactSubmissions: await prisma.contactSubmission.count(),
  };

  assert.ok(counts.adminUsers >= 1, 'Expected at least 1 AdminUser record');
  assert.ok(counts.siteSettings >= 8, 'Expected at least 8 SiteSetting records');
  assert.ok(counts.transformations >= 2, 'Expected seeded Transformation records');

  const snapshotPath = path.resolve(process.cwd(), 'prisma/backups/sqlite-export.json');
  if (fs.existsSync(snapshotPath)) {
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    for (const a of snapshot.tables.adminUsers || []) {
      const found = await prisma.adminUser.findUnique({ where: { id: a.id } });
      assert.ok(found, `Preserved AdminUser id ${a.id} missing after migration`);
    }
    for (const c of snapshot.tables.contactSubmissions || []) {
      const found = await prisma.contactSubmission.findUnique({ where: { id: c.id } });
      assert.ok(found, `Preserved ContactSubmission id ${c.id} missing after migration`);
    }
  }

  console.log('[PASS] Database connectivity, RLS flags, and record verification:', counts);
}

async function verifySupabaseAuthAndRls() {
  if (!isSupabaseAuthConfigured()) {
    console.log('[SKIP] Supabase Auth / Anon RLS verification (SUPABASE_URL/ANON/SERVICE keys not set)');
    return;
  }

  const anonClient = createSupabaseAuthClient();

  // Confirm anon cannot read admin_users or contact_submissions
  const adminLeak = await anonClient.from('admin_users').select('id, email').limit(1);
  assert.ok(
    adminLeak.error || (adminLeak.data && adminLeak.data.length === 0),
    'RLS/grants failed: anon must never read admin_users'
  );

  const contactLeak = await anonClient.from('contact_submissions').select('id, email').limit(1);
  assert.ok(
    contactLeak.error || (contactLeak.data && contactLeak.data.length === 0),
    'RLS failed: anon must never read contact_submissions'
  );

  // Confirm anon CAN read public content tables when visible/allowed
  const publicSettings = await anonClient.from('site_settings').select('key').limit(10);
  if (publicSettings.error) {
    throw new Error(`Anon Data API select failed on site_settings: ${publicSettings.error.message}`);
  }
  assert.ok((publicSettings.data?.length || 0) >= 8, 'Anon should read allowed site_settings');

  // Verify admin login via Supabase Auth
  const authClient = createSupabaseAuthClient();
  const { data: loginData, error: loginError } = await authClient.auth.signInWithPassword({
    email: env.adminEmail.toLowerCase(),
    password: env.adminPassword,
  });
  if (loginError || !loginData.session || !loginData.user) {
    throw new Error(`Supabase Auth admin login failed: ${loginError?.message || 'no session'}`);
  }
  assert.equal(
    loginData.user.app_metadata?.role,
    'admin',
    'Supabase Auth user must have app_metadata.role === "admin"'
  );

  await getSupabaseAdmin().auth.admin.signOut(loginData.session.access_token);
  console.log('[PASS] Supabase Auth login, app_metadata admin claim, and Data API RLS verified');
}

async function verifyStorage() {
  if (!isSupabaseStorageConfigured()) {
    console.log('[SKIP] Supabase Storage verification (SUPABASE_URL / SERVICE_ROLE_KEY not set)');
    return;
  }

  const supabase = getSupabaseAdmin();
  const bucket = env.supabaseStorageBucket || 'media';
  const testKey = `healthcheck/${Date.now()}.webp`;
  const sampleBytes = Buffer.from('RIFF\x18\x00\x00\x00WEBPVP8 \x0c\x00\x00\x00\x30\x01\x00\x9d\x01\x2a\x01\x00\x01\x00\x00\x00');

  const { error: uploadErr } = await supabase.storage.from(bucket).upload(testKey, sampleBytes, {
    contentType: 'image/webp',
    upsert: true,
  });
  if (uploadErr) {
    throw new Error(`Storage upload check failed: ${uploadErr.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(testKey);
  const res = await fetch(publicUrlData.publicUrl);
  assert.equal(res.status, 200, `Expected HTTP 200 from public Storage URL ${publicUrlData.publicUrl}`);

  await supabase.storage.from(bucket).remove([testKey]);
  console.log(`[PASS] Supabase Storage bucket "${bucket}" upload, public fetch, and cleanup verified`);
}

async function main() {
  try {
    await verifyDatabase();
    await verifySupabaseAuthAndRls();
    await verifyStorage();
    console.log('ALL SUPABASE VERIFICATION CHECKS PASSED.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Supabase verification failed:', err);
  process.exit(1);
});
