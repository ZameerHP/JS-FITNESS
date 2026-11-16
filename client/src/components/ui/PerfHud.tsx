import React, { useEffect, useState } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { gsap, ScrollTrigger } from '../../lib/gsap';

interface PerfStats {
  fps: number;
  tweens: number;
  triggers: number;
  tier: string;
  lcp: string;
  cls: string;
  inp: string;
  tbt: string;
  longTasks: number;
}

export const PerfHud: React.FC = () => {
  const [stats, setStats] = useState<PerfStats>({
    fps: 60,
    tweens: 0,
    triggers: 0,
    tier: document.documentElement.dataset.perf || 'high',
    lcp: '-',
    cls: '0.000',
    inp: '-',
    tbt: '0 ms',
    longTasks: 0,
  });

  useEffect(() => {
    let totalBlockingTime = 0;
    let longTaskCount = 0;

    const reportMetric = (name: string, val: number, formatted: string) => {
      console.info(`[PerfHUD] ${name}: ${formatted} (${val})`);
    };

    onLCP((m) => {
      const s = `${Math.round(m.value)} ms`;
      reportMetric('LCP', m.value, s);
      setStats((prev) => ({ ...prev, lcp: s }));
    });

    onCLS((m) => {
      const s = m.value.toFixed(3);
      reportMetric('CLS', m.value, s);
      setStats((prev) => ({ ...prev, cls: s }));
    });

    onINP((m) => {
      const s = `${Math.round(m.value)} ms`;
      reportMetric('INP', m.value, s);
      setStats((prev) => ({ ...prev, inp: s }));
    });

    onFCP((m) => reportMetric('FCP', m.value, `${Math.round(m.value)} ms`));
    onTTFB((m) => reportMetric('TTFB', m.value, `${Math.round(m.value)} ms`));

    let observer: PerformanceObserver | null = null;
    if ('PerformanceObserver' in window) {
      try {
        observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              totalBlockingTime += entry.duration - 50;
              longTaskCount += 1;
            }
          }
          const s = `${Math.round(totalBlockingTime)} ms`;
          setStats((prev) => ({ ...prev, tbt: s, longTasks: longTaskCount }));
        });
        observer.observe({ type: 'longtask', buffered: true });
      } catch {
        // longtask unsupported
      }
    }

    let frames = 0;
    let last = performance.now();
    let rafId = 0;

    const loop = () => {
      frames += 1;
      const now = performance.now();
      if (now - last >= 500) {
        const fps = Math.round((frames * 1000) / (now - last));
        const activeTweens = gsap.globalTimeline
          .getChildren(true, true, false)
          .filter((t) => t.isActive()).length;
        const triggers = ScrollTrigger.getAll().length;
        const tier = document.documentElement.dataset.perf || 'high';
        setStats((prev) => ({
          ...prev,
          fps,
          tweens: activeTweens,
          triggers,
          tier,
        }));
        frames = 0;
        last = now;
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, []);

  return (
    <aside
      aria-label="Performance Telemetry Overlay"
      className="fixed bottom-4 left-4 z-[9999] rounded-2xl border border-[#B6F500]/50 bg-[#050505]/90 px-4 py-3 text-[11px] font-mono text-white shadow-2xl pointer-events-none select-none min-w-[220px]"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
        <span className="font-bold text-[#B6F500]">PERF HUD (?perf=1)</span>
        <span className="uppercase px-1.5 py-0.5 rounded bg-white/10 text-[10px]">
          tier: {stats.tier}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <span className="text-white/60">FPS</span>
        <span className={stats.fps >= 55 ? 'text-[#B6F500] font-bold' : 'text-red-400 font-bold'}>
          {stats.fps}
        </span>
        <span className="text-white/60">GSAP Tweens</span>
        <span>{stats.tweens}</span>
        <span className="text-white/60">ScrollTriggers</span>
        <span>{stats.triggers}</span>
        <span className="text-white/60">LCP</span>
        <span>{stats.lcp}</span>
        <span className="text-white/60">CLS</span>
        <span>{stats.cls}</span>
        <span className="text-white/60">INP</span>
        <span>{stats.inp}</span>
        <span className="text-white/60">TBT ({stats.longTasks})</span>
        <span>{stats.tbt}</span>
      </div>
    </aside>
  );
};

export default PerfHud;
