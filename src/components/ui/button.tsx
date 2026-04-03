import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-semibold',
    'whitespace-nowrap transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-brand text-dark',
          'hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/25',
        ],
        secondary: ['bg-dark text-white', 'hover:bg-dark-soft hover:shadow-lg'],
        outline: [
          'border-2 border-dark text-dark bg-transparent',
          'hover:bg-dark hover:text-white',
        ],
        ghost: ['text-dark bg-transparent', 'hover:bg-surface'],
        danger: [
          'bg-danger text-white',
          'hover:bg-danger/90 hover:shadow-lg hover:shadow-danger/25',
        ],
        link: [
          'text-dark underline-offset-4',
          'hover:underline hover:text-brand-dark',
          'p-0 h-auto',
        ],
      },
      size: {
        sm: 'h-9 px-4 text-xs rounded-lg',
        md: 'h-11 px-6 text-sm rounded-lg',
        lg: 'h-13 px-8 text-base rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
