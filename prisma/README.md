# Database Setup - Sensey Board

This directory contains the Prisma schema, migrations, and seed data for Sensey Board.

## Schema Overview

### Models

1. **User** - Authentication and user management
   - Integration with Keycloak via `keycloakId`
   - Global roles: ADMIN, MEMBER, GUEST

2. **Board** - Project boards
   - Unique prefix (max 5 chars) for ticket keys
   - Customizable color and icon
   - Hierarchy support (parent/child boards)
   - Automatic ticket counter for key generation

3. **BoardMember** - Board membership and roles
   - Board-specific roles: OWNER, ADMIN, MEMBER, VIEWER
   - Unique constraint on boardId + userId

4. **Backlog** - One backlog per board
   - Automatically created with board
   - Contains unscheduled tickets

5. **Sprint** - Time-boxed iterations
   - Sequential numbering per board
   - Status: PLANNED, ACTIVE, COMPLETED
   - Start/end dates with goals

6. **Ticket** - Work items
   - Types: ISSUE, FIX, HOTFIX, PROBLEM
   - Status: TODO, IN_PROGRESS, IN_REVIEW, DONE
   - Priority: LOWEST to HIGHEST
   - Hierarchy support (parent/sub-tickets)
   - Flexible order field for drag-drop

7. **Comment** - Ticket discussions
   - Linked to tickets and users
   - Timestamps for audit trail

8. **Label** - Ticket categorization
   - Reusable across tickets
   - Custom colors

## Scripts

### Generate Prisma Client

```bash
bun run db:generate
```

### Create Migration

```bash
bun run db:migrate
```

### Deploy Migrations (Production)

```bash
bun run db:migrate:deploy
```

### Push Schema (Development - skip migrations)

```bash
bun run db:push
```

### Seed Database

```bash
bun run db:seed
```

### Open Prisma Studio

```bash
bun run db:studio
```

### Reset Database (WARNING: Deletes all data)

```bash
bun run db:reset
```

## Environment Variables

Required in `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sensey_board?schema=public"
```

## Seed Data

The seed script creates:

- 4 test users (Admin, John, Sarah, Guest)
- 3 boards (Product Development, Design System, Bug Tracking)
- 3 sprints (2 for Product, 1 for Design)
- 15 tickets with realistic data
- 4 labels (bug, feature, urgent, documentation)
- 3 comments

All seed data is designed to showcase different features:

- Ticket hierarchy (parent/sub-tickets)
- Multiple ticket types and priorities
- Sprint progression (completed and active)
- Board membership with different roles

## Key Features

### Ticket Key Generation

- Automatic: `{board.prefix}-{counter}`
- Example: PROD-1, PROD-2, DS-1, BUG-1
- Counter increments atomically per board

### Ticket Ordering

- Float-based order field for flexible positioning
- Supports drag-drop reordering
- Utility functions in `src/server/db/utils.ts`

### Sprint Auto-Migration

- Unfinished tickets automatically move to new sprint
- Configurable via `autoMigrateTicketsToNewSprint()`
- Only moves tickets with status != DONE

### Board Hierarchy

- Boards can have parent boards (for nested organization)
- Utility: `getBoardHierarchy()` for path traversal
- Optional feature (Could Have in plan)

## Database Utilities

See `src/server/db/utils.ts` for helper functions:

- `generateTicketKey(boardId)` - Generate next ticket key
- `getNextTicketOrder(location)` - Get next order value
- `reorderTickets(ticketId, newOrder, location)` - Reorder after drag-drop
- `moveUnfinishedTicketsToBacklog(sprintId, backlogId)` - Sprint cleanup
- `autoMigrateTicketsToNewSprint(oldSprintId, newSprintId)` - Auto-migration
- `getBoardHierarchy(boardId)` - Get board path
- `getSubTicketsRecursive(parentId)` - Get all sub-tickets
- `userHasAccessToBoard(userId, boardId)` - Access check
- `userHasBoardRole(userId, boardId, minRole)` - Role check
- `getActiveSprint(boardId)` - Get current active sprint
- `calculateSprintProgress(sprintId)` - Progress statistics

## Best Practices

1. **Always use transactions for multi-step operations**

   ```typescript
   await prisma.$transaction([
     prisma.board.create(...),
     prisma.backlog.create(...),
   ]);
   ```

2. **Use select to minimize data transfer**

   ```typescript
   await prisma.user.findMany({
     select: { id: true, name: true, email: true },
   });
   ```

3. **Leverage indexes for common queries**
   - All foreign keys are indexed
   - Composite indexes for common filters
   - Use `@@index` for query optimization

4. **Handle cascading deletes carefully**
   - Board deletion cascades to members, tickets, sprints
   - Ticket deletion cascades to comments and sub-tickets
   - User deletion sets assignee to null (preserves tickets)

## Migration Strategy

### Development

1. Modify `schema.prisma`
2. Run `bun run db:migrate`
3. Name migration descriptively
4. Test with seed data

### Production

1. Review migration SQL
2. Backup database
3. Run `bun run db:migrate:deploy`
4. Verify with Prisma Studio

## Troubleshooting

### Client not generating

```bash
rm -rf node_modules/.prisma
bun run db:generate
```

### Migration conflicts

```bash
bun run db:reset  # Development only!
```

### Connection issues

- Check DATABASE_URL format
- Verify PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Sensey Board Plan](../sensey-board-plan.md) - Section 5
