import { Wrench } from 'lucide-react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-3 w-3 border-[1.5px]',
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-7 w-7 border-[2.5px]',
    xl: 'h-10 w-10 border-[3px]',
  };
  return (
    <div
      className={`inline-block rounded-full border-surface-border border-t-brand-500 animate-spin ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
    <div className="flex flex-col items-center gap-5 animate-fade-up">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand-lg animate-float">
          <Wrench className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <div className="absolute -inset-1.5 rounded-[20px] border-2 border-brand-200 animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-base font-bold text-ink tracking-tight">FixFirst</span>
        <span className="text-xs text-ink-tertiary">Loading your workspace…</span>
      </div>
      <Spinner size="md" />
    </div>
  </div>
);

export const SkeletonBlock = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card p-5 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 flex-1">
        <SkeletonBlock className="h-10 w-10 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonBlock className="h-6 w-20 rounded-full" />
    </div>
    <SkeletonBlock className="h-3 w-full" />
    <SkeletonBlock className="h-3 w-4/5" />
    <div className="flex gap-2 pt-1">
      <SkeletonBlock className="h-9 w-28 rounded-xl" />
      <SkeletonBlock className="h-9 w-28 rounded-xl" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="divide-y divide-surface-border">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3.5">
        {Array.from({ length: cols }).map((_, j) => (
          <SkeletonBlock key={j} className="h-5 flex-1 rounded-lg" />
        ))}
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <SkeletonBlock className="h-10 w-10 rounded-xl" />
    <SkeletonBlock className="h-7 w-14 rounded-lg" />
    <SkeletonBlock className="h-3.5 w-24 rounded-lg" />
  </div>
);

export default Spinner;
