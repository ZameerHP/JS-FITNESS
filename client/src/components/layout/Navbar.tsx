import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../../config/siteConfig';
import { useSiteContent } from '../../context/ContentContext';
import { JSLogo } from '../ui/JSLogo';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { openBooking, transformations } = useSiteContent();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.path === '/transformations' && transformations.length === 0) {
      return true; // Route still reachable; or let user navigate
    }
    return true;
  });

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 36);
      if (y > 140 && y > lastY + 8) {
        setHidden(true);
      } else if (y < lastY - 6 || y < 80) {
        setHidden(false);
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${
          hidden && !mobileOpen ? '-translate-y-full' : 'translate-y-0'
        } ${
          scrolled
            ? 'bg-[#050505]/75 backdrop-blur-xl border-b border-[#B6F500]/20 shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Link to="/" aria-label="JS FITNESS INC Home" className="shrink-0">
            <JSLogo size="sm" />
          </Link>

          {/* Center nav links */}
          <nav aria-label="Main navigation" className="hidden min-[820px]:flex items-center gap-4 lg:gap-7">
            {visibleLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative py-2 text-[11px] lg:text-[12px] font-medium tracking-[0.02em] whitespace-nowrap transition-colors ${
                    isActive ? 'text-[#B6F500]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-[#B6F500] shadow-[0_0_10px_#B6F500]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA & Mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Button variant="nav" onClick={() => openBooking('tour')}>
                BOOK NOW
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="min-[820px]:hidden flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white hover:border-[#B6F500] hover:text-[#B6F500] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Menu with Lime Wipe */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            exit={{ clipPath: 'inset(0 0 0 100%)' }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 bg-[#050505] flex flex-col justify-between pt-24 pb-10 px-6 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-3">
              {visibleLinks.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.055, duration: 0.35 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block font-display italic font-black text-4xl uppercase tracking-tight py-1.5 ${
                        isActive ? 'text-[#B6F500]' : 'text-white hover:text-[#B6F500]'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col gap-3">
              <Button variant="primary" onClick={() => { setMobileOpen(false); openBooking('tour'); }}>
                BOOK YOUR FREE GYM TOUR
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setMobileOpen(false);
                  openBooking('assessment');
                }}
              >
                STRATEGY ASSESSMENT — $99.99 CAD
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
