import React from 'react';
import { useSiteContent } from '../../context/ContentContext';
import { Magnetic } from './Magnetic';
import { WhatsAppIcon } from './Icons';

export const WhatsAppFloat: React.FC = React.memo(() => {
  const { config } = useSiteContent();
  const rawUrl = (config.contact.whatsappUrl || '').trim();
  const digits = (config.contact.whatsappNumber || '14037047021').replace(/[^0-9]/g, '');
  const href = rawUrl || `https://wa.me/${digits.startsWith('1') ? digits : `1${digits}`}`;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Magnetic maxPull={6}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with JS FITNESS INC on WhatsApp"
          title="WhatsApp JS FITNESS INC (403-704-7021)"
          className="group whatsapp-breathe relative flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#0B0B0C] border-[1.5px] border-[#B6F500]/70 text-[#B6F500] transition-colors duration-200 hover:bg-[#B6F500] hover:text-[#050505]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1.5 rounded-full border border-[#B6F500]/45 whatsapp-pulse-ring"
          />
          <WhatsAppIcon className="relative z-10 w-6 h-6" />
        </a>
      </Magnetic>
    </div>
  );
});
