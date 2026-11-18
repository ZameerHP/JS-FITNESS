-- JS FITNESS INC — Supabase PostgreSQL Schema, RLS Policies, Grants & Storage Setup
-- Idempotent migration: safe to execute in Supabase SQL Editor or via Supabase CLI / pg client.

-- 1. Core Application Tables (lowercase snake_case matching Prisma @map/@@map)

CREATE TABLE IF NOT EXISTS public.admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  supabase_user_id TEXT,
  totp_secret TEXT,
  totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_key ON public.admin_users (email);
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_supabase_user_id_key ON public.admin_users (supabase_user_id)
  WHERE supabase_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transformations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Fat Loss & Muscle',
  story TEXT NOT NULL DEFAULT '',
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transformations_visible_order_idx
  ON public.transformations (visible, "order");

CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'JS FITNESS Member',
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  avatar_url TEXT,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS testimonials_visible_order_idx
  ON public.testimonials (visible, "order");

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Facility',
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gallery_items_visible_order_idx
  ON public.gallery_items (visible, "order");

CREATE TABLE IF NOT EXISTS public.video_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_walkthrough BOOLEAN NOT NULL DEFAULT FALSE,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS video_items_visible_order_idx
  ON public.video_items (visible, "order");

CREATE TABLE IF NOT EXISTS public.certifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  year TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS certifications_visible_order_idx
  ON public.certifications (visible, "order");

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  interest TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_submissions_read_created_at_idx
  ON public.contact_submissions (read, created_at DESC);

-- 2. Auto-maintain updated_at triggers for direct SQL / Data API edits

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'admin_users',
    'site_settings',
    'transformations',
    'testimonials',
    'gallery_items',
    'video_items',
    'certifications'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I;', tbl, tbl);
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      tbl,
      tbl
    );
  END LOOP;
END
$$;

-- 3. Enable Row-Level Security (RLS) on ALL public tables

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Principle of Least Privilege: explicit role grants & revocations
-- Never expose admin_users (password_hash / totp_secret) to anon or authenticated Data API roles.
REVOKE ALL ON TABLE public.admin_users FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON TABLE
  public.site_settings,
  public.transformations,
  public.testimonials,
  public.gallery_items,
  public.video_items,
  public.certifications
TO anon, authenticated;

GRANT INSERT ON TABLE public.contact_submissions TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON TABLE
  public.site_settings,
  public.transformations,
  public.testimonials,
  public.gallery_items,
  public.video_items,
  public.certifications
TO authenticated;

GRANT SELECT, UPDATE, DELETE ON TABLE public.contact_submissions TO authenticated;

-- 5. Secure RLS Policies
-- Use explicit TO anon / TO authenticated (never deprecated auth.role())
-- Wrap (select auth.jwt()) in subselect for RLS initplan performance
-- Use app_metadata (never user_metadata) for admin role authorization

-- admin_users: Zero anon/authenticated policies (accessible only via postgres / service_role backend).

-- site_settings
DROP POLICY IF EXISTS "Public read allowed site settings" ON public.site_settings;
CREATE POLICY "Public read allowed site settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (
    key = ANY (
      ARRAY[
        'contact',
        'hours',
        'socials',
        'booking',
        'announcement',
        'membershipAvailability',
        'pricingPhases',
        'seo',
        'legal'
      ]
    )
  );

DROP POLICY IF EXISTS "Admin manage site settings" ON public.site_settings;
CREATE POLICY "Admin manage site settings"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'))
  WITH CHECK (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'));

-- transformations
DROP POLICY IF EXISTS "Public read visible transformations" ON public.transformations;
CREATE POLICY "Public read visible transformations"
  ON public.transformations
  FOR SELECT
  TO anon, authenticated
  USING (visible = TRUE);

DROP POLICY IF EXISTS "Admin manage transformations" ON public.transformations;
CREATE POLICY "Admin manage transformations"
  ON public.transformations
  FOR ALL
  TO authenticated
  USING (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'))
  WITH CHECK (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'));

-- testimonials
DROP POLICY IF EXISTS "Public read visible testimonials" ON public.testimonials;
CREATE POLICY "Public read visible testimonials"
  ON public.testimonials
  FOR SELECT
  TO anon, authenticated
  USING (visible = TRUE);

DROP POLICY IF EXISTS "Admin manage testimonials" ON public.testimonials;
CREATE POLICY "Admin manage testimonials"
  ON public.testimonials
  FOR ALL
  TO authenticated
  USING (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'))
  WITH CHECK (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'));

-- gallery_items
DROP POLICY IF EXISTS "Public read visible gallery items" ON public.gallery_items;
CREATE POLICY "Public read visible gallery items"
  ON public.gallery_items
  FOR SELECT
  TO anon, authenticated
  USING (visible = TRUE);

DROP POLICY IF EXISTS "Admin manage gallery items" ON public.gallery_items;
CREATE POLICY "Admin manage gallery items"
  ON public.gallery_items
  FOR ALL
  TO authenticated
  USING (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'))
  WITH CHECK (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'));

-- video_items
DROP POLICY IF EXISTS "Public read visible video items" ON public.video_items;
CREATE POLICY "Public read visible video items"
  ON public.video_items
  FOR SELECT
  TO anon, authenticated
  USING (visible = TRUE);

DROP POLICY IF EXISTS "Admin manage video items" ON public.video_items;
CREATE POLICY "Admin manage video items"
  ON public.video_items
  FOR ALL
  TO authenticated
  USING (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'))
  WITH CHECK (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'));

-- certifications
DROP POLICY IF EXISTS "Public read visible certifications" ON public.certifications;
CREATE POLICY "Public read visible certifications"
  ON public.certifications
  FOR SELECT
  TO anon, authenticated
  USING (visible = TRUE);

DROP POLICY IF EXISTS "Admin manage certifications" ON public.certifications;
CREATE POLICY "Admin manage certifications"
  ON public.certifications
  FOR ALL
  TO authenticated
  USING (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'))
  WITH CHECK (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'));

-- contact_submissions
DROP POLICY IF EXISTS "Public submit contact inquiry" ON public.contact_submissions;
CREATE POLICY "Public submit contact inquiry"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    read = FALSE
    AND length(trim(name)) >= 2
    AND length(trim(email)) >= 3
    AND length(trim(message)) >= 5
  );

DROP POLICY IF EXISTS "Admin read contact submissions" ON public.contact_submissions;
CREATE POLICY "Admin read contact submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'));

DROP POLICY IF EXISTS "Admin update contact submissions" ON public.contact_submissions;
CREATE POLICY "Admin update contact submissions"
  ON public.contact_submissions
  FOR UPDATE
  TO authenticated
  USING (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'))
  WITH CHECK (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'));

DROP POLICY IF EXISTS "Admin delete contact submissions" ON public.contact_submissions;
CREATE POLICY "Admin delete contact submissions"
  ON public.contact_submissions
  FOR DELETE
  TO authenticated
  USING (((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin'));

-- 6. Supabase Storage Bucket & Object Policies for Admin Media Uploads ("media")

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  TRUE,
  12582912,
  ARRAY['image/webp', 'image/avif', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read media objects" ON storage.objects;
CREATE POLICY "Public read media objects"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin insert media objects" ON storage.objects;
CREATE POLICY "Admin insert media objects"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND ((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin')
  );

DROP POLICY IF EXISTS "Admin update media objects" ON storage.objects;
CREATE POLICY "Admin update media objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND ((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin')
  )
  WITH CHECK (
    bucket_id = 'media'
    AND ((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin')
  );

DROP POLICY IF EXISTS "Admin delete media objects" ON storage.objects;
CREATE POLICY "Admin delete media objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media'
    AND ((select (auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin')
  );
