import React from 'react';
import { Dumbbell } from 'lucide-react';
import { EquipmentIconKey } from '../../config/siteConfig';

interface IconProps {
  className?: string;
}

/**
 * Official WhatsApp bubble + phone handset mark matched to a clean 1.85px icon silhouette.
 */
export const WhatsAppIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.85"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20.5 11.5a8.5 8.5 0 0 1-12.5 7.5L3.5 20.5l1.5-4.3A8.5 8.5 0 1 1 20.5 11.5Z" />
    <path
      d="M9.6 8.3c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.8 2.1.8 2.6.7 3 .6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.5-.3l-1.5-.7c-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.1.1-.3.2-.5.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.5-1.4-1.8-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5l-.7-1.6Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

/**
 * TikTok note glyph styled as a 1.85px stroke icon to match Instagram/YouTube/Facebook in the footer.
 */
export const TikTokIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.85"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

/**
 * 11 distinct commercial gym equipment icons using unified 1.85px stroke weight & rounded caps.
 */
export const EquipmentIcon: React.FC<{ name: EquipmentIconKey; className?: string }> = ({
  name,
  className = 'w-5 h-5',
}) => {
  const strokeProps = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.85,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'smith':
      return (
        <svg {...strokeProps}>
          <path d="M5 4v16" />
          <path d="M19 4v16" />
          <path d="M3 20h4" />
          <path d="M17 20h4" />
          <path d="M2 11h20" />
          <rect x="4" y="8.5" width="2.2" height="5" rx="0.6" />
          <rect x="17.8" y="8.5" width="2.2" height="5" rx="0.6" />
        </svg>
      );
    case 'squat':
      return (
        <svg {...strokeProps}>
          <path d="M6 20V5" />
          <path d="M18 20V5" />
          <path d="M4 20h16" />
          <path d="M2.5 8.5h19" />
          <path d="M4 6v5" />
          <path d="M20 6v5" />
          <path d="M12 13v4" />
        </svg>
      );
    case 'dumbbells':
      return <Dumbbell className={className} strokeWidth={1.85} aria-hidden="true" />;
    case 'cables':
      return (
        <svg {...strokeProps}>
          <path d="M4 4v16" />
          <path d="M20 4v16" />
          <path d="M4 5h16" />
          <path d="M4 6l6.5 7.5" />
          <path d="M20 6l-6.5 7.5" />
          <circle cx="12" cy="14.5" r="2" />
        </svg>
      );
    case 'chest':
      return (
        <svg {...strokeProps}>
          <path d="M5 17h14" />
          <path d="M7.5 17v3.5" />
          <path d="M16.5 17v3.5" />
          <path d="M3.5 9h17" />
          <path d="M5.5 6.5v5" />
          <path d="M18.5 6.5v5" />
          <path d="M12 13V9" />
          <path d="m10 11 2-2 2 2" />
        </svg>
      );
    case 'lat':
      return (
        <svg {...strokeProps}>
          <path d="M12 4v6" />
          <path d="M4.5 12c2.5-1.8 12.5-1.8 15 0" />
          <path d="M12 15.5V20" />
          <path d="M8.5 20h7" />
          <path d="m9.5 15 2.5 2.5L14.5 15" />
        </svg>
      );
    case 'rows':
      return (
        <svg {...strokeProps}>
          <path d="M4 18.5h16" />
          <path d="M5.5 18.5V6.5" />
          <path d="M5.5 11.5h9" />
          <path d="M14.5 8.5v6" />
          <path d="m17.5 9.5 2 2-2 2" />
        </svg>
      );
    case 'legpress':
      return (
        <svg {...strokeProps}>
          <path d="M4 19.5h16" />
          <path d="M5 19.5 9.5 12H16" />
          <path d="m14 5.5 5 5.5" />
          <path d="m10.5 11 4.5-3.5" />
          <circle cx="17.5" cy="9.5" r="1.5" />
        </svg>
      );
    case 'glutes':
      return (
        <svg {...strokeProps}>
          <path d="M5 19.5h14" />
          <path d="M6.5 16h11" />
          <path d="M8 16v3.5" />
          <path d="M16 16v3.5" />
          <path d="M3 10.5c5.5-2.5 12.5-2.5 18 0" />
          <circle cx="4.5" cy="10.5" r="2" />
          <circle cx="19.5" cy="10.5" r="2" />
        </svg>
      );
    case 'treadmill':
      return (
        <svg {...strokeProps}>
          <path d="M3 18.5h14.5l3 1.5H4.5Z" />
          <path d="M15.5 18.5 19 6.5h-2.5" />
          <path d="M19 6.5 16 9" />
          <path d="M6.5 14h6.5" />
          <path d="m11 12 2 2-2 2" />
        </svg>
      );
    case 'stairmaster':
      return (
        <svg {...strokeProps}>
          <path d="M4 19.5h4V16h4v-3.5h4V9h4" />
          <path d="M5.5 12 13 6.5h4.5V12" />
          <path d="m10 8 2-2.5 2 1" />
        </svg>
      );
  }
};
