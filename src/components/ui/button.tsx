import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

const variants = {
  primary:
    'bg-brand text-dark hover:bg-brand-hover active:bg-brand-dark font-bold shadow-sm hover:shadow-md',
  secondary: 'bg-dark text-white hover:bg-dark-mid active:bg-dark-soft font-bold shadow-sm',
  outline: 'border-2 border-dark text-dark hover:bg-dark hover:text-white font-bold',
  ghost: 'text-dark hover:bg-surface active:bg-surface-alt font-medium',
  danger: 'bg-danger text-white hover:bg-red-700 active:bg-red-800 font-bold shadow-sm',
  link: 'text-brand-dark hover:text-dark underline-offset-4 hover:underline font-medium p-0 h-auto',
} as const;

const sizes = {
  sm: 'h-9 px-4 text-xs rounded-lg gap-1.5',
  md: 'h-11 px-6 text-sm rounded-lg gap-2',
  lg: 'h-13 px-8 text-base rounded-xl gap-2.5',
  icon: 'h-10 w-10 rounded-lg',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 outline-none',
          'focus-visible:ring-brand/40 focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
