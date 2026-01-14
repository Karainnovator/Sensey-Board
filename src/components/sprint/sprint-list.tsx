/**
 * SprintList Component
 *
 * List view for sprint tickets
 * Per visual-design-reference.md section 6:
 * - Uses TicketRow component
 * - Sortable columns
 * - Hierarchy support with expand/collapse
 */

'use client';

import { useState, useMemo } from 'react';
import type { TicketWithRelations } from '@/types/database';
import {
  TicketRow,
  TicketListHeader,
  TicketRowSkeleton,
} from '@/components/ticket/ticket-row';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SprintListProps {
  tickets: TicketWithRelations[];
  onTicketClick: (ticket: TicketWithRelations) => void;
  onCreateTicket: () => void;
  isLoading?: boolean;
}

export function SprintList({
  tickets,
  onTicketClick,
  onCreateTicket,
  isLoading = false,
}: SprintListProps) {
  const [sortConfig, setSortConfig] = useState<
    { column: string; direction: 'asc' | 'desc' } | undefined
  >();

  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction:
        prev?.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filter to show only parent tickets (sub-tickets are rendered recursively)
  const parentTickets = useMemo(() => {
    return tickets.filter((ticket) => !ticket.parentId);
  }, [tickets]);

  // Create sorted tickets (sort PARENT tickets only, not all)
  const sortedTickets = useMemo(() => {
    if (!sortConfig) return parentTickets;

    const priorityOrder: Record<string, number> = {
      LOWEST: 0,
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      HIGHEST: 4,
    };

    return [...parentTickets].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortConfig.column) {
        case 'key':
          aVal = a.key;
          bVal = b.key;
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'type':
          aVal = a.type;
          bVal = b.type;
          break;
        case 'priority':
          aVal = priorityOrder[a.priority] ?? 2;
          bVal = priorityOrder[b.priority] ?? 2;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'assignee':
          aVal = a.assignee?.name?.toLowerCase() ?? 'zzz';
          bVal = b.assignee?.name?.toLowerCase() ?? 'zzz';
          break;
        default:
          return 0;
      }
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [parentTickets, sortConfig]);

  if (isLoading) {
    return (
      <div className="flex flex-col border border-gray-200 bg-white">
        <TicketListHeader sortConfig={sortConfig} onSort={handleSort} />
        <div className="flex flex-col">
          <TicketRowSkeleton />
          <TicketRowSkeleton />
          <TicketRowSkeleton />
          <TicketRowSkeleton />
          <TicketRowSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Table */}
      <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        <TicketListHeader sortConfig={sortConfig} onSort={handleSort} />

        {/* Ticket Rows */}
        <div className="flex flex-col">
          {sortedTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-gray-500">No tickets in this sprint</p>
              <p className="mt-1 text-xs text-gray-400">
                Create a ticket to get started
              </p>
            </div>
          ) : (
            sortedTickets.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                onClick={() => onTicketClick(ticket)}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Ticket Button */}
      <Button
        onClick={onCreateTicket}
        variant="outline"
        className="w-fit gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Ticket
      </Button>
    </div>
  );
}
