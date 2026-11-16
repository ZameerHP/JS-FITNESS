import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSiteContent } from '../../context/ContentContext';
import { useTier } from '../../lib/perfTier';
import { Magnetic } from './Magnetic';

export const WhatsAppFloat: React.FC = React.memo(() => {
  const { config } = useSiteContent();
  const tier = useTier();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Magnetic maxPull={6}>
        <a
          href={config.contact.whatsappUrl || 'https://wa.me/14037047021'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with JS FITNESS INC on WhatsApp"
          className="group relative flex h-13 w-13 min-h-[52px] min-w-[52px] items-center justify-center rounded-full bg-[#0B0B0C] border border-[#B6F500]/60 text-[#B6F500] shadow-[0_0_24px_rgba(182,245,0,0.3)] transition-colors duration-200 hover:bg-[#B6F500] hover:text-[#050505]"
        >
          {tier === 'high' && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1.5 rounded-full border border-[#B6F500]/45 pulse-ring-anim"
            />
          )}
          <MessageCircle className="w-6 h-6" />
        </a>
      </Magnetic>
    </div>
  );
});
