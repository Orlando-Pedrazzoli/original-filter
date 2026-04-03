import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('bg-surface-alt animate-pulse rounded-lg', className)} />;
}

// ── Pre-built skeleton patterns ──

function SkeletonCard() {
  return (
    <div className="border-surface-alt rounded-2xl border bg-white p-6">
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="mt-4 h-5 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  );
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-4/6' : 'w-full')} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonRow, SkeletonText };
