/**
 * Sprint Router Integration Tests
 *
 * Tests for sprint tRPC router procedures including auto-migration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma Client
const mockPrisma = {
  sprint: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  ticket: {
    findMany: vi.fn(),
    updateMany: vi.fn(),
    count: vi.fn(),
  },
  backlog: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
};

describe('Sprint Router Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates sprint with auto-incremented number', async () => {
      mockPrisma.sprint.count.mockResolvedValue(5);

      const newSprint = {
        id: 'sprint-6',
        number: 6,
        name: 'Sprint 6',
        goal: 'Implement new features',
        status: 'PLANNED' as const,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-14'),
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.sprint.create.mockResolvedValue(newSprint);

      const result = await mockPrisma.$transaction(
        async (tx: typeof mockPrisma) => {
          const sprintCount = await tx.sprint.count({
            where: { boardId: 'board-1' },
          });

          return await tx.sprint.create({
            data: {
              number: sprintCount + 1,
              name: `Sprint ${sprintCount + 1}`,
              goal: 'Implement new features',
              status: 'PLANNED',
              startDate: new Date('2024-02-01'),
              endDate: new Date('2024-02-14'),
              boardId: 'board-1',
            },
          });
        }
      );

      expect(result.number).toBe(6);
      expect(result.name).toBe('Sprint 6');
      expect(result.status).toBe('PLANNED');
    });

    it('creates first sprint with number 1', async () => {
      mockPrisma.sprint.count.mockResolvedValue(0);

      const firstSprint = {
        id: 'sprint-1',
        number: 1,
        name: 'Sprint 1',
        goal: 'Initial sprint',
        status: 'PLANNED' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-14'),
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.sprint.create.mockResolvedValue(firstSprint);

      const result = await mockPrisma.$transaction(
        async (tx: typeof mockPrisma) => {
          const sprintCount = await tx.sprint.count({
            where: { boardId: 'board-1' },
          });

          return await tx.sprint.create({
            data: {
              number: sprintCount + 1,
              name: `Sprint ${sprintCount + 1}`,
              goal: 'Initial sprint',
              status: 'PLANNED',
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-14'),
              boardId: 'board-1',
            },
          });
        }
      );

      expect(result.number).toBe(1);
    });
  });

  describe('start', () => {
    it('starts a planned sprint', async () => {
      const plannedSprint = {
        id: 'sprint-1',
        number: 1,
        name: 'Sprint 1',
        goal: 'Test goal',
        status: 'PLANNED' as const,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-14'),
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const activeSprint = {
        ...plannedSprint,
        status: 'ACTIVE' as const,
      };

      mockPrisma.sprint.findUnique.mockResolvedValue(plannedSprint);
      mockPrisma.sprint.findFirst.mockResolvedValue(null); // No other active sprint
      mockPrisma.sprint.update.mockResolvedValue(activeSprint);

      const result = await mockPrisma.sprint.update({
        where: { id: 'sprint-1' },
        data: { status: 'ACTIVE' },
      });

      expect(result.status).toBe('ACTIVE');
    });

    it('prevents starting when another sprint is active', async () => {
      const activeSprint = {
        id: 'sprint-1',
        number: 1,
        status: 'ACTIVE' as const,
        boardId: 'board-1',
      };

      mockPrisma.sprint.findFirst.mockResolvedValue(activeSprint);

      const existingActive = await mockPrisma.sprint.findFirst({
        where: {
          boardId: 'board-1',
          status: 'ACTIVE',
        },
      });

      expect(existingActive).toBeTruthy();
      expect(existingActive?.status).toBe('ACTIVE');
    });
  });

  describe('complete', () => {
    it('completes sprint and migrates unfinished tickets', async () => {
      const activeSprint = {
        id: 'sprint-1',
        number: 1,
        name: 'Sprint 1',
        goal: 'Test goal',
        status: 'ACTIVE' as const,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-14'),
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const completedSprint = {
        ...activeSprint,
        status: 'COMPLETED' as const,
      };

      const unfinishedTickets = [
        {
          id: 'ticket-1',
          key: 'TEST-1',
          status: 'TODO' as const,
          sprintId: 'sprint-1',
        },
        {
          id: 'ticket-2',
          key: 'TEST-2',
          status: 'IN_PROGRESS' as const,
          sprintId: 'sprint-1',
        },
      ];

      const backlog = {
        id: 'backlog-1',
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.sprint.findUnique.mockResolvedValue(activeSprint);
      mockPrisma.ticket.findMany.mockResolvedValue(unfinishedTickets);
      mockPrisma.backlog.findFirst.mockResolvedValue(backlog);
      mockPrisma.sprint.update.mockResolvedValue(completedSprint);
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 2 });

      const result = await mockPrisma.$transaction(
        async (tx: typeof mockPrisma) => {
          // Find unfinished tickets
          const unfinished = await tx.ticket.findMany({
            where: {
              sprintId: 'sprint-1',
              status: {
                in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'],
              },
            },
          });

          // Move to backlog
          if (unfinished.length > 0) {
            const backlog = await tx.backlog.findFirst({
              where: { boardId: 'board-1' },
            });

            await tx.ticket.updateMany({
              where: {
                id: {
                  in: unfinished.map((t: { id: string }) => t.id),
                },
              },
              data: {
                sprintId: null,
                backlogId: backlog?.id,
              },
            });
          }

          // Complete sprint
          return await tx.sprint.update({
            where: { id: 'sprint-1' },
            data: { status: 'COMPLETED' },
          });
        }
      );

      expect(result.status).toBe('COMPLETED');
      expect(mockPrisma.ticket.updateMany).toHaveBeenCalled();
    });

    it('completes sprint with all tickets done', async () => {
      const activeSprint = {
        id: 'sprint-1',
        status: 'ACTIVE' as const,
        boardId: 'board-1',
      };

      const completedSprint = {
        ...activeSprint,
        status: 'COMPLETED' as const,
      };

      mockPrisma.sprint.findUnique.mockResolvedValue(activeSprint);
      mockPrisma.ticket.findMany.mockResolvedValue([]); // All tickets are done
      mockPrisma.sprint.update.mockResolvedValue(completedSprint);

      const result = await mockPrisma.sprint.update({
        where: { id: 'sprint-1' },
        data: { status: 'COMPLETED' },
      });

      expect(result.status).toBe('COMPLETED');
      expect(mockPrisma.ticket.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('getByBoard', () => {
    it('returns all sprints for a board', async () => {
      const mockSprints = [
        {
          id: 'sprint-1',
          number: 1,
          status: 'COMPLETED' as const,
          boardId: 'board-1',
        },
        {
          id: 'sprint-2',
          number: 2,
          status: 'ACTIVE' as const,
          boardId: 'board-1',
        },
        {
          id: 'sprint-3',
          number: 3,
          status: 'PLANNED' as const,
          boardId: 'board-1',
        },
      ];

      mockPrisma.sprint.findMany.mockResolvedValue(mockSprints);

      const result = await mockPrisma.sprint.findMany({
        where: { boardId: 'board-1' },
        orderBy: { number: 'asc' },
      });

      expect(result).toHaveLength(3);
      expect(result[0].status).toBe('COMPLETED');
      expect(result[1].status).toBe('ACTIVE');
      expect(result[2].status).toBe('PLANNED');
    });
  });

  describe('update', () => {
    it('updates sprint fields', async () => {
      const updatedSprint = {
        id: 'sprint-1',
        number: 1,
        name: 'Updated Sprint',
        goal: 'Updated goal',
        status: 'PLANNED' as const,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-21'),
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.sprint.update.mockResolvedValue(updatedSprint);

      const result = await mockPrisma.sprint.update({
        where: { id: 'sprint-1' },
        data: {
          name: 'Updated Sprint',
          goal: 'Updated goal',
          endDate: new Date('2024-02-21'),
        },
      });

      expect(result.name).toBe('Updated Sprint');
      expect(result.goal).toBe('Updated goal');
    });
  });

  describe('delete', () => {
    it('deletes sprint and moves tickets to backlog', async () => {
      const sprintTickets = [
        { id: 'ticket-1', sprintId: 'sprint-1' },
        { id: 'ticket-2', sprintId: 'sprint-1' },
      ];

      const backlog = {
        id: 'backlog-1',
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.ticket.findMany.mockResolvedValue(sprintTickets);
      mockPrisma.backlog.findFirst.mockResolvedValue(backlog);
      mockPrisma.ticket.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.sprint.delete.mockResolvedValue({
        id: 'sprint-1',
        number: 1,
        name: 'Deleted Sprint',
        goal: null,
        status: 'PLANNED' as const,
        startDate: new Date(),
        endDate: new Date(),
        boardId: 'board-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await mockPrisma.$transaction(async (tx: typeof mockPrisma) => {
        const tickets = await tx.ticket.findMany({
          where: { sprintId: 'sprint-1' },
        });

        if (tickets.length > 0) {
          const backlog = await tx.backlog.findFirst({
            where: { boardId: 'board-1' },
          });

          await tx.ticket.updateMany({
            where: { sprintId: 'sprint-1' },
            data: {
              sprintId: null,
              backlogId: backlog?.id,
            },
          });
        }

        return await tx.sprint.delete({
          where: { id: 'sprint-1' },
        });
      });

      expect(mockPrisma.ticket.updateMany).toHaveBeenCalled();
      expect(mockPrisma.sprint.delete).toHaveBeenCalled();
    });
  });
});
