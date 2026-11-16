import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ContentProvider } from './context/ContentContext';
import { useLenis } from './hooks/useLenis';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { Preloader } from './components/layout/Preloader';
import { PageTransition } from './components/layout/PageTransition';
import { Navbar } from './components/layout/Navbar';
import { Marquee } from './components/layout/Marquee';
import { Footer } from './components/layout/Footer';
import { CustomCursor } from './components/ui/CustomCursor';
import { WhatsAppFloat } from './components/ui/WhatsAppFloat';
import { CalendlyModal } from './components/ui/CalendlyModal';
import { VideoModal } from './components/ui/VideoModal';
import { AnnouncementBar } from './components/ui/AnnouncementBar';

import { Home } from './pages/Home';
import { About } from './pages/About';
import { Membership } from './pages/Membership';
import { System } from './pages/System';
import { Transformations } from './pages/Transformations';
import { Contact } from './pages/Contact';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { NotFound } from './pages/NotFound';

const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const PerfHud = lazy(() => import('./components/ui/PerfHud'));

const PublicShell: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const showPerfHud =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('perf') === '1';
  const [preloaderDone, setPreloaderDone] = useState(false);

  useLenis();

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
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Global 4% film grain & ambient background */}
      <div aria-hidden="true" className="film-grain pointer-events-none fixed inset-0 z-[9970]" />

      <Preloader onComplete={() => setPreloaderDone(true)} />
      <ScrollProgress />
      <PageTransition />
      <CustomCursor />

      <AnnouncementBar />
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home preloaderDone={preloaderDone} />} />
          <Route path="/about" element={<About />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/system" element={<System />} />
          <Route path="/transformations" element={<Transformations />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Marquee />
      <Footer />

      <WhatsAppFloat />
      <CalendlyModal />
      <VideoModal />
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
          <PublicShell />
        </BrowserRouter>
      </ContentProvider>
    </HelmetProvider>
  );
}

export default App;
