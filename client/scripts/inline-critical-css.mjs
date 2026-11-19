import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const assetsDir = path.join(distDir, 'assets');
const htmlPath = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlPath)) {
  console.error('[inline-critical-css] dist/index.html not found');
  process.exit(1);
}

let html = fs.readFileSync(htmlPath, 'utf8');
let inlinedCount = 0;

// Replace render-blocking entry stylesheet links with inline <style>
html = html.replace(
  /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*\/assets\/[^"']+\.css)["'][^>]*>/gi,
  (fullTag, href) => {
    const cleanRel = href.replace(/^\//, '');
    const cssPath = path.join(distDir, cleanRel);
    if (!fs.existsSync(cssPath)) return fullTag;
    const css = fs.readFileSync(cssPath, 'utf8').trim();
    inlinedCount += 1;
    return `<style data-inline-css="${path.basename(cssPath)}">${css}</style>`;
  }
);

// Strip non-critical modulepreload tags
html = html.replace(
  /\s*<link\b[^>]*rel=["']modulepreload["'][^>]*href=["'][^"']*(?:AdminLayout|CalendlyModal|PerfHud|Contact-|gsap-|motion-|HomeBelowFold-|ShellFooter-|Preloader-|PageTransition-|CustomCursor-|VideoModal-)[^"']*["'][^>]*>\s*/gi,
  '\n    '
);

// Inject missing modulepreload links for core chunks so browser parses in parallel
if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const wantPrefixes = ['react-'];
  const tagsToAdd = [];

  for (const prefix of wantPrefixes) {
    const match = files.find((f) => f.startsWith(prefix) && f.endsWith('.js'));
    if (match) {
      const href = `/assets/${match}`;
      if (!html.includes(`href="${href}"`)) {
        tagsToAdd.push(`    <link rel="modulepreload" crossorigin href="${href}" />`);
      }
    }
  }

  if (tagsToAdd.length > 0) {
    html = html.replace('</head>', `${tagsToAdd.join('\n')}\n  </head>`);
  }
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`[inline-critical-css] Inlined ${inlinedCount} stylesheet(s) into client/dist/index.html`);
