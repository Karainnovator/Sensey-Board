'use client';

import { useState } from 'react';
import { Home, ChevronRight, Settings, UserPlus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { BoardSettingsDialog } from './board-settings-dialog';
import { InviteGuestDialog } from './invite-guest-dialog';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc';

interface BoardHeaderProps {
  boardId: string;
}

export function BoardHeader({ boardId }: BoardHeaderProps) {
  const t = useTranslations();
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  // Fetch board data
  const { data: board } = trpc.board.getById.useQuery({ id: boardId });

  const boardData = board ?? {
    id: boardId,
    name: 'Loading...',
    description: '',
    color: '#FFB7C5',
  };

  return (
    <header className="border-b border-neutral-200 bg-white px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side: Breadcrumb navigation */}
        <div className="flex items-center gap-2">
          {/* Breadcrumb: Dashboard > Board Name */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm"
          >
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-neutral-500 transition-colors hover:text-sakura-500"
            >
              <Home className="h-4 w-4" />
              <span>{t('common.boards')}</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-neutral-300" />
            <span className="font-medium text-neutral-900">
              {boardData.name}
            </span>
          </nav>
        </div>

        {/* Right side: Settings + Invite */}
        <div className="flex items-center gap-2">
          {/* Settings button */}
          <BoardSettingsDialog boardId={boardId} board={boardData}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('common.settings')}
              className="h-9 w-9"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </BoardSettingsDialog>

          {/* Invite button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label={t('guest.invite')}
            onClick={() => setShowInviteDialog(true)}
          >
            <UserPlus className="h-4 w-4" />
            <span>{t('guest.invite')}</span>
          </Button>
        </div>
      </div>

      {/* Invite Guest Dialog */}
      <InviteGuestDialog
        boardId={boardId}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
      />
    </header>
  );
}
