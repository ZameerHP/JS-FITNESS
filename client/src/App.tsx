import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LazyMotion, domAnimation } from 'framer-motion';
import { ContentProvider, useSiteContent } from './context/ContentContext';
import { useLenis } from './hooks/useLenis';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { Preloader } from './components/layout/Preloader';
import { PageTransition } from './components/layout/PageTransition';
import { Navbar } from './components/layout/Navbar';
import { Marquee } from './components/layout/Marquee';
import { Footer } from './components/layout/Footer';
import { CustomCursor } from './components/ui/CustomCursor';
import { WhatsAppFloat } from './components/ui/WhatsAppFloat';
import { VideoModal } from './components/ui/VideoModal';
import { AnnouncementBar } from './components/ui/AnnouncementBar';
import { Home } from './pages/Home';

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
  const location = useLocation();
  const { activeCalendly } = useSiteContent();
  const isAdmin = location.pathname.startsWith('/admin');
  const showPerfHud =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('perf') === '1';
  const [preloaderDone, setPreloaderDone] = useState(false);

  useLenis();

  // Idle-time prefetch of most likely secondary pages (Membership & System)
  useEffect(() => {
    if (!preloaderDone || isAdmin) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const run = () => {
      prefetchRoute('/membership');
      prefetchRoute('/system');
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(run, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(run, 1500);
    return () => clearTimeout(t);
  }, [preloaderDone, isAdmin]);

  const handlePrefetchCalendly = useCallback(() => {
    void loadCalendlyModal();
  }, []);

  if (isAdmin) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#B6F500]">
            Loading Admin Console...
          </div>
        }
      >
        <Routes>
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="relative min-h-screen bg-[#050505] text-white">
        <div aria-hidden="true" className="film-grain pointer-events-none fixed inset-0 z-[9970]" />

        <Preloader onComplete={() => setPreloaderDone(true)} />
        <ScrollProgress />
        <PageTransition />
        <CustomCursor />

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
        <VideoModal />
        {showPerfHud && (
          <Suspense fallback={null}>
            <PerfHud />
          </Suspense>
        )}
      </div>
    </LazyMotion>
  );
};

export function App() {
  return (
    <HelmetProvider>
      <ContentProvider>
        <BrowserRouter>
          <PublicShell />
        </BrowserRouter>
      </ContentProvider>
    </HelmetProvider>
  );
}

export default App;
