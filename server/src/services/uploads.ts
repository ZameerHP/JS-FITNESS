import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { getSupabaseAdmin, isSupabaseStorageConfigured } from './supabase.js';

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
let bucketVerified = false;

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 12 * 1024 * 1024, // 12 MB
  },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|avif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WebP, and AVIF images are allowed'));
    }
  },
});

export interface ProcessedImageResult {
  url: string;
  avifUrl: string;
  thumbUrl: string;
  srcSet: string;
}

async function ensureMediaBucket(): Promise<string> {
  const bucket = env.supabaseStorageBucket || 'media';
  if (bucketVerified) return bucket;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.getBucket(bucket);

  if (error || !data) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 12 * 1024 * 1024,
      allowedMimeTypes: ['image/webp', 'image/avif', 'image/jpeg', 'image/png'],
    });
    if (createError && !/already exists/i.test(createError.message)) {
      throw new Error(`Failed to ensure Supabase Storage bucket "${bucket}": ${createError.message}`);
    }
  } else if (!data.public) {
    await supabase.storage.updateBucket(bucket, {
      public: true,
      fileSizeLimit: 12 * 1024 * 1024,
      allowedMimeTypes: ['image/webp', 'image/avif', 'image/jpeg', 'image/png'],
    });
  }

  bucketVerified = true;
  return bucket;
}

async function uploadToSupabaseStorage(
  bucket: string,
  objectPath: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
    contentType,
    cacheControl: '31536000',
    upsert: true,
  });

  if (error) {
    throw new Error(`Supabase Storage upload failed for ${objectPath}: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

export async function processAndSaveImage(buffer: Buffer): Promise<ProcessedImageResult> {
  const id = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const mainWebpName = `${id}-1200.webp`;
  const medWebpName = `${id}-800.webp`;
  const thumbWebpName = `${id}-400.webp`;
  const mainAvifName = `${id}-1200.avif`;

  const [mainWebpBuf, medWebpBuf, thumbWebpBuf, mainAvifBuf] = await Promise.all([
    sharp(buffer)
      .rotate()
      .resize(1200, undefined, { withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer(),
    sharp(buffer)
      .rotate()
      .resize(800, undefined, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer(),
    sharp(buffer)
      .rotate()
      .resize(400, undefined, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),
    sharp(buffer)
      .rotate()
      .resize(1200, undefined, { withoutEnlargement: true })
      .avif({ quality: 65 })
      .toBuffer(),
  ]);

  if (isSupabaseStorageConfigured()) {
    const bucket = await ensureMediaBucket();
    const [mainUrl, medUrl, thumbUrl, avifUrl] = await Promise.all([
      uploadToSupabaseStorage(bucket, `uploads/${mainWebpName}`, mainWebpBuf, 'image/webp'),
      uploadToSupabaseStorage(bucket, `uploads/${medWebpName}`, medWebpBuf, 'image/webp'),
      uploadToSupabaseStorage(bucket, `uploads/${thumbWebpName}`, thumbWebpBuf, 'image/webp'),
      uploadToSupabaseStorage(bucket, `uploads/${mainAvifName}`, mainAvifBuf, 'image/avif'),
    ]);

    return {
      url: mainUrl,
      avifUrl,
      thumbUrl,
      srcSet: `${thumbUrl} 400w, ${medUrl} 800w, ${mainUrl} 1200w`,
    };
  }

  if (env.isVercel) {
    throw new Error(
      'Supabase Storage is required for uploads on Vercel. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  await Promise.all([
    fs.promises.writeFile(path.join(UPLOADS_DIR, mainWebpName), mainWebpBuf),
    fs.promises.writeFile(path.join(UPLOADS_DIR, medWebpName), medWebpBuf),
    fs.promises.writeFile(path.join(UPLOADS_DIR, thumbWebpName), thumbWebpBuf),
    fs.promises.writeFile(path.join(UPLOADS_DIR, mainAvifName), mainAvifBuf),
  ]);

  return {
    url: `/uploads/${mainWebpName}`,
    avifUrl: `/uploads/${mainAvifName}`,
    thumbUrl: `/uploads/${thumbWebpName}`,
    srcSet: `/uploads/${thumbWebpName} 400w, /uploads/${medWebpName} 800w, /uploads/${mainWebpName} 1200w`,
  };
}
