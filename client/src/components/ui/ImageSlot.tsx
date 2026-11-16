import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageSlotProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  vignette?: boolean;
  priority?: boolean;
  label?: string;
}

export const ImageSlot: React.FC<ImageSlotProps> = ({
  src,
  alt,
  className = '',
  imgClassName = 'object-cover w-full h-full',
  vignette = true,
  priority = false,
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

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
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
