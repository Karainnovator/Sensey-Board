/**
 * SubTicketList Component
 *
 * Notion-style sub-ticket management
 * Sub-tickets are full tickets linked to parent
 * Features:
 * - Progress bar showing completion
 * - Click to open full ticket editor
 * - Checkbox for completion toggle
 * - Drag handle for reordering
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import type { Ticket } from '@prisma/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TicketTypeBadge } from './ticket-type-badge';
import { TicketPriorityIcon } from './ticket-priority-icon';
import { Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface SubTicketListProps {
  subTickets: Ticket[];
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onCreate?: (title: string) => Promise<void>;
  onUpdateTitle?: (id: string, title: string) => Promise<void>;
  onOpenSubTicket?: (ticket: Ticket) => void; // Open sub-ticket in full editor (will be cast to full type by parent)
  onRequestCreateSubTicket?: () => void; // Request to create via full dialog
  isCreating?: boolean;
}

export function SubTicketList({
  subTickets,
  onToggleComplete,
  onDelete,
  onCreate,
  onUpdateTitle,
  onOpenSubTicket,
  onRequestCreateSubTicket,
  isCreating = false,
}: SubTicketListProps) {
  const t = useTranslations('ticket.subTickets');
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const completedCount = subTickets.filter((t) => t.status === 'DONE').length;
  const totalCount = subTickets.length;
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    if (isQuickAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isQuickAdding]);

  const handleQuickCreate = async () => {
    if (!newTitle.trim() || !onCreate) return;
    await onCreate(newTitle.trim());
    setNewTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickCreate();
    } else if (e.key === 'Escape') {
      setIsQuickAdding(false);
      setNewTitle('');
    }
  };

  const handleAddClick = () => {
    // If we have a full dialog callback, use it. Otherwise fall back to quick add.
    if (onRequestCreateSubTicket) {
      onRequestCreateSubTicket();
    } else {
      setIsQuickAdding(true);
    }
  };

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sakura-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Sub-ticket items */}
      <div className="space-y-1">
        {subTickets.map((subTicket) => (
          <SubTicketRow
            key={subTicket.id}
            subTicket={subTicket}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onUpdateTitle={onUpdateTitle}
            onOpen={onOpenSubTicket}
          />
        ))}
      </div>

      {/* Quick add (if no full dialog available) or Add button */}
      {isQuickAdding && !onRequestCreateSubTicket ? (
        <div className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-md bg-gray-50">
          <Checkbox disabled className="opacity-50" />
          <Input
            ref={inputRef}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) setIsQuickAdding(false);
            }}
            placeholder={t('clickToAdd')}
            className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm"
            disabled={isCreating}
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddClick}
          className="w-full justify-start gap-2 text-gray-500 hover:text-gray-700 h-8"
        >
          <Plus className="h-4 w-4" />
          <span>{t('addNew')}</span>
        </Button>
      )}
    </div>
  );
}

interface SubTicketRowProps {
  subTicket: Ticket;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onDelete?: (id: string) => void;
  onUpdateTitle?: (id: string, title: string) => Promise<void>;
  onOpen?: (ticket: Ticket) => void;
}

function SubTicketRow({
  subTicket,
  onToggleComplete,
  onDelete,
  onUpdateTitle,
  onOpen,
}: SubTicketRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(subTicket.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const isCompleted = subTicket.status === 'DONE';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (title.trim() && title !== subTicket.title && onUpdateTitle) {
      await onUpdateTitle(subTicket.id, title.trim());
    }
    setIsEditing(false);
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't open if clicking on checkbox, delete, or editing
    if ((e.target as HTMLElement).closest('button, input, [role="checkbox"]')) {
      return;
    }
    if (onOpen) {
      onOpen(subTicket);
    } else if (!isEditing) {
      setIsEditing(true);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={cn(
        'group flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer',
        isCompleted && 'opacity-60'
      )}
    >
      {/* Drag handle */}
      <GripVertical className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 cursor-grab flex-shrink-0" />

      {/* Checkbox */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) =>
          onToggleComplete?.(subTicket.id, !!checked)
        }
        className="data-[state=checked]:bg-sakura-400 data-[state=checked]:border-sakura-400 flex-shrink-0"
      />

      {/* Type badge */}
      <TicketTypeBadge type={subTicket.type} size="sm" />

      {/* Key */}
      <span className="text-xs text-gray-400 font-mono flex-shrink-0">
        {subTicket.key}
      </span>

      {/* Title - inline editable or clickable */}
      {isEditing && !onOpen ? (
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') {
              setTitle(subTicket.title);
              setIsEditing(false);
            }
          }}
          className="h-6 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm"
        />
      ) : (
        <span
          className={cn(
            'flex-1 text-sm truncate',
            isCompleted && 'line-through',
            onOpen && 'hover:text-sakura-500'
          )}
        >
          {subTicket.title}
        </span>
      )}

      {/* Priority icon */}
      <TicketPriorityIcon
        priority={subTicket.priority}
        size={14}
        className="flex-shrink-0"
      />

      {/* Open in full editor button */}
      {onOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(subTicket);
          }}
          className="p-1 text-gray-400 hover:text-sakura-500 opacity-0 group-hover:opacity-100 transition-all"
          title="Open in full editor"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(subTicket.id);
          }}
          className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
