/**
 * BacklogKanban Component
 *
 * Kanban board view for backlog tickets
 * Similar to SprintKanban but for backlog context
 * Includes "Add to Sprint" action
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
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface BacklogKanbanProps {
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

const COLUMNS: { id: TicketStatus; colorClass: string; borderClass: string }[] =
  [
    {
      id: 'TODO',
      colorClass: 'bg-gradient-to-b from-gray-50 to-white',
      borderClass: 'border-l-4 border-l-gray-300',
    },
    {
      id: 'IN_PROGRESS',
      colorClass: 'bg-gradient-to-b from-blue-50 to-white',
      borderClass: 'border-l-4 border-l-blue-400',
    },
    {
      id: 'IN_REVIEW',
      colorClass: 'bg-gradient-to-b from-purple-50 to-white',
      borderClass: 'border-l-4 border-l-purple-400',
    },
    {
      id: 'DONE',
      colorClass: 'bg-gradient-to-b from-green-50 to-white',
      borderClass: 'border-l-4 border-l-green-400',
    },
  ];

export function BacklogKanban({
  tickets,
  onStatusChange,
  onTicketClick,
  onCreateTicket,
  onSubTicketToggle,
  onQuickAddSubTicket,
  isLoading = false,
}: BacklogKanbanProps) {
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
                  'flex items-center justify-between rounded-lg p-3',
                  column.colorClass,
                  column.borderClass
                )}
              >
                <h3 className="text-sm font-semibold text-gray-900">
                  {t(
                    `ticket.status.${column.id.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}`
                  )}
                </h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-medium text-gray-600">
                  {columnTickets.length}
                </span>
              </div>

              {/* Droppable Area */}
              <SortableContext
                id={column.id}
                items={columnTickets.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className={cn(
                    'flex flex-1 flex-col gap-3 rounded-lg border-2 border-dashed border-transparent p-3 transition-colors',
                    activeTicket &&
                      activeTicket.status !== column.id &&
                      'border-sakura-300 bg-sakura-50'
                  )}
                >
                  {columnTickets.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                      <p className="text-sm text-gray-400">
                        {t('backlog.noTicketsInColumn')}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCreateTicket(column.id)}
                    className="mt-2 w-full justify-start gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <Plus className="h-4 w-4" />
                    {t('backlog.addTicket')}
                  </Button>
                </div>
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
