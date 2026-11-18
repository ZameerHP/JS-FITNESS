import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Magnetic } from './Magnetic';

type ButtonVariant = 'primary' | 'outline' | 'white-outline' | 'dark-pill' | 'nav';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  to?: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  onPrefetch?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: React.ReactNode;
  showArrow?: boolean;
  pulseRing?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = React.memo(({
  children,
  variant = 'primary',
  to,
  href,
  onClick,
  onPrefetch,
  type = 'button',
  disabled = false,
  icon,
  showArrow = true,
  pulseRing = false,
  className = '',
  ariaLabel,
}) => {
  const baseStyles =
    'group relative inline-flex items-center justify-center gap-2.5 rounded-full font-sans font-extrabold text-[12px] uppercase tracking-[0.04em] transition-[transform,background-color,border-color,color] duration-200 active:scale-[0.97] overflow-hidden select-none whitespace-nowrap cursor-pointer disabled:opacity-45 disabled:pointer-events-none';

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'h-[48px] px-7 bg-[#B6F500] text-[#050505] font-black shadow-[0_0_28px_rgba(182,245,0,0.45),0_8px_22px_rgba(0,0,0,0.5)] hover:bg-[#c8ff29] hover:shadow-[0_0_38px_rgba(182,245,0,0.65),0_12px_28px_rgba(0,0,0,0.6)]',
    outline:
      'h-[44px] px-6 bg-white/[0.02] border-[1.5px] border-[#B6F500]/65 text-white/95 hover:bg-[#B6F500] hover:border-[#B6F500] hover:text-[#050505]',
    'white-outline':
      'h-[44px] px-6 bg-white/[0.02] border-[1.5px] border-white/40 text-white/90 hover:bg-[#B6F500] hover:border-[#B6F500] hover:text-[#050505]',
    'dark-pill':
      'h-[44px] px-6 bg-[#050505] text-white border border-[#050505] shadow-[0_10px_24px_rgba(0,0,0,0.45)] hover:bg-[#151715]',
    nav: 'h-[36px] px-5 bg-transparent border-[1.5px] border-[#B6F500]/80 text-[#B6F500] text-[11px] hover:bg-[#B6F500] hover:text-[#050505] hover:shadow-[0_0_18px_rgba(182,245,0,0.4)]',
  };

  const content = (
    <>
      {pulseRing && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-full border border-[#B6F500]/45 pulse-ring-anim"
        />
      )}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full"
      />
      {icon && <span className="relative z-10 flex items-center">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {showArrow && (
        <ArrowRight className="relative z-10 w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </>
  );

  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <Magnetic maxPull={8}>
      {to ? (
        <Link
          to={to}
          onClick={onClick}
          onMouseEnter={onPrefetch}
          onTouchStart={onPrefetch}
          className={classes}
          aria-label={ariaLabel}
        >
          {content}
        </Link>
      ) : href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          onMouseEnter={onPrefetch}
          onTouchStart={onPrefetch}
          className={classes}
          aria-label={ariaLabel}
        >
          {content}
        </a>
      ) : (
        <button
          type={type}
          disabled={disabled}
          onClick={onClick}
          onMouseEnter={onPrefetch}
          onTouchStart={onPrefetch}
          className={classes}
          aria-label={ariaLabel}
        >
          {content}
        </button>
      )}
    </Magnetic>
  );
});
