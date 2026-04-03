import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const cardVariants = cva('rounded-2xl transition-all duration-300 ease-out', {
  variants: {
    variant: {
      default: [
        'border border-surface-alt bg-white',
        'hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5',
      ],
      elevated: ['bg-white shadow-md', 'hover:shadow-xl hover:shadow-brand/10'],
      dark: ['border border-white/10 bg-dark-soft text-white', 'hover:border-brand/20'],
      outline: ['border-2 border-surface-alt bg-transparent', 'hover:border-brand/40'],
      interactive: [
        'border border-surface-alt bg-white cursor-pointer',
        'hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5',
        'hover:-translate-y-0.5',
        'active:translate-y-0 active:shadow-md',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

// ── Card Root ──
export interface CardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(cardVariants({ variant, className }))} {...props} />
));
Card.displayName = 'Card';

// ── Card Header ──
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pb-0', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

// ── Card Title ──
const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-heading text-lg font-bold tracking-tight', className)}
      {...props}
    />
  ),
);
CardTitle.displayName = 'CardTitle';

// ── Card Description ──
const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-muted-dark mt-1.5 text-sm', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

// ── Card Content ──
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

// ── Card Footer ──
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('border-surface-alt flex items-center gap-3 border-t px-6 py-4', className)}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
