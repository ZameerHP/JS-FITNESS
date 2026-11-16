import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSiteContent } from '../../context/ContentContext';

export const AnnouncementBar: React.FC = () => {
  const { config } = useSiteContent();
  if (!config.announcement.enabled || !config.announcement.text) return null;

  return (
    <div className="relative z-50 bg-[#B6F500] text-[#050505] text-xs font-bold uppercase tracking-[0.08em] py-2 px-4 text-center">
      {config.announcement.link ? (
        <Link
          to={config.announcement.link}
          className="inline-flex items-center gap-2 hover:underline"
        >
          <span>{config.announcement.text}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <span>{config.announcement.text}</span>
      )}
    </div>
  );
};
