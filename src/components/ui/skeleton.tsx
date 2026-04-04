import { type HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
  ...props
}: SkeletonProps) {
  const baseClasses =
    'animate-pulse bg-gradient-to-r from-surface via-surface-alt to-surface bg-[length:200%_100%]';

  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full', className)}
        style={{
          width: width || 40,
          height: height || width || 40,
        }}
        {...props}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-lg', className)}
        style={{ width: width || '100%', height: height || 120 }}
        {...props}
      />
    );
  }

  // Text variant — multiple lines
  return (
    <div className={cn('space-y-2.5', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(baseClasses, 'h-4 rounded')}
          style={{
            width: i === lines - 1 && lines > 1 ? '70%' : width || '100%',
          }}
        />
      ))}
    </div>
  );
}

// Preset compositions
Skeleton.Card = function SkeletonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-gray-100 bg-white p-6 shadow-sm', className)}
      {...props}
    >
      <Skeleton variant="rectangular" height={160} className="mb-4" />
      <Skeleton lines={2} className="mb-3" />
      <Skeleton width="40%" />
    </div>
  );
};

Skeleton.Avatar = function SkeletonAvatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <Skeleton variant="circular" width={44} />
      <div className="flex-1">
        <Skeleton width="60%" className="mb-1.5" />
        <Skeleton width="40%" />
      </div>
    </div>
  );
};
