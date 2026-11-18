import fs from 'fs';
import path from 'path';
import sharp from '../server/node_modules/sharp/lib/index.js';

const SRC_LOGO =
  'C:/Users/Noman Traders/.gemini/antigravity/brain/b2df1118-17ad-424a-8427-1358cbcb2aa8/.user_uploaded/media_1794892129727_17dcd930.png';
const PUBLIC_DIR = path.join(process.cwd(), 'client', 'public');
const IMG_DIR = path.join(PUBLIC_DIR, 'images');

fs.mkdirSync(IMG_DIR, { recursive: true });

async function buildLogoAssets() {
  const { data, info } = await sharp(SRC_LOGO)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const cleaned = Buffer.from(data);

  let minX = w;
  let maxX = 0;
  let minY = h;
  let maxY = 0;

  // Clean faint AI-cutout alpha noise (<= 10 -> 0) and restore full solid interior opacity (>= 242 -> 255)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let a = cleaned[idx + 3];
      if (a <= 10) {
        a = 0;
        cleaned[idx] = 0;
        cleaned[idx + 1] = 0;
        cleaned[idx + 2] = 0;
      } else if (a >= 242) {
        a = 255;
      } else {
        a = Math.round(((a - 10) / (242 - 10)) * 255);
      }
      cleaned[idx + 3] = a;

      if (a > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const pad = 16;

  const trimmedPng = await sharp(cleaned, {
    raw: { width: w, height: h, channels: 4 },
  })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const trimmedMeta = await sharp(trimmedPng).metadata();
  const baseW = trimmedMeta.width;
  const baseH = trimmedMeta.height;
  console.log(`Trimmed clean logo dimensions: ${baseW}x${baseH}`);

  // Compute exact proportional heights for clean integer HTML attributes
  const h512 = Math.round((512 * baseH) / baseW);
  const h256 = Math.round((256 * baseH) / baseW);
  const h128 = Math.round((128 * baseH) / baseW);

  // High-res near-lossless WebP (razor sharp neon green edges & black plaque at ~1/4 PNG size)
  await sharp(trimmedPng)
    .resize(512, h512, { kernel: 'lanczos3' })
    .webp({ quality: 92, alphaQuality: 100, smartSubsample: false, effort: 6 })
    .toFile(path.join(IMG_DIR, 'js-logo.webp'));

  // Navbar / UI crisp @2x WebP
  await sharp(trimmedPng)
    .resize(256, h256, { kernel: 'lanczos3' })
    .webp({ quality: 94, alphaQuality: 100, smartSubsample: false, effort: 6 })
    .toFile(path.join(IMG_DIR, 'js-logo-256.webp'));

  // Compact @1x / Phone mockup / Small icon WebP
  await sharp(trimmedPng)
    .resize(128, h128, { kernel: 'lanczos3' })
    .webp({ quality: 94, alphaQuality: 100, smartSubsample: false, effort: 6 })
    .toFile(path.join(IMG_DIR, 'js-logo-128.webp'));

  // Clean PNG fallback for Schema.org / social / compatibility
  await sharp(trimmedPng)
    .resize(512, h512, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toFile(path.join(IMG_DIR, 'js-logo.png'));

  // Square dark-obsidian rounded badge icons for browser tabs & full-bleed square for iOS Apple Touch Icon
  async function writeIcon(size, filename, { rounded = true } = {}) {
    const innerSize = Math.round(size * 0.84);
    const logoResized = await sharp(trimmedPng)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();

    const r = rounded ? Math.round(size * 0.22) : 0;
    const strokeW = Math.max(1.5, size * 0.03);
    const borderRect = rounded
      ? `<rect x="${strokeW / 2}" y="${strokeW / 2}" width="${size - strokeW}" height="${size - strokeW}" rx="${r}" fill="url(#g)" stroke="#B6F500" stroke-opacity="0.45" stroke-width="${strokeW}"/>`
      : `<rect x="0" y="0" width="${size}" height="${size}" fill="url(#g)"/>`;

    const bgSvg = Buffer.from(
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="g" cx="50%" cy="46%" r="55%">
            <stop offset="0%" stop-color="#193305"/>
            <stop offset="65%" stop-color="#0B0D0A"/>
            <stop offset="100%" stop-color="#050505"/>
          </radialGradient>
        </defs>
        ${borderRect}
      </svg>`
    );

    await sharp(bgSvg)
      .composite([{ input: logoResized, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(PUBLIC_DIR, filename));
  }

  await writeIcon(32, 'favicon-32x32.png', { rounded: true });
  await writeIcon(64, 'favicon.png', { rounded: true });
  await writeIcon(180, 'apple-touch-icon.png', { rounded: false });
  await writeIcon(192, 'favicon-192x192.png', { rounded: true });

  for (const f of [
    path.join(IMG_DIR, 'js-logo.webp'),
    path.join(IMG_DIR, 'js-logo-256.webp'),
    path.join(IMG_DIR, 'js-logo-128.webp'),
    path.join(IMG_DIR, 'js-logo.png'),
    path.join(PUBLIC_DIR, 'favicon-32x32.png'),
    path.join(PUBLIC_DIR, 'favicon.png'),
    path.join(PUBLIC_DIR, 'apple-touch-icon.png'),
    path.join(PUBLIC_DIR, 'favicon-192x192.png'),
  ]) {
    const st = fs.statSync(f);
    const m = await sharp(f).metadata();
    console.log(
      path.relative(process.cwd(), f),
      `${m.width}x${m.height}`,
      `${(st.size / 1024).toFixed(1)} KB`
    );
  }
}

buildLogoAssets().catch((err) => {
  console.error(err);
  process.exit(1);
});
