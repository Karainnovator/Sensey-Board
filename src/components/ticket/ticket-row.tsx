/**
 * TicketRow Component
 *
 * Displays a ticket in List view with hierarchy support
 * Per visual-design-reference.md section 6:
 * - Parent height: 48px
 * - Sub-ticket height: 40px
 * - Indent: 24px per level
 * - Expand/collapse: ▼ expanded, ▶ collapsed
 */

'use client';

import { useState } from 'react';
import type { Ticket, User } from '@prisma/client';
import type { TicketUser } from '@/types/database';
import { TicketTypeBadge } from './ticket-type-badge';
import { TicketPriorityIcon, getPriorityLabel } from './ticket-priority-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TicketRowProps {
  ticket: Ticket & {
    assignee?: User | TicketUser | null;
    subTickets?: (Ticket & { assignee?: User | TicketUser | null })[];
  };
  level?: number;
  onClick?: (ticket: Ticket & { assignee?: User | TicketUser | null }) => void;
  className?: string;
}

const STATUS_DISPLAY = {
  TODO: { icon: '▣' },
  IN_PROGRESS: { icon: '▣' },
  IN_REVIEW: { icon: '◐' },
  DONE: { icon: '✓' },
} as const;

export function TicketRow({
  ticket,
  level = 0,
  onClick,
  className,
}: TicketRowProps) {
  const t = useTranslations('ticket');
  const tCommon = useTranslations('common');
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubTickets = (ticket.subTickets?.length ?? 0) > 0;
  const indent = level * 24; // 24px per level

  // Status labels using translations
  const getStatusLabel = (status: keyof typeof STATUS_DISPLAY) => {
    const statusMap = {
      TODO: t('status.todo'),
      IN_PROGRESS: t('status.inProgress'),
      IN_REVIEW: t('status.inReview'),
      DONE: t('status.done'),
    };
    return statusMap[status];
  };

  return (
    <>
      {/* Parent/Main Row */}
      <div
        className={cn(
          'group flex items-center gap-4 border-b border-gray-100',
          'transition-colors hover:bg-gray-50',
          level === 0 ? 'h-12' : 'h-10',
          className
        )}
        style={{ paddingLeft: `${indent + 16}px` }}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasSubTickets) {
              setIsExpanded(!isExpanded);
            }
          }}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded transition-colors',
            hasSubTickets ? 'cursor-pointer hover:bg-gray-200' : 'invisible'
          )}
          disabled={!hasSubTickets}
        >
          {hasSubTickets &&
            (isExpanded ? (
              <ChevronDown size={14} className="text-gray-600" />
            ) : (
              <ChevronRight size={14} className="text-gray-600" />
            ))}
        </button>

        {/* Key */}
        <div className="w-24 flex-shrink-0">
          <span className="text-xs font-medium text-gray-700">
            {ticket.key}
          </span>
        </div>

        {/* Type */}
        <div className="w-20 flex-shrink-0">
          <TicketTypeBadge type={ticket.type} />
        </div>

        {/* Title */}
        <div className="min-w-0 flex-1">
          <button
            onClick={() => onClick?.(ticket)}
            className="w-full truncate text-left text-sm text-gray-900 transition-colors hover:text-sakura-400"
          >
            {ticket.title}
          </button>
        </div>

        {/* Priority with icon and text */}
        <div className="w-28 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <TicketPriorityIcon priority={ticket.priority} size={14} />
            <span className="text-xs text-gray-600">
              {getPriorityLabel(ticket.priority)}
            </span>
          </div>
        </div>

        {/* Assignee with full name */}
        <div className="w-32 flex-shrink-0">
          {ticket.assignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={ticket.assignee.avatar ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {ticket.assignee.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() ??
                    ticket.assignee?.email?.[0]?.toUpperCase() ??
                    'U'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-xs text-gray-600">
                {ticket.assignee.name ??
                  ticket.assignee.email ??
                  tCommon('unassigned')}
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">
              {tCommon('unassigned')}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="w-32 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-sm',
                ticket.status === 'DONE' && 'text-success',
                ticket.status === 'IN_REVIEW' && 'text-info',
                ticket.status === 'IN_PROGRESS' && 'text-info',
                ticket.status === 'TODO' && 'text-gray-500'
              )}
            >
              {STATUS_DISPLAY[ticket.status].icon}
            </span>
            <span className="text-xs text-gray-600">
              {getStatusLabel(ticket.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Sub-tickets (recursively rendered) */}
      {isExpanded &&
        hasSubTickets &&
        ticket.subTickets?.map((subTicket) => (
          <TicketRow
            key={subTicket.id}
            ticket={subTicket}
            level={level + 1}
            onClick={() => onClick?.(subTicket)}
          />
        ))}
    </>
  );
}

// Sort configuration types
interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

interface TicketListHeaderProps {
  sortConfig?: SortConfig;
  onSort?: (column: string) => void;
}

// Table Header for List View with Sorting
export function TicketListHeader({
  sortConfig,
  onSort,
}: TicketListHeaderProps) {
  const t = useTranslations('ticket.table');

  const SortableHeader = ({
    column,
    children,
    className,
  }: {
    column: string;
    children: React.ReactNode;
    className?: string;
  }) => {
    const isActive = sortConfig?.column === column;
    const direction = isActive ? sortConfig.direction : null;

    return (
      <div
        className={cn(
          'flex items-center gap-1 cursor-pointer hover:text-gray-900 transition-colors select-none',
          className,
          isActive && 'text-sakura-500'
        )}
        onClick={() => onSort?.(column)}
      >
        <span className="text-xs font-semibold uppercase">{children}</span>
        {isActive &&
          (direction === 'asc' ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          ))}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-gray-600">
      <div className="w-5" /> {/* Space for expand/collapse */}
      <div className="w-24 flex-shrink-0">
        <SortableHeader column="key">{t('key')}</SortableHeader>
      </div>
      <div className="w-20 flex-shrink-0">
        <SortableHeader column="type">{t('type')}</SortableHeader>
      </div>
      <div className="min-w-0 flex-1">
        <SortableHeader column="title">{t('title')}</SortableHeader>
      </div>
      <div className="w-28 flex-shrink-0">
        <SortableHeader column="priority">{t('priority')}</SortableHeader>
      </div>
      <div className="w-32 flex-shrink-0">
        <SortableHeader column="assignee">{t('assignee')}</SortableHeader>
      </div>
      <div className="w-32 flex-shrink-0">
        <SortableHeader column="status">{t('status')}</SortableHeader>
      </div>
    </div>
  );
}

// Skeleton loading state for TicketRow
export function TicketRowSkeleton({ level = 0 }: { level?: number }) {
  const indent = level * 24;

  return (
    <div
      className="flex h-12 animate-pulse items-center gap-4 border-b border-gray-100 px-4"
      style={{ paddingLeft: `${indent + 16}px` }}
    >
      <div className="h-4 w-5 rounded bg-gray-200" />
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="h-4 w-20 rounded bg-gray-200" />
      <div className="h-4 flex-1 rounded bg-gray-200" />
      <div className="h-4 w-16 rounded bg-gray-200" />
      <div className="h-6 w-24 rounded bg-gray-200" />
      <div className="h-4 w-32 rounded bg-gray-200" />
    </div>
  );
}
