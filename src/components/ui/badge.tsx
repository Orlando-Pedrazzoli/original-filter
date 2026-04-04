import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

const badgeVariants = {
  brand: 'bg-brand/15 text-brand-dark border-brand/25',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-surface text-muted-dark border-surface-alt',
} as const;

const badgeSizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof badgeVariants;
  size?: keyof typeof badgeSizes;
  dot?: boolean;
  children: ReactNode;
}

export default function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide uppercase',
        badgeVariants[variant],
        badgeSizes[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'brand' && 'bg-brand-dark',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'danger' && 'bg-danger',
            variant === 'info' && 'bg-info',
            variant === 'neutral' && 'bg-muted',
          )}
        />
      )}
      {children}
    </span>
  );
}
