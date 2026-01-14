/**
 * Backlog Loading State
 */

import { TableRowSkeleton } from '@/components/shared/loading-skeleton';

export default function BacklogLoading() {
  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-gray-200" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border p-4">
          <div className="flex gap-4">
            <div className="h-4 w-12 animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-16 animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 flex-1 animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-12 animate-pulse rounded-md bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded-md bg-gray-200" />
          </div>
        </div>
        <div className="divide-y divide-border p-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
