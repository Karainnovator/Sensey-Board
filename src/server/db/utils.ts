import { prisma } from './index';
import type { Board, Ticket } from '@prisma/client';

/**
 * Generate next ticket key for a board
 */
export async function generateTicketKey(boardId: string): Promise<string> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: { prefix: true, ticketCounter: true },
  });

  if (!board) {
    throw new Error(`Board with id ${boardId} not found`);
  }

  const nextNumber = board.ticketCounter + 1;

  await prisma.board.update({
    where: { id: boardId },
    data: { ticketCounter: nextNumber },
  });

  return `${board.prefix}-${nextNumber}`;
}

/**
 * Get next order value for tickets in a specific location
 */
export async function getNextTicketOrder(location: {
  backlogId?: string;
  sprintId?: string;
}): Promise<number> {
  const tickets = await prisma.ticket.findMany({
    where: location,
    orderBy: { order: 'desc' },
    take: 1,
    select: { order: true },
  });

  return tickets.length > 0 && tickets[0] ? tickets[0].order + 1 : 1;
}

/**
 * Reorder tickets after drag and drop
 */
export async function reorderTickets(
  ticketId: string,
  newOrder: number
): Promise<void> {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { order: newOrder },
  });
}

/**
 * Move unfinished tickets from sprint to backlog
 */
export async function moveUnfinishedTicketsToBacklog(
  sprintId: string,
  backlogId: string
): Promise<number> {
  const result = await prisma.ticket.updateMany({
    where: {
      sprintId,
      status: { not: 'DONE' },
    },
    data: {
      sprintId: null,
      backlogId,
    },
  });

  return result.count;
}

/**
 * Auto-migrate unfinished tickets to new sprint
 */
export async function autoMigrateTicketsToNewSprint(
  oldSprintId: string,
  newSprintId: string
): Promise<number> {
  const result = await prisma.ticket.updateMany({
    where: {
      sprintId: oldSprintId,
      status: { not: 'DONE' },
    },
    data: {
      sprintId: newSprintId,
    },
  });

  return result.count;
}

/**
 * Get board hierarchy path
 */
export async function getBoardHierarchy(boardId: string): Promise<Board[]> {
  const hierarchy: Board[] = [];
  let currentBoard = await prisma.board.findUnique({
    where: { id: boardId },
  });

  while (currentBoard) {
    hierarchy.unshift(currentBoard);
    if (currentBoard.parentBoardId) {
      currentBoard = await prisma.board.findUnique({
        where: { id: currentBoard.parentBoardId },
      });
    } else {
      currentBoard = null;
    }
  }

  return hierarchy;
}

/**
 * Get all sub-tickets recursively
 */
export async function getSubTicketsRecursive(
  parentId: string
): Promise<Ticket[]> {
  const directChildren = await prisma.ticket.findMany({
    where: { parentId },
    orderBy: { order: 'asc' },
  });

  const allSubTickets: Ticket[] = [...directChildren];

  for (const child of directChildren) {
    const grandChildren = await getSubTicketsRecursive(child.id);
    allSubTickets.push(...grandChildren);
  }

  return allSubTickets;
}

/**
 * Check if user has access to a board
 */
export async function userHasAccessToBoard(
  userId: string,
  boardId: string
): Promise<boolean> {
  const membership = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });

  return !!membership;
}

/**
 * Check if user has specific role on board
 */
export async function userHasBoardRole(
  userId: string,
  boardId: string,
  minRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
): Promise<boolean> {
  const membership = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });

  if (!membership) return false;

  const roleHierarchy = ['VIEWER', 'MEMBER', 'ADMIN', 'OWNER'];
  const userRoleLevel = roleHierarchy.indexOf(membership.role);
  const minRoleLevel = roleHierarchy.indexOf(minRole);

  return userRoleLevel >= minRoleLevel;
}

/**
 * Get active sprint for a board
 */
export async function getActiveSprint(boardId: string) {
  return prisma.sprint.findFirst({
    where: { boardId, status: 'ACTIVE' },
    include: {
      tickets: {
        include: {
          assignee: true,
          creator: true,
          labels: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  });
}

/**
 * Calculate sprint progress
 */
export async function calculateSprintProgress(sprintId: string) {
  const tickets = await prisma.ticket.findMany({
    where: { sprintId },
    select: { status: true, storyPoints: true },
  });

  const total = tickets.length;
  const completed = tickets.filter((t) => t.status === 'DONE').length;
  const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReview = tickets.filter((t) => t.status === 'IN_REVIEW').length;
  const todo = tickets.filter((t) => t.status === 'TODO').length;

  const totalPoints = tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedPoints = tickets
    .filter((t) => t.status === 'DONE')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return {
    total,
    completed,
    inProgress,
    inReview,
    todo,
    totalPoints,
    completedPoints,
    completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    pointsCompletionPercentage:
      totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
  };
}
