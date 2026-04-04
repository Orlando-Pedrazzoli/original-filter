import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

const cardVariants = {
  default: 'bg-white border border-gray-100 shadow-sm',
  outlined: 'bg-white border-2 border-surface-alt',
  elevated: 'bg-white shadow-lg shadow-black/5',
  interactive:
    'bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-brand/30 transition-all duration-200 cursor-pointer',
} as const;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants;
  children: ReactNode;
}

export default function Card({ variant = 'default', children, className, ...props }: CardProps) {
  return (
    <div className={cn('rounded-xl', cardVariants[variant], className)} {...props}>
      {children}
    </div>
  );
}

function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border-b border-gray-100 px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-5', className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-3 border-t border-gray-100 px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
