/**
 * Database Seed Script
 * Creates demo data for development and testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.backlog.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      id: 'dev-user-1',
      email: 'demo@sensey.dev',
      name: 'Demo User',
      role: 'ADMIN',
      externalId: 'dev-external-id',
    },
  });
  console.log('✅ Created demo user:', demoUser.email);

  // Create parent board (Sensey)
  const senseyBoard = await prisma.board.create({
    data: {
      name: 'Sensey',
      description: 'Main Sensey project board',
      prefix: 'SENS',
      color: '#FFB7C5',
      ticketCounter: 0,
    },
  });

  // Create backlog for Sensey
  const senseyBacklog = await prisma.backlog.create({
    data: { boardId: senseyBoard.id },
  });

  // Add demo user as owner
  await prisma.boardMember.create({
    data: {
      boardId: senseyBoard.id,
      userId: demoUser.id,
      role: 'OWNER',
    },
  });
  console.log('✅ Created board:', senseyBoard.name);

  // Create child boards
  const mdfBoard = await prisma.board.create({
    data: {
      name: 'MDF Board',
      description: 'MDF product development',
      prefix: 'MDF',
      color: '#4ADE80',
      parentBoardId: senseyBoard.id,
      ticketCounter: 0,
    },
  });

  await prisma.backlog.create({ data: { boardId: mdfBoard.id } });
  await prisma.boardMember.create({
    data: { boardId: mdfBoard.id, userId: demoUser.id, role: 'OWNER' },
  });
  console.log('✅ Created child board:', mdfBoard.name);

  const fepatexBoard = await prisma.board.create({
    data: {
      name: 'Fepatex Board',
      description: 'Fepatex product development',
      prefix: 'FEP',
      color: '#60A5FA',
      parentBoardId: senseyBoard.id,
      ticketCounter: 0,
    },
  });

  await prisma.backlog.create({ data: { boardId: fepatexBoard.id } });
  await prisma.boardMember.create({
    data: { boardId: fepatexBoard.id, userId: demoUser.id, role: 'OWNER' },
  });
  console.log('✅ Created child board:', fepatexBoard.name);

  // Create sprint for Sensey
  const sprint = await prisma.sprint.create({
    data: {
      number: 1,
      name: 'Sprint 1',
      goal: 'Initial setup and core features',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      boardId: senseyBoard.id,
    },
  });
  console.log('✅ Created sprint:', sprint.name);

  // Create sample tickets
  const ticketData = [
    {
      title: 'Setup project structure',
      description: 'Initialize Next.js project with all dependencies',
      type: 'ISSUE' as const,
      priority: 'HIGH' as const,
      status: 'DONE' as const,
      storyPoints: 3,
    },
    {
      title: 'Implement authentication',
      description: 'Setup Azure AD authentication with NextAuth',
      type: 'ISSUE' as const,
      priority: 'HIGHEST' as const,
      status: 'IN_PROGRESS' as const,
      storyPoints: 5,
    },
    {
      title: 'Create board management UI',
      description: 'Build board cards, grid, and creation dialog',
      type: 'ISSUE' as const,
      priority: 'HIGH' as const,
      status: 'TODO' as const,
      storyPoints: 8,
    },
    {
      title: 'Fix login redirect issue',
      description: 'Users are redirected to wrong port after login',
      type: 'FIX' as const,
      priority: 'MEDIUM' as const,
      status: 'TODO' as const,
      storyPoints: 2,
    },
  ];

  for (let i = 0; i < ticketData.length; i++) {
    const ticketInfo = ticketData[i];
    if (!ticketInfo) continue;

    await prisma.board.update({
      where: { id: senseyBoard.id },
      data: { ticketCounter: { increment: 1 } },
    });

    const ticket = await prisma.ticket.create({
      data: {
        key: `SENS-${i + 1}`,
        title: ticketInfo.title,
        description: ticketInfo.description,
        type: ticketInfo.type,
        priority: ticketInfo.priority,
        status: ticketInfo.status,
        storyPoints: ticketInfo.storyPoints,
        order: i,
        boardId: senseyBoard.id,
        sprintId: sprint.id,
        creatorId: demoUser.id,
      },
    });
    console.log('✅ Created ticket:', ticket.key);
  }

  // Create backlog tickets
  const backlogTicketData = [
    {
      title: 'Add dark mode support',
      description: 'Implement theme switching with Tailwind',
      type: 'ISSUE' as const,
      priority: 'LOW' as const,
      storyPoints: 5,
    },
    {
      title: 'Performance optimization',
      description: 'Optimize bundle size and loading times',
      type: 'ISSUE' as const,
      priority: 'MEDIUM' as const,
      storyPoints: 8,
    },
  ];

  for (let i = 0; i < backlogTicketData.length; i++) {
    const ticketInfo = backlogTicketData[i];
    if (!ticketInfo) continue;

    await prisma.board.update({
      where: { id: senseyBoard.id },
      data: { ticketCounter: { increment: 1 } },
    });

    await prisma.ticket.create({
      data: {
        key: `SENS-${ticketData.length + i + 1}`,
        title: ticketInfo.title,
        description: ticketInfo.description,
        type: ticketInfo.type,
        priority: ticketInfo.priority,
        storyPoints: ticketInfo.storyPoints,
        status: 'TODO',
        order: i,
        boardId: senseyBoard.id,
        backlogId: senseyBacklog.id,
        creatorId: demoUser.id,
      },
    });
  }

  console.log('✅ Created backlog tickets');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
