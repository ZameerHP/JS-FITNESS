import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

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

export async function processAndSaveImage(buffer: Buffer): Promise<ProcessedImageResult> {
  const id = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const mainWebp = `${id}-1200.webp`;
  const medWebp = `${id}-800.webp`;
  const thumbWebp = `${id}-400.webp`;
  const mainAvif = `${id}-1200.avif`;

  await Promise.all([
    sharp(buffer)
      .rotate()
      .resize(1200, undefined, { withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(path.join(UPLOADS_DIR, mainWebp)),
    sharp(buffer)
      .rotate()
      .resize(800, undefined, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(UPLOADS_DIR, medWebp)),
    sharp(buffer)
      .rotate()
      .resize(400, undefined, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(UPLOADS_DIR, thumbWebp)),
    sharp(buffer)
      .rotate()
      .resize(1200, undefined, { withoutEnlargement: true })
      .avif({ quality: 65 })
      .toFile(path.join(UPLOADS_DIR, mainAvif)),
  ]);

  return {
    url: `/uploads/${mainWebp}`,
    avifUrl: `/uploads/${mainAvif}`,
    thumbUrl: `/uploads/${thumbWebp}`,
    srcSet: `/uploads/${thumbWebp} 400w, /uploads/${medWebp} 800w, /uploads/${mainWebp} 1200w`,
  };
}
