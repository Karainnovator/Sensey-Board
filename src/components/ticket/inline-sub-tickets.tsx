'use client';

import { useState, useRef, useEffect } from 'react';
import type { Ticket } from '@prisma/client';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { SubTicketProgressBar } from './sub-ticket-progress-bar';
import { useTranslations } from 'next-intl';
import { ChevronDown, Plus } from 'lucide-react';

interface InlineSubTicketsProps {
  subTickets: Ticket[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  onQuickAdd?: (title: string) => Promise<void>;
  maxVisible?: number;
  className?: string;
}

export function InlineSubTickets({
  subTickets,
  isExpanded,
  onToggleExpand,
  onToggleComplete,
  onQuickAdd,
  maxVisible = 3,
  className,
}: InlineSubTicketsProps) {
  const t = useTranslations('ticket.inlineSubTickets');
  const [showAll, setShowAll] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const completed = subTickets.filter((t) => t.status === 'DONE').length;
  const total = subTickets.length;

  // Focus input when adding
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  // Determine which tickets to show
  const visibleTickets = showAll ? subTickets : subTickets.slice(0, maxVisible);
  const hiddenCount = subTickets.length - maxVisible;

  const handleQuickAdd = async () => {
    if (!newTitle.trim() || !onQuickAdd) return;
    try {
      await onQuickAdd(newTitle.trim());
      setNewTitle('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add sub-ticket:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTitle('');
    }
  };

  if (total === 0) return null;

  return (
    <div className={cn('space-y-1', className)}>
      {/* Progress bar (always visible) */}
      <SubTicketProgressBar
        completed={completed}
        total={total}
        onClick={onToggleExpand}
        size="sm"
      />

      {/* Expanded section */}
      {isExpanded && (
        <div
          className={cn(
            'mt-2 pt-2 border-t border-gray-100 space-y-1',
            'animate-in slide-in-from-top-1 duration-200'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sub-ticket list */}
          {visibleTickets.map((subTicket) => (
            <div
              key={subTicket.id}
              className="flex items-center gap-2 py-0.5 group"
            >
              <Checkbox
                checked={subTicket.status === 'DONE'}
                onCheckedChange={(checked) =>
                  onToggleComplete(subTicket.id, checked === true)
                }
                className="h-3.5 w-3.5 data-[state=checked]:bg-sakura-400 data-[state=checked]:border-sakura-400"
              />
              <span
                className={cn(
                  'text-[10px] flex-1 truncate',
                  subTicket.status === 'DONE' && 'line-through text-gray-400'
                )}
              >
                {subTicket.title}
              </span>
              <span className="text-[9px] font-mono text-gray-400">
                {subTicket.key}
              </span>
            </div>
          ))}

          {/* Show more button */}
          {hiddenCount > 0 && !showAll && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(true);
              }}
              className="flex items-center gap-1 text-[10px] text-sakura-500 hover:text-sakura-600 py-0.5"
            >
              <ChevronDown className="h-3 w-3" />
              {t('showMore', { count: hiddenCount })}
            </button>
          )}

          {/* Show less button */}
          {showAll && hiddenCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(false);
              }}
              className="flex items-center gap-1 text-[10px] text-sakura-500 hover:text-sakura-600 py-0.5"
            >
              <ChevronDown className="h-3 w-3 rotate-180" />
              {t('showLess')}
            </button>
          )}

          {/* Quick add input */}
          {onQuickAdd && (
            <>
              {isAdding ? (
                <div className="flex items-center gap-1 mt-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      if (!newTitle.trim()) {
                        setIsAdding(false);
                      }
                    }}
                    placeholder={t('quickAdd')}
                    className="flex-1 text-[10px] bg-transparent border-b border-gray-200 focus:border-sakura-400 focus:outline-none py-0.5"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAdding(true);
                  }}
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 py-0.5 mt-1"
                >
                  <Plus className="h-3 w-3" />
                  {t('quickAdd')}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
