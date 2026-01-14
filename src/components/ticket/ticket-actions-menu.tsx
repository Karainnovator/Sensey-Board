/**
 * TicketActionsMenu Component
 *
 * Dropdown menu for ticket actions (Edit, Delete, Move, etc.)
 */

'use client';

import type { Ticket } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  MoveRight,
  ListTree,
  Archive,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Sprint {
  id: string;
  name: string;
  number: number;
  status: string;
}

interface TicketActionsMenuProps {
  ticket?: Ticket;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onMove?: () => void;
  onCreateSubTicket?: () => void;
  onMoveToSprint?: (sprintId: string) => void;
  onMoveToBacklog?: () => void;
  sprints?: Sprint[];
  currentSprintId?: string;
  isInBacklog?: boolean;
}

export function TicketActionsMenu({
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
  onCreateSubTicket,
  onMoveToSprint,
  onMoveToBacklog,
  sprints = [],
  currentSprintId,
  isInBacklog = false,
}: TicketActionsMenuProps) {
  const t = useTranslations('ticket');

  // Filter out current sprint from options
  const availableSprints = sprints.filter(
    (s) => s.id !== currentSprintId && s.status !== 'COMPLETED'
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="min-h-[44px] min-w-[44px] p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={16} />
          <span className="sr-only">{t('actions.openMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil size={14} className="mr-2" />
            {t('actions.edit')}
          </DropdownMenuItem>
        )}

        {onCreateSubTicket && (
          <DropdownMenuItem onClick={onCreateSubTicket}>
            <ListTree size={14} className="mr-2" />
            {t('actions.createSubTicket')}
          </DropdownMenuItem>
        )}

        {onDuplicate && (
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy size={14} className="mr-2" />
            {t('actions.duplicate')}
          </DropdownMenuItem>
        )}

        {/* Move to Sprint submenu */}
        {onMoveToSprint && availableSprints.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MoveRight size={14} className="mr-2" />
                {t('actions.moveToSprint')}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {availableSprints.map((sprint) => (
                  <DropdownMenuItem
                    key={sprint.id}
                    onClick={() => onMoveToSprint(sprint.id)}
                  >
                    {sprint.name}
                    {sprint.status === 'ACTIVE' && (
                      <span className="ml-2 text-xs text-green-600">
                        {t('actions.activeLabel')}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}

        {/* Move to Backlog option */}
        {onMoveToBacklog && !isInBacklog && (
          <DropdownMenuItem onClick={onMoveToBacklog}>
            <Archive size={14} className="mr-2" />
            {t('actions.moveToBacklog')}
          </DropdownMenuItem>
        )}

        {/* Legacy Move option */}
        {onMove && (
          <DropdownMenuItem onClick={onMove}>
            <MoveRight size={14} className="mr-2" />
            {t('actions.moveTo')}
          </DropdownMenuItem>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
            >
              <Trash2 size={14} className="mr-2" />
              {t('actions.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
