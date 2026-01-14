/**
 * TicketCard Component
 *
 * Displays a ticket in Kanban board view with inline sub-tickets
 * Matches the new Sensey design system
 */

'use client';

import { memo, useMemo, useState, useEffect } from 'react';
import type { Ticket, User } from '@prisma/client';
import type { TicketUser } from '@/types/database';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TicketTypeBadge } from './ticket-type-badge';
import { TicketPriorityIcon } from './ticket-priority-icon';
import { InlineSubTickets } from './inline-sub-tickets';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User as UserIcon } from 'lucide-react';
import { getPriorityLabel } from './ticket-priority-icon';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';

interface TicketCardProps {
  ticket: Ticket & {
    assignee?: User | TicketUser | null;
    subTickets?: Ticket[];
    board?: {
      id: string;
      name: string;
      prefix: string;
      color: string;
    } | null;
  };
  onClick?: () => void;
  isDraggable?: boolean;
  isDragging?: boolean;
  onSubTicketToggle?: (
    subTicketId: string,
    completed: boolean
  ) => Promise<void>;
  onQuickAddSubTicket?: (parentId: string, title: string) => Promise<void>;
  className?: string;
  currentBoardId?: string;
}

export const TicketCard = memo(function TicketCard({
  ticket,
  onClick,
  isDraggable = true,
  isDragging: externalDragging,
  onSubTicketToggle,
  onQuickAddSubTicket,
  className,
  currentBoardId,
}: TicketCardProps) {
  const t = useTranslations('board');
  const [isSubTicketsExpanded, setIsSubTicketsExpanded] = useState(false);

  // Check if ticket is from a different board (sub-board ticket)
  const isFromDifferentBoard =
    currentBoardId && ticket.board && ticket.board.id !== currentBoardId;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: internalDragging,
  } = useSortable({
    id: ticket.id,
    disabled: !isDraggable,
  });

  const isDragging = externalDragging || internalDragging;

  // Auto-collapse sub-tickets when dragging
  useEffect(() => {
    if (isDragging) {
      setIsSubTicketsExpanded(false);
    }
  }, [isDragging]);

  // Memoize style calculation
  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  const subTickets = useMemo(
    () => ticket.subTickets ?? [],
    [ticket.subTickets]
  );

  // Memoize assignee initials
  const assigneeInitials = useMemo(() => {
    if (!ticket.assignee) return null;
    return (
      ticket.assignee.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() ??
      ticket.assignee?.email?.[0]?.toUpperCase() ??
      'U'
    );
  }, [ticket.assignee]);

  const handleSubTicketToggle = async (
    subTicketId: string,
    completed: boolean
  ) => {
    if (onSubTicketToggle) {
      await onSubTicketToggle(subTicketId, completed);
    }
  };

  const handleQuickAdd = async (title: string) => {
    if (onQuickAddSubTicket) {
      await onQuickAddSubTicket(ticket.id, title);
    }
  };

  const cardContent = (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(isFromDifferentBoard && ticket.board
          ? { borderLeftColor: ticket.board.color, borderLeftWidth: '3px' }
          : {}),
      }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'group relative bg-white rounded-[10px] border border-gray-100 p-[14px] cursor-pointer',
        'transition-all duration-150 ease-in-out',
        'hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5',
        isDragging && 'opacity-50 shadow-xl scale-[1.02]',
        className
      )}
    >
      {/* Header: Type Badge + Key */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <TicketTypeBadge type={ticket.type} />
        <span className="text-xs font-medium text-gray-400 font-mono">
          {ticket.key}
        </span>
      </div>

      {/* Title (max 2 lines) */}
      <h4 className="text-sm font-medium leading-snug text-gray-800 mb-3 line-clamp-2">
        {ticket.title}
      </h4>

      {/* Inline Sub-tickets (Notion-style) */}
      {subTickets.length > 0 && (
        <div className="mb-3">
          <InlineSubTickets
            subTickets={subTickets}
            isExpanded={isSubTicketsExpanded}
            onToggleExpand={() =>
              setIsSubTicketsExpanded(!isSubTicketsExpanded)
            }
            onToggleComplete={handleSubTicketToggle}
            onQuickAdd={onQuickAddSubTicket ? handleQuickAdd : undefined}
            maxVisible={3}
          />
        </div>
      )}

      {/* Footer: Priority, Assignee */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Priority with icon and text */}
          <div className="flex items-center gap-1">
            <TicketPriorityIcon priority={ticket.priority} size={14} />
            <span className="text-xs text-gray-600 font-medium">
              {getPriorityLabel(ticket.priority)}
            </span>
          </div>
        </div>

        {/* Assignee with Avatar and Name */}
        {ticket.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6 rounded-md">
              <AvatarImage src={ticket.assignee.avatar ?? undefined} />
              <AvatarFallback className="rounded-md bg-sakura-200 text-sakura-500 text-[10px] font-semibold">
                {assigneeInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 font-medium">
              {assigneeInitials}
            </span>
          </div>
        ) : (
          <div className="h-6 w-6 rounded-md bg-gray-100 flex items-center justify-center">
            <UserIcon className="h-3.5 w-3.5 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );

  // Wrap in tooltip if from different board
  if (isFromDifferentBoard && ticket.board) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
          <TooltipContent side="top">
            <p>{t('fromBoard', { boardName: ticket.board.name })}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
});

// Skeleton loading state for TicketCard
export function TicketCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-3.5 animate-pulse">
      <div className="flex items-center justify-between mb-2.5">
        <div className="h-5 w-14 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-100" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-100" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gray-200" />
        </div>
        <div className="h-6 w-6 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}
