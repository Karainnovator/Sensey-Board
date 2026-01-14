/**
 * Dashboard Loading State
 * Next.js automatically shows this while page.tsx is loading
 */

import { BoardGridSkeleton } from '@/components/shared/loading-skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
          <div className="h-4 w-96 animate-pulse rounded-md bg-gray-200" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-gray-200" />
      </div>

      {/* Board grid skeleton */}
      <BoardGridSkeleton />
    </div>
  );
}
