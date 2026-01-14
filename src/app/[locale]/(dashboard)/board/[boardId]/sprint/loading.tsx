/**
 * Sprint Loading State
 */

import { TicketCardSkeleton } from '@/components/shared/loading-skeleton';

export default function SprintLoading() {
  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-gray-200" />
      </div>

      {/* Kanban columns skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['To Do', 'In Progress', 'In Review', 'Done'].map((column) => (
          <div key={column} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 animate-pulse rounded-md bg-gray-200" />
              <div className="h-5 w-8 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <TicketCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
