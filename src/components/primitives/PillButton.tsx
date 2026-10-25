import React from 'react';

export type PillButtonVariant = 'filled' | 'outline' | 'solid';
export type PillButtonSize = 'sm' | 'md' | 'lg';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PillButtonVariant;
  size?: PillButtonSize;
  icon?: string; // Material symbol name or lucide string
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({
  variant = 'filled',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes with pill rounded border radius
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-full active:scale-[0.98]';

  // Size styling strictly following horizontal padding = 2x vertical padding rule
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-3 gap-1.5 h-8',
    md: 'text-sm py-2 px-4 gap-2 h-10',
    lg: 'text-base py-3 px-6 gap-2.5 h-12 font-semibold',
  }[size];

  // Variant styling
  const variantClasses = {
    filled:
      'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 border border-amber-400/30',
    outline:
      'border border-neutral-700/80 bg-neutral-900/60 text-neutral-200 hover:border-amber-500/60 hover:bg-neutral-800/80 hover:text-white hover:shadow-md hover:shadow-amber-500/5 backdrop-blur-sm',
    solid:
      'bg-neutral-800 text-neutral-100 border border-neutral-700/50 hover:bg-neutral-700 hover:border-neutral-600 hover:text-white',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : icon && iconPosition === 'left' ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}

      {children && <span className="whitespace-nowrap">{children}</span>}

      {!loading && icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      )}
    </button>
  );
};
