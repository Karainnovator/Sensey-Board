import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { BoardTabs } from '@/components/layout/board-tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface BoardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ boardId: string }>;
}

export default async function BoardLayout({
  children,
  params,
}: BoardLayoutProps) {
  const { boardId } = await params;

  if (!boardId) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      {/* Board Tabs Navigation (includes breadcrumb and actions) */}
      <Suspense fallback={<BoardTabsSkeleton />}>
        <BoardTabs boardId={boardId} />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
      </div>
    </div>
  );
}

function BoardTabsSkeleton() {
  return (
    <div className="border-b border-neutral-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-px" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="h-full w-full p-6">
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
