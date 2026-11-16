import React from 'react';

interface JSLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const JSLogo: React.FC<JSLogoProps> = ({ size = 'sm', className = '' }) => {
  const sizes = {
    sm: { js: 'text-[26px]', inc: 'text-[11px] tracking-[0.22em]', bar: 'w-9 h-[2.5px]' },
    md: { js: 'text-[34px]', inc: 'text-[13px] tracking-[0.24em]', bar: 'w-12 h-[3px]' },
    lg: { js: 'text-[46px]', inc: 'text-[15px] tracking-[0.26em]', bar: 'w-16 h-[3.5px]' },
  };
  const s = sizes[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative flex flex-col items-center">
        <span
          className={`font-display italic font-black leading-none tracking-[-0.04em] text-metallic ${s.js}`}
        >
          J<span className="text-[#B6F500]">S</span>
        </span>
        <span
          className={`mt-0.5 rounded-full bg-gradient-to-r from-[#B6F500] via-[#B6F500] to-transparent shadow-[0_0_12px_rgba(182,245,0,0.8)] ${s.bar}`}
        />
      </div>
      <span
        className={`font-display font-bold uppercase text-white/95 leading-none ${s.inc}`}
      >
        FITNESS <span className="text-[#C9C9C9]">INC</span>
      </span>
    </div>
  );
};
