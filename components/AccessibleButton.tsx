'use client';

import React, { forwardRef } from 'react';
import { playTVSound } from '@/lib/preferences';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'card';
  size?: 'md' | 'lg' | 'xl';
  soundEffect?: boolean;
  highContrast?: boolean;
  activeFocusRing?: boolean;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'secondary',
      size = 'lg',
      soundEffect = true,
      highContrast = false,
      activeFocusRing = true,
      onClick,
      onFocus,
      onKeyDown,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      if (soundEffect && !disabled) {
        playTVSound('focus');
      }
      onFocus?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (soundEffect) {
        playTVSound('select');
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (soundEffect && !disabled) {
          playTVSound('select');
        }
      }
      onKeyDown?.(e);
    };

    // Base TV styles: large touch targets, bold fonts, clear focus ring
    const baseStyles =
      'relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-150 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none';

    const focusStyles = highContrast
      ? 'focus-visible:ring-4 focus-visible:ring-yellow-300 focus-visible:outline-none focus:scale-[1.02]'
      : 'focus-visible:ring-4 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none focus:scale-[1.02] shadow-sm hover:shadow-cyan-900/30';

    let variantStyles = '';
    if (highContrast) {
      switch (variant) {
        case 'primary':
          variantStyles = 'bg-yellow-400 text-black border-2 border-yellow-300 hover:bg-yellow-300 font-bold';
          break;
        case 'danger':
          variantStyles = 'bg-red-600 text-white border-2 border-red-400 hover:bg-red-500 font-bold';
          break;
        case 'outline':
          variantStyles = 'bg-black text-yellow-300 border-2 border-yellow-300 hover:bg-yellow-950 font-bold';
          break;
        default:
          variantStyles = 'bg-zinc-900 text-white border-2 border-white hover:bg-zinc-800 font-bold';
          break;
      }
    } else {
      switch (variant) {
        case 'primary':
          variantStyles =
            'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 active:scale-[0.98]';
          break;
        case 'secondary':
          variantStyles =
            'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700 active:scale-[0.98]';
          break;
        case 'danger':
          variantStyles =
            'bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-900/40 active:scale-[0.98] border border-rose-500';
          break;
        case 'outline':
          variantStyles =
            'bg-transparent hover:bg-slate-800/50 text-cyan-300 border-2 border-cyan-500/50 hover:border-cyan-400 active:scale-[0.98]';
          break;
        case 'ghost':
          variantStyles =
            'bg-transparent hover:bg-slate-800/60 text-slate-200 active:scale-[0.98]';
          break;
        case 'card':
          variantStyles =
            'bg-slate-800/80 hover:bg-slate-700/90 text-slate-100 border border-slate-700/80 shadow-md active:scale-[0.98] text-left';
          break;
      }
    }

    let sizeStyles = '';
    switch (size) {
      case 'md':
        sizeStyles = 'px-4 py-2.5 text-base gap-2';
        break;
      case 'lg':
        sizeStyles = 'px-6 py-4 text-xl gap-3 min-h-[56px]';
        break;
      case 'xl':
        sizeStyles = 'px-8 py-5 text-2xl gap-4 min-h-[68px]';
        break;
    }

    return (
      <button
        ref={ref}
        type="button"
        className={`${baseStyles} ${activeFocusRing ? focusStyles : ''} ${variantStyles} ${sizeStyles} ${className}`}
        onFocus={handleFocus}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
