import React, { useState } from 'react';
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
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: React.ReactNode;
  showArrow?: boolean;
  pulseRing?: boolean;
  className?: string;
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  to,
  href,
  onClick,
  type = 'button',
  disabled = false,
  icon,
  showArrow = true,
  pulseRing = false,
  className = '',
  ariaLabel,
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
    if (onClick) onClick(e);
  };

  const baseStyles =
    'group relative inline-flex items-center justify-center gap-2.5 rounded-full font-sans font-extrabold text-[12px] uppercase tracking-[0.04em] transition-all duration-300 active:scale-[0.97] overflow-hidden select-none whitespace-nowrap cursor-pointer disabled:opacity-45 disabled:pointer-events-none';

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'h-[46px] px-7 bg-[#B6F500] text-[#050505] shadow-[0_0_28px_rgba(182,245,0,0.35)] hover:shadow-[0_0_38px_rgba(182,245,0,0.6)] hover:bg-[#c5ff1a]',
    outline:
      'h-[44px] px-6 bg-transparent border-[1.5px] border-[#B6F500] text-white hover:bg-[#B6F500] hover:text-[#050505] hover:shadow-[0_0_24px_rgba(182,245,0,0.35)]',
    'white-outline':
      'h-[46px] px-6 bg-white/[0.04] border-[1.5px] border-white/60 text-white hover:bg-[#B6F500] hover:border-[#B6F500] hover:text-[#050505]',
    'dark-pill':
      'h-[42px] px-6 bg-[#050505] text-white border border-[#050505] hover:bg-[#151715]',
    nav: 'h-[36px] px-5 bg-transparent border-[1.5px] border-[#B6F500]/80 text-[#B6F500] text-[11px] hover:bg-[#B6F500] hover:text-[#050505]',
  };

  const content = (
    <>
      {pulseRing && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-full border border-[#B6F500]/50 animate-ping opacity-20"
        />
      )}
      {/* Hover light sweep */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          style={{ left: r.x, top: r.y }}
          className="pointer-events-none absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40 animate-ping"
        />
      ))}
      {icon && <span className="relative z-10 flex items-center">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {showArrow && (
        <ArrowRight className="relative z-10 w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  const classes = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <Magnetic maxPull={8}>
      {to ? (
        <Link to={to} onClick={handleClick} className={classes} aria-label={ariaLabel}>
          {content}
        </Link>
      ) : href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className={classes}
          aria-label={ariaLabel}
        >
          {content}
        </a>
      ) : (
        <button
          type={type}
          disabled={disabled}
          onClick={handleClick}
          className={classes}
          aria-label={ariaLabel}
        >
          {content}
        </button>
      )}
    </Magnetic>
  );
};
