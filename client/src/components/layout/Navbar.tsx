import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../../config/siteConfig';
import { useSiteContent } from '../../context/ContentContext';
import { subscribeScroll } from '../../hooks/useLenis';
import { JSLogo } from '../ui/JSLogo';
import { Button } from '../ui/Button';

interface NavbarProps {
  onPrefetchRoute?: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({ onPrefetchRoute }) => {
  const location = useLocation();
  const { openBooking } = useSiteContent();
  const headerRef = useRef<HTMLElement>(null);
  const mobileOpenRef = useRef(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    let isScrolled = false;
    let isHidden = false;

    const applyClasses = () => {
      const el = headerRef.current;
      if (!el) return;
      el.classList.toggle('-translate-y-full', isHidden && !mobileOpenRef.current);
      el.classList.toggle('translate-y-0', !isHidden || mobileOpenRef.current);
      el.classList.toggle('navbar-scrolled', isScrolled);
    };

    return subscribeScroll((y) => {
      const nextScrolled = y > 36;
      let nextHidden = isHidden;
      if (y > 140 && y > lastY + 8) nextHidden = true;
      else if (y < lastY - 6 || y < 80) nextHidden = false;
      lastY = y;

      if (nextScrolled !== isScrolled || nextHidden !== isHidden) {
        isScrolled = nextScrolled;
        isHidden = nextHidden;
        applyClasses();
      }
    });
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 h-[72px] translate-y-0 bg-transparent border-b border-transparent transition-[transform,background-color,border-color] duration-300"
      >
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <Link to="/" className="shrink-0">
            <JSLogo size="sm" />
          </Link>

          <nav aria-label="Main navigation" className="hidden min-[820px]:flex items-center gap-4 lg:gap-7">
            {NAV_LINKS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => onPrefetchRoute?.(item.path)}
                  onTouchStart={() => onPrefetchRoute?.(item.path)}
                  className={`relative py-2 text-[11px] lg:text-[12px] font-medium tracking-[0.02em] whitespace-nowrap transition-colors ${
                    isActive ? 'text-[#B6F500]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-[#B6F500] shadow-[0_0_8px_#B6F500]" />
                  )}
                </Link>
              );
            })}
          </nav>

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

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#050505] flex flex-col justify-between pt-24 pb-10 px-6 min-[820px]:hidden overflow-y-auto transition-opacity duration-200">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block font-display italic font-black text-4xl uppercase tracking-tight py-1.5 ${
                      isActive ? 'text-[#B6F500]' : 'text-white hover:text-[#B6F500]'
                    }`}
                  >
                    {item.label}
                  </Link>
                </div>
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
        </div>
      )}
    </>
  );
});
