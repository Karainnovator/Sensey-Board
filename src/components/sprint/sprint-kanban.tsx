/**
 * SprintKanban Component
 *
 * Kanban board view for sprint tickets
 * Per visual-design-reference.md section 5:
 * - 4 columns: TODO, IN_PROGRESS, IN_REVIEW, DONE
 * - Column headers with count
 * - Column colors (gray-50, blue-50, purple-50, green-50)
 * - Drag states with dashed border, sakura-100 background
 */

'use client';

import { useState } from 'react';
import type { TicketStatus } from '@prisma/client';
import type { TicketWithRelations } from '@/types/database';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  TicketCard,
  TicketCardSkeleton,
} from '@/components/ticket/ticket-card';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SprintKanbanProps {
  tickets: TicketWithRelations[];
  onStatusChange: (ticketId: string, newStatus: TicketStatus) => Promise<void>;
  onTicketClick: (ticket: TicketWithRelations) => void;
  onCreateTicket: (status: TicketStatus) => void;
  onSubTicketToggle?: (
    subTicketId: string,
    completed: boolean
  ) => Promise<void>;
  onQuickAddSubTicket?: (parentId: string, title: string) => Promise<void>;
  isLoading?: boolean;
}

const COLUMNS: {
  id: TicketStatus;
  colorClass: string;
  borderClass: string;
  countClass: string;
}[] = [
  {
    id: 'TODO',
    colorClass: 'bg-gray-50',
    borderClass: 'border-l-4 border-l-gray-300',
    countClass: 'bg-gray-200 text-gray-700',
  },
  {
    id: 'IN_PROGRESS',
    colorClass: 'bg-blue-50',
    borderClass: 'border-l-4 border-l-blue-400',
    countClass: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'IN_REVIEW',
    colorClass: 'bg-purple-50',
    borderClass: 'border-l-4 border-l-purple-400',
    countClass: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'DONE',
    colorClass: 'bg-green-50',
    borderClass: 'border-l-4 border-l-green-400',
    countClass: 'bg-green-100 text-green-700',
  },
];

// Droppable column component
function DroppableColumn({
  id,
  children,
  isOver,
}: {
  id: string;
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-1 flex-col gap-3 rounded-lg border-2 border-dashed border-transparent p-3 transition-colors',
        isOver && 'border-sakura-300 bg-sakura-50'
      )}
    >
      {children}
    </div>
  );
}

export function SprintKanban({
  tickets,
  onStatusChange,
  onTicketClick,
  onCreateTicket,
  onSubTicketToggle,
  onQuickAddSubTicket,
  isLoading = false,
}: SprintKanbanProps) {
  const t = useTranslations();
  const [activeTicket, setActiveTicket] = useState<TicketWithRelations | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find((t) => t.id === event.active.id);
    setActiveTicket(ticket ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as TicketStatus;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    if (ticket.status !== newStatus) {
      onStatusChange(ticketId, newStatus);
    }
  };

  const getTicketsByStatus = (status: TicketStatus) => {
    return tickets.filter((ticket) => ticket.status === status);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 p-6">
        {COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col gap-3">
            <div className={cn('rounded-lg p-3', column.colorClass)}>
              <div className="h-6 w-24 animate-pulse rounded bg-gray-300" />
            </div>
            <div className="flex flex-col gap-3">
              <TicketCardSkeleton />
              <TicketCardSkeleton />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4 p-6">
        {COLUMNS.map((column) => {
          const columnTickets = getTicketsByStatus(column.id);

          return (
            <div key={column.id} className="flex min-h-[500px] flex-col gap-3">
              {/* Column Header */}
              <div
                className={cn(
                  'flex items-center justify-between rounded-xl p-3.5',
                  column.colorClass,
                  column.borderClass
                )}
              >
                <h3 className="text-sm font-semibold text-gray-800">
                  {t(
                    `ticket.status.${column.id.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}`
                  )}
                </h3>
                <span
                  className={cn(
                    'flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold',
                    column.countClass
                  )}
                >
                  {columnTickets.length}
                </span>
              </div>

              {/* Droppable Area */}
              <SortableContext
                id={column.id}
                items={columnTickets.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableColumn
                  id={column.id}
                  isOver={
                    activeTicket !== null && activeTicket.status !== column.id
                  }
                >
                  {columnTickets.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-8">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                        <Plus className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-400 text-center">
                        {t('sprint.noTicketsInColumn')}
                      </p>
                    </div>
                  ) : (
                    columnTickets.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => onTicketClick(ticket)}
                        isDraggable={true}
                        onSubTicketToggle={onSubTicketToggle}
                        onQuickAddSubTicket={onQuickAddSubTicket}
                      />
                    ))
                  )}

                  {/* Add Ticket Button */}
                  <button
                    onClick={() => onCreateTicket(column.id)}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-sakura-300 hover:text-sakura-500 hover:bg-sakura-50 transition-all duration-150"
                  >
                    <Plus className="h-4 w-4" />
                    {t('sprint.addTicket')}
                  </button>
                </DroppableColumn>
              </SortableContext>
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTicket ? (
          <TicketCard ticket={activeTicket} isDraggable={false} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
