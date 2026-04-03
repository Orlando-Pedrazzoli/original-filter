import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  [
    'inline-flex items-center gap-1 font-semibold uppercase tracking-wider',
    'transition-colors duration-200',
  ],
  {
    variants: {
      variant: {
        default: 'border border-surface-alt bg-surface text-dark',
        brand: 'border border-brand/30 bg-brand/10 text-dark',
        success: 'border border-success/30 bg-success/10 text-success',
        warning: 'border border-warning/30 bg-warning/10 text-warning',
        danger: 'border border-danger/30 bg-danger/10 text-danger',
        info: 'border border-info/30 bg-info/10 text-info',
        dark: 'border border-dark bg-dark text-white',
        outline: 'border border-dark text-dark bg-transparent',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] rounded-md',
        md: 'px-2.5 py-1 text-xs rounded-lg',
        lg: 'px-3 py-1.5 text-xs rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'danger' && 'bg-danger',
            variant === 'info' && 'bg-info',
            variant === 'brand' && 'bg-brand',
            (!variant || variant === 'default' || variant === 'dark' || variant === 'outline') &&
              'bg-current',
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
