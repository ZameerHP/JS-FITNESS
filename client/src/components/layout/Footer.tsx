import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Youtube, Facebook } from 'lucide-react';
import { gsap } from '../../lib/gsap';
import { useSiteContent } from '../../context/ContentContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useTier } from '../../lib/perfTier';
import { JSLogo } from '../ui/JSLogo';
import { Magnetic } from '../ui/Magnetic';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.81a8.27 8.27 0 0 0 4.83 1.56V6.92a4.85 4.85 0 0 1-1.07-.23Z" />
  </svg>
);

export const Footer: React.FC = React.memo(() => {
  const { config } = useSiteContent();
  const plateRef = useRef<HTMLImageElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const tier = useTier();

  useEffect(() => {
    if (reducedMotion || tier === 'low' || !plateRef.current || !footerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(plateRef.current, {
        rotation: 90,
        ease: 'none',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, [reducedMotion, tier]);

  const socialItems = [
    { name: 'Instagram', href: config.socials.instagram, icon: <Instagram className="w-4 h-4" /> },
    { name: 'TikTok', href: config.socials.tiktok, icon: <TikTokIcon className="w-4 h-4" /> },
    { name: 'YouTube', href: config.socials.youtube, icon: <Youtube className="w-4 h-4" /> },
    { name: 'Facebook', href: config.socials.facebook, icon: <Facebook className="w-4 h-4" /> },
  ];

  return (
    <footer
      ref={footerRef}
      className="cv-section relative overflow-hidden bg-[#050505] pt-12 pb-8"
    >
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#B6F500] to-transparent shadow-[0_0_24px_rgba(182,245,0,0.75)]"
      />

      <img
        ref={plateRef}
        src="/images/plate.webp"
        width={650}
        height={559}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none hidden md:block absolute -right-24 top-1/2 -translate-y-1/2 w-56 h-56 object-contain opacity-65 select-none"
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 pb-10">
          <div className="lg:pr-8 flex flex-col justify-center">
            <Link to="/" aria-label="JS FITNESS INC Home">
              <JSLogo size="md" />
            </Link>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8C8C8C]">
              MORE THAN JUST A GYM
            </p>
          </div>

          <div className="lg:px-8 lg:border-l lg:border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3 text-xs text-[#C9C9C9]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B6F500] shrink-0 mt-0.5" />
                <span>{config.contact.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B6F500] shrink-0" />
                <a
                  href={`tel:${config.contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="hover:text-[#B6F500] transition-colors"
                >
                  {config.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B6F500] shrink-0" />
                <a
                  href={`mailto:${config.contact.email}`}
                  className="hover:text-[#B6F500] transition-colors break-all"
                >
                  {config.contact.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:px-8 lg:border-l lg:border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Follow Us</h3>
            <div className="flex items-center gap-3">
              {socialItems.map((item) => (
                <Magnetic key={item.name} maxPull={6}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow Jatinder Singh on ${item.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#B6F500]/45 bg-white/[0.03] text-white hover:bg-[#B6F500] hover:text-[#050505] transition-colors duration-200"
                  >
                    {item.icon}
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>

          <div className="lg:pl-8 lg:border-l lg:border-white/10">
            <h3 className="text-sm font-bold text-white mb-4">Hours</h3>
            <div className="space-y-2 text-xs text-[#C9C9C9]">
              <p className="text-white font-medium">{config.hours.gymAccess}</p>
              <p>{config.hours.personalTraining}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-full border border-[#B6F500]/35 bg-white/[0.02] px-6 py-3 text-[11px] text-[#8C8C8C]">
          <span>{config.brand.copyright}</span>
          <div className="flex items-center gap-3">
            <Link to="/privacy" className="hover:text-[#B6F500] transition-colors">
              Privacy Policy
            </Link>
            <span aria-hidden="true">|</span>
            <Link to="/terms" className="hover:text-[#B6F500] transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});
