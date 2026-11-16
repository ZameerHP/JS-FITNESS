import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ContentProvider, useSiteContent } from './context/ContentContext';
import { useLenis } from './hooks/useLenis';
import { hasHardwareWebGL, startPerfWatchdog, useTier } from './lib/perfTier';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { Navbar } from './components/layout/Navbar';
import { Marquee } from './components/layout/Marquee';
import { Footer } from './components/layout/Footer';
import { WhatsAppFloat } from './components/ui/WhatsAppFloat';
import { AnnouncementBar } from './components/ui/AnnouncementBar';
import { Home } from './pages/Home';

const Preloader = lazy(() =>
  import('./components/layout/Preloader').then((m) => ({ default: m.Preloader }))
);
const PageTransition = lazy(() =>
  import('./components/layout/PageTransition').then((m) => ({ default: m.PageTransition }))
);
const CustomCursor = lazy(() =>
  import('./components/ui/CustomCursor').then((m) => ({ default: m.CustomCursor }))
);
const VideoModal = lazy(() =>
  import('./components/ui/VideoModal').then((m) => ({ default: m.VideoModal }))
);

const loadAbout = () => import('./pages/About').then((m) => ({ default: m.About }));
const loadMembership = () => import('./pages/Membership').then((m) => ({ default: m.Membership }));
const loadSystem = () => import('./pages/System').then((m) => ({ default: m.System }));
const loadTransformations = () =>
  import('./pages/Transformations').then((m) => ({ default: m.Transformations }));
const loadContact = () => import('./pages/Contact').then((m) => ({ default: m.Contact }));
const loadPrivacy = () => import('./pages/Privacy').then((m) => ({ default: m.Privacy }));
const loadTerms = () => import('./pages/Terms').then((m) => ({ default: m.Terms }));
const loadNotFound = () => import('./pages/NotFound').then((m) => ({ default: m.NotFound }));

const About = lazy(loadAbout);
const Membership = lazy(loadMembership);
const System = lazy(loadSystem);
const Transformations = lazy(loadTransformations);
const Contact = lazy(loadContact);
const Privacy = lazy(loadPrivacy);
const Terms = lazy(loadTerms);
const NotFound = lazy(loadNotFound);

const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const PerfHud = lazy(() => import('./components/ui/PerfHud'));
const loadCalendlyModal = () =>
  import('./components/ui/CalendlyModal').then((m) => ({ default: m.CalendlyModal }));
const CalendlyModal = lazy(loadCalendlyModal);

const prefetchedRoutes = new Set<string>();
function prefetchRoute(path: string) {
  if (prefetchedRoutes.has(path)) return;
  prefetchedRoutes.add(path);
  if (path === '/about') void loadAbout();
  else if (path === '/membership') void loadMembership();
  else if (path === '/system') void loadSystem();
  else if (path === '/transformations') void loadTransformations();
  else if (path === '/contact') void loadContact();
}

const PublicShell: React.FC = () => {
  const { activeCalendly, videoModalOpen } = useSiteContent();
  const tier = useTier();
  const isHighTier = tier === 'high' && !navigator.webdriver;
  const showPerfHud =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('perf') === '1';
  const [preloaderDone, setPreloaderDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (sessionStorage.getItem('js_preloader_seen')) return true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    const t = document.documentElement.dataset.perf || 'high';
    return t !== 'high' || !hasHardwareWebGL();
  });

  useLenis();

  useEffect(() => {
    if (preloaderDone && isHighTier) {
      startPerfWatchdog();
    }
  }, [preloaderDone, isHighTier]);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  const handlePrefetchCalendly = useCallback(() => {
    void loadCalendlyModal();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
        <div aria-hidden="true" className="film-grain pointer-events-none fixed inset-0 z-[9970]" />

        {!preloaderDone && (
          <Suspense fallback={null}>
            <Preloader onComplete={handlePreloaderComplete} />
          </Suspense>
        )}
        <ScrollProgress />
        {isHighTier && (
          <Suspense fallback={null}>
            <PageTransition />
            <CustomCursor />
          </Suspense>
        )}

        <AnnouncementBar />
        <Navbar onPrefetchRoute={prefetchRoute} />

        <main>
          <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <Routes>
              <Route
                path="/"
                element={<Home preloaderDone={preloaderDone} onPrefetchCalendly={handlePrefetchCalendly} />}
              />
              <Route path="/about" element={<About />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/system" element={<System />} />
              <Route path="/transformations" element={<Transformations />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Marquee />
        <Footer />

        <WhatsAppFloat />
        {activeCalendly.open && (
          <Suspense fallback={null}>
            <CalendlyModal />
          </Suspense>
        )}
        {videoModalOpen && (
          <Suspense fallback={null}>
            <VideoModal />
          </Suspense>
        )}
        {showPerfHud && (
          <Suspense fallback={null}>
            <PerfHud />
          </Suspense>
        )}
      </div>
  );
};

export function App() {
  return (
    <HelmetProvider>
      <ContentProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/admin/*"
              element={
                <Suspense
                  fallback={
                    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#B6F500]">
                      Loading Admin Console...
                    </div>
                  }
                >
                  <AdminLayout />
                </Suspense>
              }
            />
            <Route path="/*" element={<PublicShell />} />
          </Routes>
        </BrowserRouter>
      </ContentProvider>
    </HelmetProvider>
  );
}

export default App;
