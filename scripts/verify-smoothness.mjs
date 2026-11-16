import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const PORT = 4106;
const BASE_URL = `http://localhost:${PORT}`;

function findChromeExecutable() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  const pwRoot = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (fs.existsSync(pwRoot)) {
    const dirs = fs.readdirSync(pwRoot).filter((d) => d.startsWith('chromium-'));
    for (const d of dirs) {
      candidates.unshift(path.join(pwRoot, d, 'chrome-win64', 'chrome.exe'));
    }
  }
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No Chromium executable found');
}

async function startProdServer() {
  const proc = spawn('node', ['dist/index.js'], {
    cwd: path.join(ROOT, 'server'),
    env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT), CLIENT_URL: BASE_URL },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Server start timeout')), 10000);
    proc.stdout.on('data', (d) => {
      if (d.toString().includes('listening')) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
  return proc;
}

function checkBundlesAndHeroImages() {
  const assetsDir = path.join(ROOT, 'client', 'dist', 'assets');
  const html = fs.readFileSync(path.join(ROOT, 'client', 'dist', 'index.html'), 'utf8');
  const files = fs.readdirSync(assetsDir);

  let initialJsGzip = 0;
  let totalCssGzip = 0;
  for (const f of files) {
    const gz = zlib.gzipSync(fs.readFileSync(path.join(assetsDir, f))).length;
    if (f.endsWith('.js')) {
      const isAdmin = /AdminLayout/i.test(f);
      const isThree = /three|HeroParticles/i.test(f);
      if (html.includes(f) && !isAdmin && !isThree) initialJsGzip += gz;
    } else if (f.endsWith('.css')) {
      totalCssGzip += gz;
    }
  }

  const imagesDir = path.join(ROOT, 'client', 'public', 'images');
  const heroAthleteKB = fs.statSync(path.join(imagesDir, 'hero-athlete.webp')).size / 1024;
  const heroBgKB = fs.statSync(path.join(imagesDir, 'hero-bg.webp')).size / 1024;

  return {
    initialJsGzipKB: +(initialJsGzip / 1024).toFixed(2),
    totalCssGzipKB: +(totalCssGzip / 1024).toFixed(2),
    heroAthleteKB: +heroAthleteKB.toFixed(2),
    heroBgKB: +heroBgKB.toFixed(2),
  };
}

async function main() {
  const bundleCheck = checkBundlesAndHeroImages();
  const chromePath = findChromeExecutable();
  const server = await startProdServer();
  const consoleErrors = [];

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-precise-memory-info'],
    });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => consoleErrors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text());
    });

    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    let initialBytes = 0;
    cdp.on('Network.loadingFinished', (e) => {
      initialBytes += e.encodedDataLength || 0;
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    const initialTransferMB = +(initialBytes / (1024 * 1024)).toFixed(2);

    // 4x CPU throttled Home scroll smoothness check
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const scrollStats = await page.evaluate(async () => {
      const deltas = [];
      const longTasks = [];
      let obs;
      try {
        obs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) longTasks.push(entry.duration);
          }
        });
        obs.observe({ type: 'longtask', buffered: false });
      } catch {}

      const maxY = Math.max(2500, document.documentElement.scrollHeight - window.innerHeight);
      await new Promise((resolve) => {
        let prev = performance.now();
        const start = prev;
        const duration = 2400;
        const step = (now) => {
          deltas.push(now - prev);
          prev = now;
          const p = Math.min(1, (now - start) / duration);
          window.scrollTo(0, Math.round(maxY * p));
          if (p < 1) requestAnimationFrame(step);
          else setTimeout(resolve, 250);
        };
        requestAnimationFrame(step);
      });
      obs?.disconnect();

      const valid = deltas.slice(2);
      const over16 = valid.filter((d) => d > 16.7).length;
      const avg = valid.reduce((a, b) => a + b, 0) / Math.max(1, valid.length);
      return {
        pctOver16_7ms: +((over16 / Math.max(1, valid.length)) * 100).toFixed(2),
        avgFps: +(1000 / Math.max(1, avg)).toFixed(1),
        longTasksCount: longTasks.length,
        maxLongTaskMs: longTasks.length ? +Math.max(...longTasks).toFixed(1) : 0,
      };
    });

    // Interaction responsiveness check
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    const clickLatencyMs = await page.evaluate(async () => {
      const link = document.querySelector('header nav a[href="/membership"]');
      const t0 = performance.now();
      link?.click();
      await new Promise((r) => requestAnimationFrame(() => r()));
      return +(performance.now() - t0).toFixed(2);
    });
    await page.waitForTimeout(250);

    // 1 warmup pass so lazy route ES modules are cached before measuring leak growth across 10 loops
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);
    const routes = ['/about', '/membership', '/system', '/transformations', '/contact', '/'];
    for (const href of routes) {
      if (href === '/') await page.locator('header a[aria-label="JS FITNESS INC Home"]').click();
      else await page.locator(`header nav a[href="${href}"]`).click();
      await page.waitForTimeout(120);
    }

    // 10-loop SPA navigation heap leak test
    await cdp.send('Performance.enable');
    await cdp.send('HeapProfiler.enable');
    await cdp.send('HeapProfiler.collectGarbage');
    const h1 = (await cdp.send('Performance.getMetrics')).metrics.find(
      (m) => m.name === 'JSHeapUsedSize'
    )?.value || 0;

    for (let i = 0; i < 10; i++) {
      for (const href of routes) {
        if (href === '/') await page.locator('header a[aria-label="JS FITNESS INC Home"]').click();
        else await page.locator(`header nav a[href="${href}"]`).click();
        await page.waitForTimeout(70);
      }
    }
    await page.waitForTimeout(250);
    await cdp.send('HeapProfiler.collectGarbage');
    const h2 = (await cdp.send('Performance.getMetrics')).metrics.find(
      (m) => m.name === 'JSHeapUsedSize'
    )?.value || 0;
    const heapGrowthPct = h1 > 0 ? +(((h2 - h1) / h1) * 100).toFixed(2) : 0;

    // Static idle test (1.5s)
    const idleTasks = await page.evaluate(async () => {
      const tasks = [];
      let obs;
      try {
        obs = new PerformanceObserver((list) => {
          for (const e of list.getEntries()) if (e.duration > 50) tasks.push(e.duration);
        });
        obs.observe({ type: 'longtask', buffered: false });
      } catch {}
      await new Promise((r) => setTimeout(r, 1500));
      obs?.disconnect();
      return tasks.length;
    });

    const checks = [
      ['initialJsGzipKB < 180', bundleCheck.initialJsGzipKB < 180, `${bundleCheck.initialJsGzipKB} KB`],
      ['totalCssGzipKB < 40', bundleCheck.totalCssGzipKB < 40, `${bundleCheck.totalCssGzipKB} KB`],
      ['heroAthleteKB < 150', bundleCheck.heroAthleteKB < 150, `${bundleCheck.heroAthleteKB} KB`],
      ['heroBgKB < 150', bundleCheck.heroBgKB < 150, `${bundleCheck.heroBgKB} KB`],
      ['initialTransferMB < 1.5', initialTransferMB < 1.5, `${initialTransferMB} MB`],
      ['4x CPU scroll pctOver16_7ms < 2%', scrollStats.pctOver16_7ms < 2, `${scrollStats.pctOver16_7ms}% (${scrollStats.avgFps} fps)`],
      ['4x CPU scroll longTasks == 0', scrollStats.longTasksCount === 0, `${scrollStats.longTasksCount} (max ${scrollStats.maxLongTaskMs}ms)`],
      ['clickLatencyMs < 200', clickLatencyMs < 200, `${clickLatencyMs} ms`],
      ['10-loop heapGrowthPct < 10%', heapGrowthPct < 10, `${heapGrowthPct}%`],
      ['idle longTasks == 0', idleTasks === 0, `${idleTasks}`],
      ['zero console/page errors', consoleErrors.length === 0, `${consoleErrors.length}`],
    ];

    console.log('\n=== JS FITNESS Smoothness Verification ===');
    let failed = 0;
    for (const [label, ok, val] of checks) {
      console.log(`${ok ? '[PASS]' : '[FAIL]'} ${label}: ${val}`);
      if (!ok) failed += 1;
    }

    if (consoleErrors.length) {
      console.error('Console errors:', consoleErrors);
    }
    if (failed > 0) process.exitCode = 1;
  } finally {
    await browser?.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
