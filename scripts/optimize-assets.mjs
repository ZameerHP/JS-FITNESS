import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from '../server/node_modules/sharp/lib/index.js';

const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, 'client', 'public', 'images');
const FONT_DIR = path.join(ROOT, 'client', 'public', 'fonts');
fs.mkdirSync(FONT_DIR, { recursive: true });

// 1. Pre-render 128x128 tileable film grain WebP (~2-3 KB)
async function buildGrainTile() {
  const size = 128;
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const v = Math.floor(Math.random() * 255);
    buf[i * 4] = v;
    buf[i * 4 + 1] = v;
    buf[i * 4 + 2] = v;
    buf[i * 4 + 3] = 28;
  }
  await sharp(buf, { raw: { width: size, height: size, channels: 4 } })
    .webp({ quality: 75 })
    .toFile(path.join(IMG_DIR, 'grain-128.webp'));
  console.log('Generated grain-128.webp');
}

// 2. Generate responsive WebP variants & ensure tight compression
async function buildResponsiveImages() {
  const jobs = [
    { src: 'facility-hero.webp', out: 'facility-hero-1200.webp', width: 1200, quality: 78 },
    { src: 'facility-hero.webp', out: 'facility-hero-800.webp', width: 800, quality: 76 },
    { src: 'facility-floor.webp', out: 'facility-floor-1200.webp', width: 1200, quality: 78 },
    { src: 'facility-floor.webp', out: 'facility-floor-800.webp', width: 800, quality: 76 },
    { src: 'facility-neon-logo.webp', out: 'facility-neon-logo-700.webp', width: 700, quality: 82 },
  ];

  for (const job of jobs) {
    await sharp(path.join(IMG_DIR, job.src))
      .resize(job.width, undefined, { withoutEnlargement: true })
      .webp({ quality: job.quality, alphaQuality: 85 })
      .toFile(path.join(IMG_DIR, job.out));
    console.log('Generated variant:', job.out);
  }
}

// 3. Fetch self-hosted Latin WOFF2 font files via @fontsource CDN / jsDelivr
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadFile(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      })
      .on('error', reject);
  });
}

async function downloadFonts() {
  const fonts = [
    {
      name: 'barlow-condensed-900-italic.woff2',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/barlow-condensed@latest/latin-900-italic.woff2',
    },
    {
      name: 'barlow-condensed-800-italic.woff2',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/barlow-condensed@latest/latin-800-italic.woff2',
    },
    {
      name: 'barlow-condensed-700-normal.woff2',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/barlow-condensed@latest/latin-700-normal.woff2',
    },
    {
      name: 'inter-400-normal.woff2',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.woff2',
    },
    {
      name: 'inter-600-normal.woff2',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.woff2',
    },
    {
      name: 'inter-800-normal.woff2',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-800-normal.woff2',
    },
    {
      name: 'yellowtail-400-normal.woff2',
      url: 'https://cdn.jsdelivr.net/fontsource/fonts/yellowtail@latest/latin-400-normal.woff2',
    },
  ];

  for (const f of fonts) {
    const dest = path.join(FONT_DIR, f.name);
    if (fs.existsSync(dest)) continue;
    await downloadFile(f.url, dest);
    const kb = (fs.statSync(dest).size / 1024).toFixed(1);
    console.log(`Downloaded font: ${f.name} (${kb} KB)`);
  }
}

await buildGrainTile();
await buildResponsiveImages();
await downloadFonts();
