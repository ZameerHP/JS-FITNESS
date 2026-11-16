import React, { useEffect } from 'react';
import { PopupModal } from 'react-calendly';
import { ExternalLink, X } from 'lucide-react';
import { useSiteContent } from '../../context/ContentContext';

export const CalendlyModal: React.FC = () => {
  const { activeCalendly, closeBooking } = useSiteContent();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeCalendly.open) closeBooking();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeCalendly.open, closeBooking]);

  if (!activeCalendly.open || !activeCalendly.url) return null;

  const themedUrl = (() => {
    try {
      const urlObj = new URL(activeCalendly.url);
      urlObj.searchParams.set('primary_color', 'b6f500');
      urlObj.searchParams.set('background_color', '0a0a0a');
      urlObj.searchParams.set('text_color', 'ffffff');
      return urlObj.toString();
    } catch {
      return activeCalendly.url;
    }
  })();

  const rootElement = document.getElementById('root') || document.body;

  return (
    <>
      <PopupModal
        url={themedUrl}
        onModalClose={closeBooking}
        open={activeCalendly.open}
        rootElement={rootElement}
        pageSettings={{
          backgroundColor: '0a0a0a',
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: 'b6f500',
          textColor: 'ffffff',
        }}
      />
      {/* Fallback bar if popup is blocked or user prefers a direct new tab */}
      <div className="fixed bottom-5 left-1/2 z-[10000] -translate-x-1/2 flex items-center gap-3 rounded-full glass-panel-lime px-4 py-2 text-xs text-white shadow-lime">
        <span>
          {activeCalendly.kind === 'tour'
            ? 'Free Gym Tour Scheduler'
            : 'Strategy Assessment ($99.99 CAD)'}
        </span>
        <a
          href={themedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-[#B6F500] hover:underline"
        >
          Open in new tab <ExternalLink className="w-3 h-3" />
        </a>
        <button
          type="button"
          onClick={closeBooking}
          aria-label="Close scheduler overlay"
          className="rounded-full p-1 text-white/70 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};
