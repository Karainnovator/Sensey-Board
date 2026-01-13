# Sensey Board - Complete Development Blueprint

> **Document Version:** 1.0
> **Stack:** Next.js 16 + Bun + shadcn/ui + Prisma + PostgreSQL + Keycloak
> **Design System:** Sakura Pink (#FFB7C5), Black, White

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Multi-Agent Architecture](#2-multi-agent-architecture)
3. [QA-Driven Development Process](#3-qa-driven-development-process)
4. [Technical Specifications](#4-technical-specifications)
5. [Database Schema](#5-database-schema)
6. [Agent Task Breakdown](#6-agent-task-breakdown)
7. [UI/UX Guidelines & Best Practices](#7-uiux-guidelines--best-practices)
8. [Component Specifications](#8-component-specifications)
9. [API Specifications](#9-api-specifications)
10. [QA Checklist & Acceptance Criteria](#10-qa-checklist--acceptance-criteria)

---

## 1. Project Overview

### 1.1 Product Description

Sensey Board is een moderne project management tool geïnspireerd door Notion's eenvoud en Jira's functionaliteit. Het biedt een clean, tile-based interface voor het beheren van boards met sprints en backlogs.

### 1.2 Core Requirements (Must Haves)

| ID  | Requirement                                                    | Size | Priority |
| --- | -------------------------------------------------------------- | ---- | -------- |
| R1  | Board tiles op full-width grid (geen sidebar)                  | S    | P0       |
| R2  | + button rechtsboven voor nieuwe boards                        | S    | P0       |
| R3  | Board bevat ALLEEN Sprint en Backlog tabs                      | L    | P0       |
| R4  | Eén backlog per board (niet aanmaakbaar)                       | S    | P0       |
| R5  | Sprint aanmaken met periode, dropdown voor historie            | XL   | P0       |
| R6  | Automatisch verplaatsen onafgeronde tickets naar nieuwe sprint | XXL  | P0       |
| R7  | Default velden: Priority, Assignee, Type (niet zoals Jira)     | S    | P0       |
| R8  | Ticket hiërarchie (parent/sub-tickets)                         | XXL  | P0       |
| R9  | Ticket types: Issue, Fix, Hotfix, Problem                      | S    | P0       |
| R10 | Kanban én List view ondersteuning                              | XL   | P0       |
| R11 | Keycloak authenticatie/autorisatie                             | L    | P0       |
| R12 | Guest users kunnen toevoegen                                   | M    | P0       |

### 1.3 Could Haves

| ID  | Requirement                              | Size |
| --- | ---------------------------------------- | ---- |
| C1  | Hierarchy Boards (board binnen board)    | XXL  |
| C2  | Claude AI integratie voor ticket creatie | XXL  |

---

## 2. Multi-Agent Architecture

### 2.1 Agent Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    QA LEAD AGENT (Main)                          │
│                                                                 │
│  Responsibilities:                                              │
│  • Coordineert alle 10 development agents                       │
│  • Voert code reviews uit na elke phase                         │
│  • Valideert tegen acceptance criteria                          │
│  • Bepaalt of agents opnieuw moeten draaien                     │
│  • Bewaakt consistency en best practices                        │
│  • Merged alle werk naar main branch                            │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │  PHASE 1    │    │  PHASE 2    │    │  PHASE 3    │
    │  Foundation │    │  Features   │    │  Polish     │
    └─────────────┘    └─────────────┘    └─────────────┘
```

### 2.2 The 10 Development Agents

```
┌─────────────────────────────────────────────────────────────────┐
│                      DEVELOPMENT AGENTS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AGENT 1: Project Architect                                     │
│     → Project setup, folder structure, configs                  │
│     → Dependencies, TypeScript, ESLint, Prettier                │
│                                                                 │
│  AGENT 2: Design System Engineer                                │
│     → Tailwind config, shadcn setup, theme                      │
│     → Color tokens, typography, spacing system                  │
│                                                                 │
│  AGENT 3: Database Engineer                                     │
│     → Prisma schema, migrations, seed data                      │
│     → Database utilities, connection handling                   │
│                                                                 │
│  AGENT 4: Auth Engineer                                         │
│     → Keycloak integration, NextAuth setup                      │
│     → Protected routes, role-based access                       │
│                                                                 │
│  AGENT 5: API Engineer                                          │
│     → tRPC routers, procedures, middleware                      │
│     → Input validation, error handling                          │
│                                                                 │
│  AGENT 6: Core UI Engineer                                      │
│     → Layout, navigation, board grid                            │
│     → Board cards, create dialogs                               │
│                                                                 │
│  AGENT 7: Board Feature Engineer                                │
│     → Board detail page, tabs navigation                        │
│     → Backlog page, sprint page structure                       │
│                                                                 │
│  AGENT 8: Ticket System Engineer                                │
│     → Ticket components, CRUD operations                        │
│     → Sub-tickets, hierarchy rendering                          │
│                                                                 │
│  AGENT 9: Sprint Feature Engineer                               │
│     → Sprint management, auto-migration                         │
│     → Kanban board, list view, drag-drop                        │
│                                                                 │
│  AGENT 10: Polish & Integration Engineer                        │
│     → Animations, loading states, error boundaries              │
│     → E2E testing, performance optimization                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. QA-Driven Development Process

### 3.1 Iterative Development Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTINUOUS QA PROCESS                        │
└─────────────────────────────────────────────────────────────────┘

     START
       │
       ▼
┌─────────────────┐
│  PHASE 1 START  │
│  Agents 1-5     │
│  (Foundation)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Agents werken  │────▶│  QA LEAD Review │
│  parallel       │     │  (Local PR)     │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
             ┌───────────┐             ┌───────────┐
             │  PASSED   │             │  FAILED   │
             └─────┬─────┘             └─────┬─────┘
                   │                         │
                   │                         ▼
                   │                 ┌───────────────┐
                   │                 │ Feedback naar │
                   │                 │ agents, opnieuw│
                   │                 │ starten       │
                   │                 └───────┬───────┘
                   │                         │
                   │◀────────────────────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  PHASE 2 START  │
         │  Agents 6-8     │
         │  (Features)     │
         └────────┬────────┘
                  │
                  ▼
         [Repeat QA Cycle]
                  │
                  ▼
         ┌─────────────────┐
         │  PHASE 3 START  │
         │  Agents 9-10    │
         │  (Polish)       │
         └────────┬────────┘
                  │
                  ▼
         [Final QA Cycle]
                  │
                  ▼
         ┌─────────────────┐
         │    COMPLETE     │
         │   Production    │
         │     Ready       │
         └─────────────────┘
```

### 3.2 QA Lead Review Checklist (Per Phase)

```markdown
## QA Review Template

### Code Quality

- [ ] TypeScript strict mode - geen `any` types
- [ ] Alle functies hebben proper typing
- [ ] Geen unused imports/variables
- [ ] Consistent naming conventions (camelCase, PascalCase)
- [ ] Error boundaries aanwezig
- [ ] Proper error handling in async operations

### Best Practices

- [ ] Components zijn klein en focused (<200 lines)
- [ ] Custom hooks voor herbruikbare logica
- [ ] Server/Client components correct gescheiden
- [ ] Geen prop drilling (gebruik Zustand/Context)
- [ ] Images geoptimaliseerd met next/image
- [ ] Proper loading en error states

### UI/UX Compliance

- [ ] Design system tokens gebruikt (geen hardcoded colors)
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Consistent spacing (4px grid)
- [ ] Animations smooth (60fps)
- [ ] Focus states zichtbaar

### Security

- [ ] Input validation op alle forms
- [ ] SQL injection preventie (Prisma parameterized)
- [ ] XSS preventie
- [ ] CSRF protection
- [ ] Proper auth guards op routes

### Performance

- [ ] Geen unnecessary re-renders
- [ ] Lazy loading waar nodig
- [ ] Proper caching strategie
- [ ] Bundle size acceptabel
```

---

## 4. Technical Specifications

### 4.1 Tech Stack

```yaml
Runtime:
  - Bun 1.1+

Frontend:
  - Next.js 16 (App Router)
  - React 19
  - TypeScript 5.5+
  - Tailwind CSS 4.0
  - shadcn/ui (latest)
  - Zustand (state management)
  - TanStack Query v5 (server state)
  - @dnd-kit (drag and drop)
  - Framer Motion (animations)

Backend:
  - Next.js API Routes / Server Actions
  - tRPC v11
  - Prisma ORM 6
  - PostgreSQL 16

Auth:
  - NextAuth.js v5
  - Keycloak 24+

Testing:
  - Vitest
  - Playwright
  - Testing Library

Tooling:
  - ESLint 9 (flat config)
  - Prettier 3
  - Husky (git hooks)
  - lint-staged
```

### 4.2 Project Structure

```
sensey-board/
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   └── icons/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx                    # Board grid
│   │   │   ├── layout.tsx
│   │   │   └── board/
│   │   │       └── [boardId]/
│   │   │           ├── page.tsx            # Redirects to backlog
│   │   │           ├── layout.tsx          # Tabs: Backlog | Sprint
│   │   │           ├── backlog/
│   │   │           │   └── page.tsx
│   │   │           └── sprint/
│   │   │               └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   └── trpc/
│   │   │       └── [trpc]/
│   │   │           └── route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                             # shadcn components
│   │   ├── board/
│   │   │   ├── board-grid.tsx
│   │   │   ├── board-card.tsx
│   │   │   ├── create-board-dialog.tsx
│   │   │   └── board-settings-dialog.tsx
│   │   ├── ticket/
│   │   │   ├── ticket-card.tsx
│   │   │   ├── ticket-row.tsx
│   │   │   ├── ticket-dialog.tsx
│   │   │   ├── ticket-type-badge.tsx
│   │   │   ├── ticket-priority-icon.tsx
│   │   │   ├── sub-ticket-list.tsx
│   │   │   └── ticket-actions-menu.tsx
│   │   ├── sprint/
│   │   │   ├── sprint-board.tsx
│   │   │   ├── sprint-list.tsx
│   │   │   ├── sprint-selector.tsx
│   │   │   ├── create-sprint-dialog.tsx
│   │   │   └── sprint-header.tsx
│   │   ├── backlog/
│   │   │   ├── backlog-board.tsx
│   │   │   ├── backlog-list.tsx
│   │   │   └── add-to-sprint-action.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── board-tabs.tsx
│   │   │   ├── view-toggle.tsx
│   │   │   └── user-menu.tsx
│   │   └── shared/
│   │       ├── empty-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── error-boundary.tsx
│   │       └── confirm-dialog.tsx
│   ├── server/
│   │   ├── api/
│   │   │   ├── root.ts
│   │   │   ├── trpc.ts
│   │   │   └── routers/
│   │   │       ├── board.ts
│   │   │       ├── ticket.ts
│   │   │       ├── sprint.ts
│   │   │       ├── backlog.ts
│   │   │       └── user.ts
│   │   ├── db/
│   │   │   └── index.ts
│   │   └── auth/
│   │       └── config.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   ├── validators.ts
│   │   └── trpc.ts
│   ├── hooks/
│   │   ├── use-boards.ts
│   │   ├── use-board.ts
│   │   ├── use-tickets.ts
│   │   ├── use-sprint.ts
│   │   ├── use-backlog.ts
│   │   └── use-view-mode.ts
│   ├── stores/
│   │   ├── ui-store.ts
│   │   └── board-store.ts
│   └── types/
│       └── index.ts
├── tests/
│   ├── e2e/
│   └── unit/
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── bunfig.toml
├── components.json
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 5. Database Schema

### 5.1 Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// USERS & AUTHENTICATION

model User {
  id            String    @id @default(cuid())
  keycloakId    String    @unique
  email         String    @unique
  name          String?
  avatar        String?
  role          GlobalRole @default(MEMBER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  boardMemberships BoardMember[]
  assignedTickets  Ticket[]       @relation("TicketAssignee")
  createdTickets   Ticket[]       @relation("TicketCreator")
  comments         Comment[]

  @@index([email])
  @@index([keycloakId])
}

enum GlobalRole {
  ADMIN
  MEMBER
  GUEST
}

// BOARDS

model Board {
  id            String    @id @default(cuid())
  name          String
  description   String?
  prefix        String    @db.VarChar(5)
  color         String    @default("#FFB7C5")
  icon          String?

  parentBoardId String?
  parentBoard   Board?    @relation("BoardHierarchy", fields: [parentBoardId], references: [id], onDelete: SetNull)
  childBoards   Board[]   @relation("BoardHierarchy")

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  members       BoardMember[]
  backlog       Backlog?
  sprints       Sprint[]
  tickets       Ticket[]
  ticketCounter Int       @default(0)

  @@index([name])
}

model BoardMember {
  id        String      @id @default(cuid())
  boardId   String
  userId    String
  role      BoardRole   @default(MEMBER)
  createdAt DateTime    @default(now())

  board     Board       @relation(fields: [boardId], references: [id], onDelete: Cascade)
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([boardId, userId])
  @@index([userId])
}

enum BoardRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

// BACKLOG

model Backlog {
  id        String    @id @default(cuid())
  boardId   String    @unique
  createdAt DateTime  @default(now())

  board     Board     @relation(fields: [boardId], references: [id], onDelete: Cascade)
  tickets   Ticket[]
}

// SPRINTS

model Sprint {
  id          String       @id @default(cuid())
  boardId     String
  number      Int
  name        String
  goal        String?
  startDate   DateTime
  endDate     DateTime
  status      SprintStatus @default(PLANNED)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  board       Board        @relation(fields: [boardId], references: [id], onDelete: Cascade)
  tickets     Ticket[]

  @@unique([boardId, number])
  @@index([boardId, status])
}

enum SprintStatus {
  PLANNED
  ACTIVE
  COMPLETED
}

// TICKETS

model Ticket {
  id            String       @id @default(cuid())
  boardId       String
  backlogId     String?
  sprintId      String?
  parentId      String?

  key           String
  title         String
  description   String?      @db.Text
  type          TicketType   @default(ISSUE)
  status        TicketStatus @default(TODO)
  priority      Priority     @default(MEDIUM)
  storyPoints   Int?

  assigneeId    String?
  creatorId     String
  order         Float        @default(0)

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  board         Board        @relation(fields: [boardId], references: [id], onDelete: Cascade)
  backlog       Backlog?     @relation(fields: [backlogId], references: [id], onDelete: SetNull)
  sprint        Sprint?      @relation(fields: [sprintId], references: [id], onDelete: SetNull)
  parent        Ticket?      @relation("TicketHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  subTickets    Ticket[]     @relation("TicketHierarchy")
  assignee      User?        @relation("TicketAssignee", fields: [assigneeId], references: [id], onDelete: SetNull)
  creator       User         @relation("TicketCreator", fields: [creatorId], references: [id])
  comments      Comment[]
  labels        Label[]

  @@unique([boardId, key])
  @@index([boardId, status])
  @@index([backlogId])
  @@index([sprintId])
  @@index([parentId])
  @@index([assigneeId])
}

enum TicketType {
  ISSUE
  FIX
  HOTFIX
  PROBLEM
}

enum TicketStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum Priority {
  LOWEST
  LOW
  MEDIUM
  HIGH
  HIGHEST
}

// SUPPORTING MODELS

model Comment {
  id        String   @id @default(cuid())
  ticketId  String
  userId    String
  content   String   @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([ticketId])
}

model Label {
  id        String   @id @default(cuid())
  name      String
  color     String
  tickets   Ticket[]

  @@unique([name])
}
```

---

## 6. Agent Task Breakdown

### 6.1 PHASE 1: Foundation (Agents 1-5)

#### AGENT 1: Project Architect

**Tasks:**

1. Initialize Next.js 16 project with Bun
2. Configure TypeScript (strict mode)
3. Setup ESLint 9 with flat config
4. Configure Prettier
5. Setup Husky + lint-staged
6. Create folder structure
7. Setup bunfig.toml
8. Create .env.example

**Deliverables:**

- [ ] Working Next.js 16 project
- [ ] TypeScript strict mode enabled
- [ ] ESLint + Prettier configured
- [ ] Git hooks working
- [ ] Folder structure complete
- [ ] README.md with setup instructions

#### AGENT 2: Design System Engineer

**Tasks:**

1. Initialize shadcn/ui
2. Install required shadcn components
3. Configure Tailwind with design tokens
4. Create globals.css
5. Create typography scale component
6. Document all design tokens

**Deliverables:**

- [ ] shadcn/ui fully configured
- [ ] All required components installed
- [ ] Tailwind config with design tokens
- [ ] globals.css complete
- [ ] Style guide/documentation component

#### AGENT 3: Database Engineer

**Tasks:**

1. Initialize Prisma
2. Create complete schema
3. Create initial migration
4. Create Prisma client singleton
5. Create seed script
6. Create database utility functions

**Deliverables:**

- [ ] Prisma schema complete and valid
- [ ] Migrations working
- [ ] Seed script functioning
- [ ] DB client singleton
- [ ] Utility functions tested

#### AGENT 4: Auth Engineer

**Tasks:**

1. Install NextAuth v5
2. Create auth config
3. Create route handlers
4. Create auth middleware
5. Create auth hooks
6. Create login page
7. Create UserMenu component

**Deliverables:**

- [ ] NextAuth configured with Keycloak
- [ ] Protected routes working
- [ ] Login page complete
- [ ] User session accessible in components
- [ ] Sign out functionality

#### AGENT 5: API Engineer

**Tasks:**

1. Install tRPC v11
2. Create tRPC context and base setup
3. Create all routers (board, sprint, ticket, user)
4. Create root router and HTTP handler
5. Create React Query client provider
6. Create tRPC hooks

**Deliverables:**

- [ ] tRPC server fully configured
- [ ] All routers implemented with validation
- [ ] React Query integration working
- [ ] Type-safe client hooks
- [ ] Error handling consistent

### 6.2 PHASE 2: Features (Agents 6-8)

#### AGENT 6: Core UI Engineer

**Tasks:**

1. Create root layout
2. Create dashboard layout
3. Create Header component
4. Create BoardGrid component
5. Create BoardCard component
6. Create CreateBoardDialog
7. Create EmptyState component
8. Implement loading skeletons

**Deliverables:**

- [ ] Complete dashboard layout
- [ ] Beautiful board grid
- [ ] BoardCard with all states
- [ ] Create board flow working end-to-end
- [ ] Empty state for new users
- [ ] Smooth animations

#### AGENT 7: Board Feature Engineer

**Tasks:**

1. Create board layout
2. Create BoardTabs component
3. Create board header
4. Create ViewToggle component
5. Create BoardSettingsDialog
6. Create backlog page structure
7. Create sprint page structure

**Deliverables:**

- [ ] Board detail layout complete
- [ ] Tab navigation working
- [ ] View toggle functional
- [ ] Settings dialog complete
- [ ] Backlog page structure
- [ ] Sprint page structure

#### AGENT 8: Ticket System Engineer

**Tasks:**

1. Create TicketCard component
2. Create TicketRow component
3. Create TicketTypeBadge component
4. Create TicketPriorityIcon component
5. Create TicketDialog component
6. Create SubTicketList component
7. Create TicketActionsMenu
8. Implement drag-drop for tickets

**Deliverables:**

- [ ] TicketCard component
- [ ] TicketRow component with hierarchy
- [ ] Type badges and priority icons
- [ ] Create/Edit ticket dialog
- [ ] Sub-ticket support
- [ ] Drag-drop reordering

### 6.3 PHASE 3: Polish (Agents 9-10)

#### AGENT 9: Sprint Feature Engineer

**Tasks:**

1. Create SprintSelector component
2. Create SprintHeader component
3. Create CreateSprintDialog
4. Create SprintKanban component
5. Create SprintList component
6. Create BacklogKanban component
7. Create BacklogList component
8. Implement auto-migration logic
9. Create CompleteSprint flow

**Deliverables:**

- [ ] Sprint selector working
- [ ] Sprint header informative
- [ ] Create sprint with auto-migration
- [ ] Kanban view for both sprint and backlog
- [ ] List view for both
- [ ] Sprint completion flow

#### AGENT 10: Polish & Integration Engineer

**Tasks:**

1. Implement loading states
2. Implement error handling
3. Add animations with Framer Motion
4. Keyboard navigation
5. Accessibility audit
6. Performance optimization
7. Create E2E tests with Playwright
8. Create unit tests
9. Final UI polish
10. Documentation

**Deliverables:**

- [ ] All loading states implemented
- [ ] Error handling robust
- [ ] Smooth animations throughout
- [ ] Keyboard navigation working
- [ ] Accessibility compliant
- [ ] Performance optimized
- [ ] E2E tests passing
- [ ] Documentation complete

---

## 7. UI/UX Guidelines & Best Practices

### 7.1 Design Principles

1. SIMPLICITY FIRST - Remove what isn't essential
2. CLARITY OVER CLEVERNESS - Clear labels and copy
3. SPEED IS A FEATURE - Instant feedback on actions
4. CONSISTENCY IS TRUST - Same patterns everywhere
5. DELIGHT IN DETAILS - Subtle animations

### 7.2 Color System

**Primary - Sakura Pink:**

- #FFB7C5 - Primary
- #FFEEF2 - Light
- #FFD4E0 - Medium

**Neutral:**

- #FFFFFF - Background
- #F5F5F5 - Card background
- #E5E5E5 - Borders
- #737373 - Secondary text
- #171717 - Primary text

**Semantic:**

- #22C55E - Success
- #EF4444 - Error
- #F59E0B - Warning
- #3B82F6 - Info

**Ticket Types:**

- ISSUE: #FFB7C5 (Sakura)
- FIX: #4ADE80 (Green)
- HOTFIX: #F87171 (Red)
- PROBLEM: #FBBF24 (Yellow)

### 7.3 Spacing System (4px base)

- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px
- 3xl: 48px

### 7.4 Animation Guidelines

- Micro-interactions: 150ms
- Standard transitions: 200ms
- Complex animations: 300ms
- Page transitions: 400ms
- Easing: ease-out (entering), ease-in (exiting)

---

## 8. Component Specifications

### 8.1 BoardCard

- Min height: 180px
- Gradient: board.color to white
- Border radius: 16px
- Hover: scale(1.02), shadow increase

### 8.2 TicketCard

- Padding: 12px 16px
- Border: 1px solid gray-200
- Border radius: 8px
- Background: white

### 8.3 TicketRow

- Parent height: 48px
- Sub-ticket height: 40px
- Indent: 24px per level

### 8.4 Kanban Columns

- Column gap: 16px
- Min-width: 280px
- Max-width: 320px

---

## 9. API Specifications

### 9.1 Board Router

- getAll, getById, create, update, delete
- addMember, removeMember, updateMemberRole

### 9.2 Sprint Router

- getAll, getCurrent, getById
- create (with auto-move!), update, complete, delete

### 9.3 Ticket Router

- getByBacklog, getBySprint, getById
- create, update, move, updateOrder, delete
- createSubTicket

---

## 10. QA Checklist & Acceptance Criteria

### Phase 1 Complete When:

- bun install && bun run dev works
- Login flow works
- Database seeded
- API endpoints accessible
- No TypeScript errors

### Phase 2 Complete When:

- Dashboard shows board grid
- Can create board
- Board detail with tabs works
- Can create tickets
- Drag-drop works

### Phase 3 Complete When:

- Sprint creation with auto-migrate works
- All animations smooth
- E2E tests pass
- Lighthouse > 90
