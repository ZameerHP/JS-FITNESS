import React from 'react';

export type JSLogoSize = 'xs' | 'sm' | 'md' | 'lg';

interface JSLogoProps {
  size?: JSLogoSize;
  className?: string;
  priority?: boolean;
}

const SIZE_CLASSES: Record<JSLogoSize, string> = {
  xs: 'h-[48px] sm:h-[52px] w-auto',
  sm: 'h-[54px] sm:h-[58px] w-auto',
  md: 'h-[86px] sm:h-[96px] w-auto',
  lg: 'h-[106px] sm:h-[120px] w-auto',
};

const SIZE_HINTS: Record<JSLogoSize, string> = {
  xs: '52px',
  sm: '58px',
  md: '96px',
  lg: '120px',
};

export const JSLogo: React.FC<JSLogoProps> = ({
  size = 'sm',
  className = '',
  priority = false,
}) => {
  const defaultSrc =
    size === 'md' || size === 'lg' ? '/images/js-logo.webp' : '/images/js-logo-256.webp';

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
    >
      {/* Subtle emerald radial backlight separates the logo's dark outlines cleanly from #050505 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 rounded-full opacity-90"
        style={{
          background:
            'radial-gradient(circle at 50% 48%, rgba(34, 243, 27, 0.17) 0%, rgba(182, 245, 0, 0.06) 44%, transparent 72%)',
        }}
      />
      <img
        src={defaultSrc}
        srcSet="/images/js-logo-128.webp 128w, /images/js-logo-256.webp 256w, /images/js-logo.webp 512w"
        sizes={SIZE_HINTS[size]}
        width={512}
        height={557}
        alt="JS FITNESS INC"
        decoding={priority ? 'sync' : 'async'}
        loading={priority ? 'eager' : 'lazy'}
        draggable={false}
        className={`relative z-10 block object-contain ${SIZE_CLASSES[size]}`}
      />
    </span>
  );
};
