'use client';

import { useState, useCallback, useMemo } from 'react';
import type { TicketStatus, TicketType, Priority } from '@prisma/client';

export interface TicketFilters {
  assigneeIds: string[];
  statuses: TicketStatus[];
  types: TicketType[];
  priorities: Priority[];
  storyPointsMin?: number;
  storyPointsMax?: number;
  search: string;
  projectId?: string | null;
  assigneeId?: string | null; // For "My Tickets" filter
}

const defaultFilters: TicketFilters = {
  assigneeIds: [],
  statuses: [],
  types: [],
  priorities: [],
  storyPointsMin: undefined,
  storyPointsMax: undefined,
  search: '',
  projectId: null,
  assigneeId: null,
};

export function useTicketFilters(initialFilters?: Partial<TicketFilters>) {
  const [filters, setFilters] = useState<TicketFilters>({
    ...defaultFilters,
    ...initialFilters,
  });

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.assigneeIds.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.types.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    if (
      filters.storyPointsMin !== undefined ||
      filters.storyPointsMax !== undefined
    )
      count++;
    if (filters.search) count++;
    if (filters.projectId) count++;
    if (filters.assigneeId) count++;
    return count;
  }, [filters]);

  const applyFilters = useCallback(
    <
      T extends {
        assigneeId?: string | null;
        status: TicketStatus;
        type: TicketType;
        priority: Priority;
        storyPoints?: number | null;
        key?: string;
        title: string;
        projectId?: string | null;
      },
    >(
      tickets: T[]
    ) => {
      return tickets.filter((ticket) => {
        // Assignee filter (for My Tickets)
        if (filters.assigneeId && ticket.assigneeId !== filters.assigneeId) {
          return false;
        }
        // Assignee IDs filter (legacy multi-select)
        if (
          filters.assigneeIds.length > 0 &&
          !filters.assigneeIds.includes(ticket.assigneeId || '')
        ) {
          return false;
        }
        // Project filter
        if (filters.projectId && ticket.projectId !== filters.projectId) {
          return false;
        }
        // Status filter
        if (
          filters.statuses.length > 0 &&
          !filters.statuses.includes(ticket.status)
        ) {
          return false;
        }
        // Type filter
        if (filters.types.length > 0 && !filters.types.includes(ticket.type)) {
          return false;
        }
        // Priority filter
        if (
          filters.priorities.length > 0 &&
          !filters.priorities.includes(ticket.priority)
        ) {
          return false;
        }
        // Story points filter
        if (
          filters.storyPointsMin !== undefined &&
          (ticket.storyPoints || 0) < filters.storyPointsMin
        ) {
          return false;
        }
        if (
          filters.storyPointsMax !== undefined &&
          (ticket.storyPoints || 0) > filters.storyPointsMax
        ) {
          return false;
        }
        // Search filter (ticket key or title)
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesKey = ticket.key?.toLowerCase().includes(searchLower);
          const matchesTitle = ticket.title
            ?.toLowerCase()
            .includes(searchLower);
          if (!matchesKey && !matchesTitle) {
            return false;
          }
        }
        return true;
      });
    },
    [filters]
  );

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const updateFilter = useCallback(
    <K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return {
    filters,
    setFilters,
    updateFilter,
    applyFilters,
    clearFilters,
    activeFilterCount,
  };
}
