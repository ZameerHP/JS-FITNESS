import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSiteContent } from '../../context/ContentContext';
import { Magnetic } from './Magnetic';

export const WhatsAppFloat: React.FC = () => {
  const { config } = useSiteContent();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Magnetic maxPull={6}>
        <a
          href={config.contact.whatsappUrl || 'https://wa.me/14037047021'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with JS FITNESS INC on WhatsApp"
          className="group relative flex h-13 w-13 min-h-[52px] min-w-[52px] items-center justify-center rounded-full bg-[#0B0B0C] border border-[#B6F500]/60 text-[#B6F500] shadow-lime transition-all duration-300 hover:bg-[#B6F500] hover:text-[#050505]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-1.5 rounded-full border border-[#B6F500]/50 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"
          />
          <MessageCircle className="w-6 h-6" />
        </a>
      </Magnetic>
    </div>
  );
};
