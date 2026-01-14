/**
 * Loading Skeleton Components
 *
 * Skeleton loaders for various UI elements
 */

import { Skeleton } from '@/components/ui/skeleton';

/**
 * Board Card Skeleton
 */
export function BoardCardSkeleton() {
  return (
    <div className="group relative h-[180px] overflow-hidden rounded-lg border border-border bg-card p-4 shadow-card">
      {/* Gradient background skeleton */}
      <Skeleton className="absolute inset-0 opacity-30" />

      <div className="relative flex h-full flex-col justify-between">
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Footer with avatars and ticket count */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Board Grid Skeleton
 */
export function BoardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <BoardCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Ticket Card Skeleton
 */
export function TicketCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="space-y-3">
        {/* Type badge and key */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border py-3">
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

/**
 * Page Loading Skeleton
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  );
}
