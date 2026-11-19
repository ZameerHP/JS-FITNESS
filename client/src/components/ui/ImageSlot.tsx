import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageSlotProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  vignette?: boolean;
  priority?: boolean;
  lazy?: boolean;
  label?: string;
}

export const ImageSlot: React.FC<ImageSlotProps> = ({
  src,
  alt,
  className = '',
  imgClassName = 'object-cover w-full h-full',
  vignette = true,
  priority = false,
  lazy = true,
  label,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-[#0B0B0C] border border-[#B6F500]/35 overflow-hidden ${className}`}
      >
        <ImageOff className="w-6 h-6 text-[#B6F500]/60 mb-1" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 px-3 text-center">
          {label || alt}
        </span>
      </div>
    );
  }

  const transformMatch = /^\/images\/(transform-(?:male|female)-(?:before|after))\.webp$/.exec(src);
  const srcSet = transformMatch
    ? `/images/${transformMatch[1]}-320.webp 320w, ${src} 600w`
    : undefined;
  const sizes = transformMatch ? '(max-width: 768px) 145px, 260px' : undefined;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={600}
        height={800}
        alt={alt}
        loading={priority || !lazy ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onError={() => setFailed(true)}
        className={imgClassName}
      />
      {vignette && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25"
        />
      )}
    </div>
  );
};
