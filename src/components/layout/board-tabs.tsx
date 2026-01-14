'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Settings, UserPlus, ChevronRight, Home } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { BoardSettingsDialog } from '@/components/board/board-settings-dialog';
import { InviteGuestDialog } from '@/components/board/invite-guest-dialog';

interface BoardTabsProps {
  boardId: string;
}

type TabType = 'backlog' | 'sprint';

interface Tab {
  id: TabType;
  label: string;
  href: string;
}

export function BoardTabs({ boardId }: BoardTabsProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Fetch board data for breadcrumb
  const { data: board } = trpc.board.getById.useQuery({ id: boardId });

  const boardData = board ?? {
    id: boardId,
    name: 'Loading...',
    description: '',
    color: '#FFB7C5',
  };

  const tabs: Tab[] = [
    {
      id: 'backlog',
      label: t('backlog.title'),
      href: `/${locale}/board/${boardId}/backlog`,
    },
    {
      id: 'sprint',
      label: t('sprint.title'),
      href: `/${locale}/board/${boardId}/sprint`,
    },
  ];

  const isTabActive = (tab: Tab): boolean => {
    return pathname.includes(tab.href);
  };

  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="flex items-center justify-between px-6">
        {/* Left side: Breadcrumb + Tabs */}
        <div className="flex items-center gap-6">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-neutral-400 hover:text-sakura-500 transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            <span className="font-medium text-neutral-700 max-w-[150px] truncate">
              {boardData.name}
            </span>
          </nav>

          {/* Divider */}
          <div className="h-5 w-px bg-neutral-200" />

          {/* Tabs */}
          <nav className="flex gap-6" aria-label="Board navigation tabs">
            {tabs.map((tab) => {
              const isActive = isTabActive(tab);

              return (
                <Link
                  key={tab.id}
                  href={
                    tab.href as
                      | `/${string}/board/${string}/backlog`
                      | `/${string}/board/${string}/sprint`
                  }
                  className={cn(
                    'relative py-3 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sakura-500 focus-visible:ring-offset-2',
                    isActive
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-700'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}

                  {/* Active indicator */}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-sakura-500"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-1.5">
          {/* Settings button */}
          <BoardSettingsDialog boardId={boardId} board={boardData}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('common.settings')}
              className="h-8 w-8 text-neutral-500 hover:text-neutral-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </BoardSettingsDialog>

          {/* Invite button */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-neutral-500 hover:text-neutral-700 h-8 px-2.5"
            aria-label={t('guest.invite')}
            onClick={() => setShowInviteDialog(true)}
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">
              {t('guest.invite')}
            </span>
          </Button>
        </div>
      </div>

      {/* Invite Guest Dialog */}
      <InviteGuestDialog
        boardId={boardId}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </div>
  );
}
