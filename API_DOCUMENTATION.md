# Sensey Board - API Documentation

## Overview

This document describes the tRPC API implementation for Sensey Board. All API endpoints are type-safe and include comprehensive input validation using Zod.

**Status:** ✅ Complete - Ready for integration with database and auth (Agents 3 & 4)

## Tech Stack

- **tRPC v11** - Type-safe API layer
- **Zod** - Runtime validation
- **@tanstack/react-query v5** - Data fetching and caching
- **superjson** - Data serialization (supports Date, Map, Set, etc.)

## Project Structure

```
src/
├── server/api/
│   ├── trpc.ts                 # Base tRPC setup, context, procedures
│   ├── root.ts                 # Main router combining all sub-routers
│   └── routers/
│       ├── board.ts            # Board CRUD + member management
│       ├── sprint.ts           # Sprint CRUD + auto-migration (R6)
│       ├── ticket.ts           # Ticket CRUD + hierarchy (R8)
│       ├── backlog.ts          # Backlog operations
│       └── user.ts             # User operations
├── lib/
│   └── trpc.ts                 # Client-side tRPC hooks
└── app/
    ├── providers.tsx           # Root providers wrapper
    └── api/trpc/[trpc]/
        └── route.ts            # Next.js API route handler
```

## Authentication & Authorization

### Procedure Types

1. **publicProcedure** - No authentication required
2. **protectedProcedure** - Requires logged-in user
3. **adminProcedure** - Requires admin role

All routers currently use `protectedProcedure` by default.

### Authorization Checks

Each router verifies:

- User has access to the board (via `BoardMember`)
- User has appropriate role for the action (OWNER/ADMIN/MEMBER/VIEWER)

## API Routers

### 1. Board Router (`board`)

**Purpose:** Manage boards and board members

#### Procedures

| Procedure          | Input                   | Output                 | Description                             |
| ------------------ | ----------------------- | ---------------------- | --------------------------------------- |
| `getAll`           | -                       | `Board[]`              | Get all boards user has access to       |
| `getById`          | `{ id: string }`        | `Board`                | Get single board with details           |
| `create`           | `CreateBoardInput`      | `Board`                | Create new board (auto-creates backlog) |
| `update`           | `UpdateBoardInput`      | `Board`                | Update board details                    |
| `delete`           | `{ id: string }`        | `{ success: boolean }` | Delete board (OWNER only)               |
| `addMember`        | `AddMemberInput`        | `BoardMember`          | Add user to board                       |
| `removeMember`     | `{ boardId, userId }`   | `{ success: boolean }` | Remove user from board                  |
| `updateMemberRole` | `UpdateMemberRoleInput` | `BoardMember`          | Update member's role                    |

#### Key Features

- **Automatic backlog creation** - When a board is created, a backlog is automatically created
- **Prefix uniqueness** - Board prefixes must be unique (e.g., "SEN", "PROJ")
- **Owner protection** - Cannot remove last owner from board
- **Cascading delete** - Deleting board removes all associated data

#### Example Usage

```typescript
// Client component
import { trpc } from '@/lib/trpc';

function BoardList() {
  const { data: boards, isLoading } = trpc.board.getAll.useQuery();
  const createBoard = trpc.board.create.useMutation();

  const handleCreate = () => {
    createBoard.mutate({
      name: 'New Project',
      prefix: 'PROJ',
      description: 'Project description',
      color: '#FFB7C5',
    });
  };

  // ...
}
```

---

### 2. Sprint Router (`sprint`)

**Purpose:** Manage sprints with automatic ticket migration

#### Procedures

| Procedure    | Input                 | Output                 | Description                           |
| ------------ | --------------------- | ---------------------- | ------------------------------------- |
| `getAll`     | `{ boardId: string }` | `Sprint[]`             | Get all sprints for board             |
| `getCurrent` | `{ boardId: string }` | `Sprint \| null`       | Get active sprint                     |
| `getById`    | `{ id: string }`      | `Sprint`               | Get single sprint with tickets        |
| `create`     | `CreateSprintInput`   | `Sprint`               | Create new sprint with auto-migration |
| `update`     | `UpdateSprintInput`   | `Sprint`               | Update sprint details                 |
| `complete`   | `CompleteSprintInput` | `{ success: boolean }` | Mark sprint as completed              |
| `delete`     | `{ id: string }`      | `{ success: boolean }` | Delete PLANNED sprint only            |

#### Key Features

- **Auto-migration (R6)** - When creating a new sprint:
  1. Current active sprint is marked as COMPLETED
  2. All unfinished tickets (status !== DONE) are automatically moved to the new sprint
  3. New sprint becomes ACTIVE

- **Sprint numbering** - Automatic sequential numbering per board
- **Status management** - PLANNED → ACTIVE → COMPLETED lifecycle
- **Protection** - Cannot update/delete completed sprints

#### Auto-Migration Flow

```
Current Sprint (ACTIVE)
├── Ticket A (DONE)        → Stays in old sprint
├── Ticket B (IN_PROGRESS) → Moves to new sprint
└── Ticket C (TODO)        → Moves to new sprint

New Sprint Created
├── Ticket B (IN_PROGRESS) ← Auto-migrated
└── Ticket C (TODO)        ← Auto-migrated
```

#### Example Usage

```typescript
// Create sprint with auto-migration
const createSprint = trpc.sprint.create.useMutation();

createSprint.mutate({
  boardId: 'board-id',
  name: 'Sprint 5',
  goal: 'Complete user authentication',
  startDate: new Date('2024-01-15'),
  endDate: new Date('2024-01-29'),
});
// All unfinished tickets from previous sprint automatically move to this new sprint
```

---

### 3. Ticket Router (`ticket`)

**Purpose:** Manage tickets with parent/sub-ticket hierarchy

#### Procedures

| Procedure         | Input                   | Output                 | Description                        |
| ----------------- | ----------------------- | ---------------------- | ---------------------------------- |
| `getByBacklog`    | `{ backlogId: string }` | `Ticket[]`             | Get all tickets in backlog         |
| `getBySprint`     | `{ sprintId: string }`  | `Ticket[]`             | Get all tickets in sprint          |
| `getById`         | `{ id: string }`        | `Ticket`               | Get single ticket with details     |
| `create`          | `CreateTicketInput`     | `Ticket`               | Create new ticket                  |
| `update`          | `UpdateTicketInput`     | `Ticket`               | Update ticket                      |
| `move`            | `MoveTicketInput`       | `Ticket`               | Move ticket between sprint/backlog |
| `updateOrder`     | `{ ticketId, order }`   | `{ success: boolean }` | Update ticket order in column      |
| `delete`          | `{ id: string }`        | `{ success: boolean }` | Delete ticket                      |
| `createSubTicket` | `CreateSubTicketInput`  | `Ticket`               | Create sub-ticket for parent       |

#### Key Features

- **Hierarchy (R8)** - Parent tickets can have sub-tickets
- **Unique keys** - Auto-generated keys like "PROJ-123"
- **Ticket counter** - Board-level counter ensures unique ticket numbers
- **Inheritance** - Sub-tickets inherit sprint/backlog from parent
- **Protection** - Cannot delete parent ticket with sub-tickets

#### Ticket Types (R9)

- **ISSUE** - Regular issue/feature (Sakura Pink #FFB7C5)
- **FIX** - Bug fix (Green #4ADE80)
- **HOTFIX** - Urgent fix (Red #F87171)
- **PROBLEM** - Problem to investigate (Yellow #FBBF24)

#### Ticket Hierarchy Example

```
PROJ-1: Implement authentication (ISSUE)
├── PROJ-2: Create login form (ISSUE)
├── PROJ-3: Setup OAuth (ISSUE)
└── PROJ-4: Add session management (ISSUE)
```

#### Example Usage

```typescript
// Create parent ticket
const createTicket = trpc.ticket.create.useMutation();

const parent = await createTicket.mutateAsync({
  boardId: 'board-id',
  title: 'Implement authentication',
  type: 'ISSUE',
  priority: 'HIGH',
  backlogId: 'backlog-id',
});

// Create sub-ticket
const createSubTicket = trpc.ticket.createSubTicket.useMutation();

createSubTicket.mutate({
  parentId: parent.id,
  title: 'Create login form',
  type: 'ISSUE',
  priority: 'MEDIUM',
});
```

---

### 4. Backlog Router (`backlog`)

**Purpose:** Manage board backlogs

#### Procedures

| Procedure   | Input                     | Output                 | Description            |
| ----------- | ------------------------- | ---------------------- | ---------------------- |
| `get`       | `{ boardId: string }`     | `Backlog`              | Get backlog for board  |
| `addTicket` | `{ ticketId, backlogId }` | `{ success: boolean }` | Move ticket to backlog |

#### Key Features

- **One per board (R4)** - Each board has exactly ONE backlog
- **Auto-created** - Created automatically when board is created
- **Not deletable** - Backlog exists as long as board exists

---

### 5. User Router (`user`)

**Purpose:** Manage user operations and search

#### Procedures

| Procedure | Input               | Output   | Description                   |
| --------- | ------------------- | -------- | ----------------------------- |
| `getMe`   | -                   | `User`   | Get current user profile      |
| `getAll`  | -                   | `User[]` | Get all users (for selection) |
| `search`  | `{ query, limit? }` | `User[]` | Search users by name/email    |

#### Example Usage

```typescript
// Search users for assigning
const { data: users } = trpc.user.search.useQuery({
  query: 'john',
  limit: 10,
});

// Get current user
const { data: me } = trpc.user.getMe.useQuery();
```

---

## Client Usage

### Setup in Root Layout

```typescript
// src/app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Using in Components

```typescript
'use client';

import { trpc } from '@/lib/trpc';

function MyComponent() {
  // Query (GET)
  const { data, isLoading, error } = trpc.board.getAll.useQuery();

  // Mutation (POST/PUT/DELETE)
  const createBoard = trpc.board.create.useMutation({
    onSuccess: () => {
      // Refetch boards
      trpc.board.getAll.invalidate();
    },
  });

  const handleCreate = () => {
    createBoard.mutate({
      name: 'New Board',
      prefix: 'NEW',
    });
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data?.map(board => (
        <div key={board.id}>{board.name}</div>
      ))}
      <button onClick={handleCreate}>Create Board</button>
    </div>
  );
}
```

### Server-Side Usage

```typescript
// Server Component or Server Action
import { createCaller } from '@/lib/trpc';
import { createTRPCContext } from '@/server/api/trpc';

export async function MyServerComponent() {
  const ctx = await createTRPCContext({ req: null });
  const caller = createCaller(ctx);

  const boards = await caller.board.getAll();

  return (
    <div>
      {boards.map(board => (
        <div key={board.id}>{board.name}</div>
      ))}
    </div>
  );
}
```

---

## Integration Points

### Database (Agent 3)

Once Prisma is set up:

1. Uncomment all database calls in router files
2. Remove mock responses
3. Import `db` from `@/server/db`

**Files to update:**

- `/src/server/api/trpc.ts` - Uncomment `db` import
- All router files in `/src/server/api/routers/` - Uncomment Prisma queries

### Authentication (Agent 4)

Once NextAuth is set up:

1. Uncomment session retrieval in context
2. Update user ID access in routers

**Files to update:**

- `/src/server/api/trpc.ts` - Uncomment `auth()` and session
- All router files - Update `ctx.session.user.id` access

---

## Error Handling

All procedures use proper error handling:

```typescript
// NOT_FOUND - Resource doesn't exist
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Board not found',
});

// FORBIDDEN - User lacks permission
throw new TRPCError({
  code: 'FORBIDDEN',
  message: 'You do not have permission to update this board',
});

// BAD_REQUEST - Invalid request
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Cannot delete the last owner from the board',
});

// CONFLICT - Duplicate resource
throw new TRPCError({
  code: 'CONFLICT',
  message: 'A board with this prefix already exists',
});

// UNAUTHORIZED - Not logged in
throw new TRPCError({
  code: 'UNAUTHORIZED',
  message: 'You must be logged in to access this resource',
});
```

---

## Validation

All inputs are validated using Zod schemas. Examples:

```typescript
// Board prefix validation
prefix: z.string()
  .min(1)
  .max(5)
  .regex(/^[A-Z]+$/, 'Prefix must be uppercase');

// Date range validation
z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Enum validation
type: z.enum(['ISSUE', 'FIX', 'HOTFIX', 'PROBLEM']);
```

---

## Testing

### Manual Testing

```bash
# Start dev server
bun dev

# Test API endpoint
curl http://localhost:3000/api/trpc/board.getAll
```

### With React Query Devtools

Add to your app:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

---

## Performance Optimizations

1. **Batch requests** - tRPC batches multiple requests into one HTTP call
2. **Caching** - React Query caches responses with 60s stale time
3. **Optimistic updates** - Update UI before server response
4. **Selective fields** - Use Prisma `select` to fetch only needed fields
5. **Indexes** - Database indexes on foreign keys and frequently queried fields

---

## Next Steps

1. ✅ **DONE:** tRPC v11 installed and configured
2. ✅ **DONE:** All routers implemented with validation
3. ✅ **DONE:** React Query integration
4. ✅ **DONE:** Type-safe client hooks
5. ⏳ **PENDING:** Database integration (Agent 3)
6. ⏳ **PENDING:** Authentication integration (Agent 4)
7. ⏳ **FUTURE:** Component integration (Agents 6-10)

---

## Contact

For questions about the API implementation, refer to:

- **Agent:** Agent 5 (API Engineer)
- **Document:** sensey-board-plan.md (Section 9)
- **This file:** API_DOCUMENTATION.md
