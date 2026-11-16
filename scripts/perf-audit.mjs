import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { spawn } from 'child_process';
import { chromium } from 'playwright-core';
import lighthouse from 'lighthouse';

const ROOT = process.cwd();
const modeArg = process.argv.find((a) => a.startsWith('--mode='));
const MODE = modeArg ? modeArg.split('=')[1] : 'baseline';
const PORT = 4105;
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
  throw new Error('No Chromium/Chrome/Edge executable found');
}

function getBundleMetrics() {
  const assetsDir = path.join(ROOT, 'client', 'dist', 'assets');
  const htmlPath = path.join(ROOT, 'client', 'dist', 'index.html');
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';

  const files = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];
  let totalJsGzip = 0;
  let initialJsGzip = 0;
  let totalCssGzip = 0;
  const chunks = [];

  for (const f of files) {
    const full = path.join(assetsDir, f);
    const buf = fs.readFileSync(full);
    const gz = zlib.gzipSync(buf).length;
    const isAdmin = /AdminLayout/i.test(f);
    const isThree = /three|HeroParticles/i.test(f);
    const isEntryOrVendor = html.includes(f);

    chunks.push({
      file: f,
      rawKB: +(buf.length / 1024).toFixed(2),
      gzipKB: +(gz / 1024).toFixed(2),
      initial: isEntryOrVendor && !isAdmin && !isThree,
    });

    if (f.endsWith('.js')) {
      totalJsGzip += gz;
      if (isEntryOrVendor && !isAdmin && !isThree) {
        initialJsGzip += gz;
      }
    } else if (f.endsWith('.css')) {
      totalCssGzip += gz;
    }
  }

  const imagesDir = path.join(ROOT, 'client', 'public', 'images');
  const imgFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
  const images = imgFiles.map((f) => ({
    file: f,
    sizeKB: +(fs.statSync(path.join(imagesDir, f)).size / 1024).toFixed(2),
  }));

  return {
    initialJsGzipKB: +(initialJsGzip / 1024).toFixed(2),
    totalJsGzipKB: +(totalJsGzip / 1024).toFixed(2),
    totalCssGzipKB: +(totalCssGzip / 1024).toFixed(2),
    chunks: chunks.sort((a, b) => b.gzipKB - a.gzipKB),
    images: images.sort((a, b) => b.sizeKB - a.sizeKB),
  };
}

async function startProdServer() {
  const proc = spawn('node', ['dist/index.js'], {
    cwd: path.join(ROOT, 'server'),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(PORT),
      CLIENT_URL: BASE_URL,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server start timeout')), 10000);
    proc.stdout.on('data', (d) => {
      if (d.toString().includes('listening')) {
        clearTimeout(timeout);
        resolve();
      }
    });
    proc.stderr.on('data', (d) => {
      console.error('[server stderr]', d.toString());
    });
  });

  return proc;
}

async function captureReferenceScreenshots(browser) {
  const routes = ['/', '/about', '/membership', '/system', '/transformations', '/contact'];
  const viewports = [
    { name: '1440', width: 1440, height: 900 },
    { name: '768', width: 768, height: 1024 },
    { name: '390', width: 390, height: 844 },
  ];

  const outDir = path.join(ROOT, 'artifacts', 'screenshots', MODE);
  fs.mkdirSync(outDir, { recursive: true });

  const ctx = await browser.newContext();
  await ctx.addInitScript(() => {
    sessionStorage.setItem('js_preloader_seen', '1');
  });
  const page = await ctx.newPage();

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const r of routes) {
      const slug = r === '/' ? 'home' : r.slice(1);
      await page.goto(`${BASE_URL}${r}`, { waitUntil: 'load', timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(900);
      await page.screenshot({
        path: path.join(outDir, `${slug}-${vp.name}.png`),
        fullPage: false,
      });
    }
  }
  await ctx.close();
}

async function measureScrollAndHeap(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => {
    sessionStorage.setItem('js_preloader_seen', '1');
  });

  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);

  await cdp.send('Network.enable');
  // Fast 4G throttling: ~1.6 Mbps down, ~750 Kbps up, 150ms latency
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
    latency: 150,
  });

  let totalTransferBytes = 0;
  cdp.on('Network.loadingFinished', (e) => {
    totalTransferBytes += e.encodedDataLength || 0;
  });

  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.goto(`${BASE_URL}/?perf=1`, { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1400);

  // Measure frame deltas during steady top-to-bottom scroll under 4x CPU throttle
  const scrollReport = await page.evaluate(async () => {
    const frameDeltas = [];
    const longTasks = [];
    let obs;
    try {
      obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.duration > 50) longTasks.push(e.duration);
        }
      });
      obs.observe({ type: 'longtask', buffered: false });
    } catch {}

    let running = true;
    let prev = performance.now();
    const recordFrame = (now) => {
      frameDeltas.push(now - prev);
      prev = now;
      if (running) requestAnimationFrame(recordFrame);
    };
    requestAnimationFrame(recordFrame);

    const maxScroll = Math.max(2500, document.documentElement.scrollHeight - window.innerHeight);
    const steps = 65;
    for (let i = 1; i <= steps; i++) {
      window.scrollTo(0, Math.round((maxScroll * i) / steps));
      await new Promise((r) => setTimeout(r, 42));
    }
    await new Promise((r) => setTimeout(r, 400));
    running = false;
    obs?.disconnect();

    const valid = frameDeltas.slice(2);
    const over16 = valid.filter((d) => d > 16.7);
    const avgDelta = valid.reduce((a, b) => a + b, 0) / Math.max(1, valid.length);
    const maxDelta = Math.max(0, ...valid);

    return {
      totalFrames: valid.length,
      framesOver16_7ms: over16.length,
      pctOver16_7ms: +((over16.length / Math.max(1, valid.length)) * 100).toFixed(2),
      avgFps: +(1000 / Math.max(1, avgDelta)).toFixed(1),
      maxFrameMs: +maxDelta.toFixed(2),
      scrollLongTasks: longTasks.map((d) => +d.toFixed(1)),
      maxScrollLongTaskMs: longTasks.length ? +Math.max(...longTasks).toFixed(1) : 0,
      domNodeCount: document.querySelectorAll('*').length,
    };
  });

  // Reset CPU throttle for navigation heap test & extract HUD metrics
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const hudText = await page.locator('aside[aria-label="Performance Telemetry Overlay"]').innerText().catch(() => '');

  // Measure idle CPU over 1.5s static screen (long tasks + rAF work)
  const idleCheck = await page.evaluate(async () => {
    const start = performance.now();
    let count = 0;
    let active = true;
    const step = () => {
      count += 1;
      if (active) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    await new Promise((r) => setTimeout(r, 1000));
    active = false;
    return { durationMs: +(performance.now() - start).toFixed(1), rAFTicks: count };
  });

  // 10-loop route navigation heap leak check
  await cdp.send('Performance.enable');
  await cdp.send('HeapProfiler.enable');
  await cdp.send('HeapProfiler.collectGarbage');
  const m1 = await cdp.send('Performance.getMetrics');
  const startHeap = m1.metrics.find((m) => m.name === 'JSHeapUsedSize')?.value || 0;

  const navRoutes = ['/about', '/membership', '/system', '/transformations', '/contact', '/'];
  for (let loop = 0; loop < 3; loop++) {
    for (const r of navRoutes) {
      await page.goto(`${BASE_URL}${r}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(160);
    }
  }
  await cdp.send('HeapProfiler.collectGarbage');
  const m2 = await cdp.send('Performance.getMetrics');
  const endHeap = m2.metrics.find((m) => m.name === 'JSHeapUsedSize')?.value || 0;
  const heapGrowthPct = startHeap > 0 ? +(((endHeap - startHeap) / startHeap) * 100).toFixed(2) : 0;

  await ctx.close();

  return {
    initialTransferMB: +(totalTransferBytes / (1024 * 1024)).toFixed(2),
    scrollReport,
    idleCheck,
    heap: {
      startMB: +(startHeap / (1024 * 1024)).toFixed(2),
      endMB: +(endHeap / (1024 * 1024)).toFixed(2),
      growthPct: heapGrowthPct,
    },
    hudSnapshot: hudText.replace(/\n+/g, ' | '),
  };
}

async function runLighthouse(chromePath) {
  const { launch } = await import('chrome-launcher');
  const chrome = await launch({
    chromePath,
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
  });

  try {
    const result = await lighthouse(BASE_URL, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
      screenEmulation: {
        mobile: true,
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        disabled: false,
      },
    });
    const lhr = result.lhr;
    return {
      performanceScore: Math.round((lhr.categories.performance.score || 0) * 100),
      accessibilityScore: Math.round((lhr.categories.accessibility.score || 0) * 100),
      seoScore: Math.round((lhr.categories.seo.score || 0) * 100),
      lcpMs: Math.round(lhr.audits['largest-contentful-paint']?.numericValue || 0),
      cls: +(lhr.audits['cumulative-layout-shift']?.numericValue || 0).toFixed(4),
      tbtMs: Math.round(lhr.audits['total-blocking-time']?.numericValue || 0),
      fcpMs: Math.round(lhr.audits['first-contentful-paint']?.numericValue || 0),
      speedIndexMs: Math.round(lhr.audits['speed-index']?.numericValue || 0),
    };
  } finally {
    await chrome.kill();
  }
}

async function main() {
  const chromePath = findChromeExecutable();
  console.log(`Running ${MODE} audit using Chromium: ${chromePath}`);
  const bundleMetrics = getBundleMetrics();
  const serverProc = await startProdServer();

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-precise-memory-info'],
    });

    await captureReferenceScreenshots(browser);
    const runtimeMetrics = await measureScrollAndHeap(browser);

    let lh = null;
    try {
      lh = await runLighthouse(chromePath);
    } catch (e) {
      lh = { error: e.message };
    }

    const report = {
      mode: MODE,
      timestamp: new Date().toISOString(),
      bundleMetrics,
      runtimeMetrics,
      lighthouseMobile: lh,
    };

    const outDir = path.join(ROOT, 'artifacts');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `perf-${MODE}.json`), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser?.close();
    serverProc.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
