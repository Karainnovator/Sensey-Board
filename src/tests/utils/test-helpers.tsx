/**
 * Test Utilities and Helpers
 *
 * Common utilities for testing components and features
 */

import React, { type ReactElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';

/**
 * Create a test query client with disabled retries
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper with all necessary providers
 */
function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/**
 * Custom render with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

/**
 * Mock Data
 */
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'ADMIN' as const,
  externalId: 'ext-1',
  avatar: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockBoard = {
  id: 'board-1',
  name: 'Test Board',
  description: 'A test board',
  prefix: 'TEST',
  color: '#FFB7C5',
  icon: '🎯',
  ticketCounter: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockTicket = {
  id: 'ticket-1',
  key: 'TEST-1',
  title: 'Test Ticket',
  description: 'A test ticket',
  type: 'ISSUE' as const,
  priority: 'MEDIUM' as const,
  status: 'TODO' as const,
  storyPoints: 3,
  order: 1,
  boardId: 'board-1',
  backlogId: 'backlog-1',
  sprintId: null,
  parentId: null,
  creatorId: 'user-1',
  assigneeId: null,
  reviewerId: null,
  percentage: 0,
  weight: 1,
  missionRank: null,
  projectId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockSprint = {
  id: 'sprint-1',
  number: 1,
  name: 'Sprint 1',
  goal: 'Test goal',
  status: 'ACTIVE' as const,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-14'),
  boardId: 'board-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockBoardMember = {
  id: 'member-1',
  boardId: 'board-1',
  userId: 'user-1',
  role: 'OWNER' as const,
  createdAt: new Date('2024-01-01'),
  user: mockUser,
};

/**
 * Helper to create mock tickets with sub-tickets
 */
export function createMockTicketWithSubTickets(
  parentKey: string,
  subTicketCount = 2
) {
  const parent = {
    ...mockTicket,
    key: parentKey,
    id: `parent-${parentKey}`,
  };

  const subTickets = Array.from({ length: subTicketCount }, (_, i) => ({
    ...mockTicket,
    key: `${parentKey}.${i + 1}`,
    id: `sub-${parentKey}-${i + 1}`,
    parentId: parent.id,
    title: `Sub-ticket ${i + 1}`,
    reviewerId: null,
    percentage: 0,
    weight: 1,
    missionRank: null,
    projectId: null,
  }));

  return { ...parent, subTickets };
}

/**
 * Helper to wait for async operations
 */
export const waitFor = async (ms = 100) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
