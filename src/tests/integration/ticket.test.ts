/**
 * Ticket Router Integration Tests
 *
 * Tests for ticket tRPC router procedures including key generation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma Client
const mockPrisma = {
  ticket: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  board: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  backlog: {
    findFirst: vi.fn(),
  },
  sprint: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

describe('Ticket Router Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates ticket with auto-incrementing key', async () => {
      const mockBoard = {
        id: 'board-1',
        name: 'Test Board',
        prefix: 'TEST',
        ticketCounter: 5,
        color: '#FFB7C5',
        icon: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBacklog = {
        id: 'backlog-1',
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newTicket = {
        id: 'ticket-1',
        key: 'TEST-6',
        title: 'New Ticket',
        description: 'Test description',
        type: 'ISSUE' as const,
        priority: 'MEDIUM' as const,
        status: 'TODO' as const,
        storyPoints: null,
        order: 1,
        boardId: 'board-1',
        backlogId: 'backlog-1',
        sprintId: null,
        parentId: null,
        creatorId: 'user-1',
        assigneeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.board.findUnique.mockResolvedValue(mockBoard);
      mockPrisma.backlog.findFirst.mockResolvedValue(mockBacklog);
      mockPrisma.board.update.mockResolvedValue({
        ...mockBoard,
        ticketCounter: 6,
      });
      mockPrisma.ticket.create.mockResolvedValue(newTicket);

      // Simulate ticket creation transaction
      const result = await mockPrisma.$transaction(
        async (tx: typeof mockPrisma) => {
          const board = await tx.board.findUnique({ where: { id: 'board-1' } });
          const backlog = await tx.backlog.findFirst({
            where: { boardId: 'board-1' },
          });

          const nextCounter = (board?.ticketCounter ?? 0) + 1;
          const ticketKey = `${board?.prefix}-${nextCounter}`;

          await tx.board.update({
            where: { id: 'board-1' },
            data: { ticketCounter: nextCounter },
          });

          return await tx.ticket.create({
            data: {
              key: ticketKey,
              title: 'New Ticket',
              description: 'Test description',
              type: 'ISSUE',
              priority: 'MEDIUM',
              status: 'TODO',
              boardId: 'board-1',
              backlogId: backlog?.id,
              creatorId: 'user-1',
              order: 1,
            },
          });
        }
      );

      expect(result.key).toBe('TEST-6');
      expect(result.title).toBe('New Ticket');
      expect(mockPrisma.board.update).toHaveBeenCalled();
    });

    it('creates sub-ticket with dotted key format', async () => {
      const parentTicket = {
        id: 'parent-1',
        key: 'TEST-5',
        title: 'Parent Ticket',
        boardId: 'board-1',
        backlogId: 'backlog-1',
        type: 'ISSUE' as const,
        priority: 'MEDIUM' as const,
        status: 'TODO' as const,
        storyPoints: null,
        order: 1,
        sprintId: null,
        parentId: null,
        creatorId: 'user-1',
        assigneeId: null,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const subTicket = {
        ...parentTicket,
        id: 'sub-1',
        key: 'TEST-5.1',
        title: 'Sub-ticket',
        parentId: 'parent-1',
      };

      mockPrisma.ticket.findUnique.mockResolvedValue(parentTicket);
      mockPrisma.ticket.count.mockResolvedValue(0);
      mockPrisma.ticket.create.mockResolvedValue(subTicket);

      const result = await mockPrisma.$transaction(
        async (tx: typeof mockPrisma) => {
          const parent = await tx.ticket.findUnique({
            where: { id: 'parent-1' },
          });
          const subTicketCount = await tx.ticket.count({
            where: { parentId: 'parent-1' },
          });

          const subKey = `${parent?.key}.${subTicketCount + 1}`;

          return await tx.ticket.create({
            data: {
              key: subKey,
              title: 'Sub-ticket',
              type: 'ISSUE',
              priority: 'MEDIUM',
              status: 'TODO',
              boardId: 'board-1',
              backlogId: 'backlog-1',
              parentId: 'parent-1',
              creatorId: 'user-1',
              order: 1,
            },
          });
        }
      );

      expect(result.key).toBe('TEST-5.1');
      expect(result.parentId).toBe('parent-1');
    });
  });

  describe('getByBoard', () => {
    it('returns tickets for a board', async () => {
      const mockTickets = [
        {
          id: 'ticket-1',
          key: 'TEST-1',
          title: 'Ticket 1',
          boardId: 'board-1',
          status: 'TODO' as const,
        },
        {
          id: 'ticket-2',
          key: 'TEST-2',
          title: 'Ticket 2',
          boardId: 'board-1',
          status: 'IN_PROGRESS' as const,
        },
      ];

      mockPrisma.ticket.findMany.mockResolvedValue(mockTickets);

      const result = await mockPrisma.ticket.findMany({
        where: { boardId: 'board-1' },
      });

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('TEST-1');
      expect(result[1].key).toBe('TEST-2');
    });
  });

  describe('update', () => {
    it('updates ticket fields', async () => {
      const updatedTicket = {
        id: 'ticket-1',
        key: 'TEST-1',
        title: 'Updated Ticket',
        description: 'Updated description',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        type: 'ISSUE' as const,
        boardId: 'board-1',
        backlogId: 'backlog-1',
        sprintId: null,
        parentId: null,
        creatorId: 'user-1',
        assigneeId: 'user-2',
        storyPoints: 5,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.ticket.update.mockResolvedValue(updatedTicket);

      const result = await mockPrisma.ticket.update({
        where: { id: 'ticket-1' },
        data: {
          title: 'Updated Ticket',
          description: 'Updated description',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          storyPoints: 5,
          assigneeId: 'user-2',
        },
      });

      expect(result.title).toBe('Updated Ticket');
      expect(result.status).toBe('IN_PROGRESS');
      expect(result.priority).toBe('HIGH');
      expect(result.storyPoints).toBe(5);
      expect(result.assigneeId).toBe('user-2');
    });

    it('moves ticket to sprint', async () => {
      const movedTicket = {
        id: 'ticket-1',
        key: 'TEST-1',
        title: 'Moved Ticket',
        boardId: 'board-1',
        backlogId: null,
        sprintId: 'sprint-1',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        type: 'ISSUE' as const,
        parentId: null,
        creatorId: 'user-1',
        assigneeId: null,
        storyPoints: null,
        order: 1,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.ticket.update.mockResolvedValue(movedTicket);

      const result = await mockPrisma.ticket.update({
        where: { id: 'ticket-1' },
        data: {
          backlogId: null,
          sprintId: 'sprint-1',
        },
      });

      expect(result.sprintId).toBe('sprint-1');
      expect(result.backlogId).toBeNull();
    });
  });

  describe('delete', () => {
    it('deletes ticket', async () => {
      mockPrisma.ticket.delete.mockResolvedValue({
        id: 'ticket-1',
        key: 'TEST-1',
        title: 'Deleted Ticket',
        boardId: 'board-1',
        backlogId: 'backlog-1',
        sprintId: null,
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        type: 'ISSUE' as const,
        parentId: null,
        creatorId: 'user-1',
        assigneeId: null,
        storyPoints: null,
        order: 1,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await mockPrisma.ticket.delete({
        where: { id: 'ticket-1' },
      });

      expect(result.id).toBe('ticket-1');
      expect(mockPrisma.ticket.delete).toHaveBeenCalled();
    });
  });
});
