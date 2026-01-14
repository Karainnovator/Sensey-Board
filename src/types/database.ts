/**
 * Database type definitions and extensions
 */

import type {
  User,
  Board,
  BoardMember,
  Backlog,
  Sprint,
  Ticket,
  Comment,
  Label,
  TicketAssignee,
  TicketReviewer,
} from '@prisma/client';

export type {
  User,
  Board,
  BoardMember,
  Backlog,
  Sprint,
  Ticket,
  Comment,
  Label,
  TicketAssignee,
  TicketReviewer,
};

// Extended types with relations
export type BoardWithRelations = Board & {
  members: (BoardMember & { user: User })[];
  backlog: Backlog | null;
  sprints: Sprint[];
  tickets: Ticket[];
};

// Partial user type for ticket relations (from tRPC queries)
export type TicketUser = {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
};

export type TicketAssigneeWithUser = TicketAssignee & {
  user: TicketUser;
};

export type TicketReviewerWithUser = TicketReviewer & {
  user: TicketUser;
};

export type TicketWithRelations = Ticket & {
  assignee: User | TicketUser | null;
  creator: User | TicketUser;
  assignees?: TicketAssigneeWithUser[];
  reviewers?: TicketReviewerWithUser[];
  labels: Label[];
  comments?: Comment[];
  subTickets?: Ticket[];
  _count?: {
    subTickets: number;
    comments: number;
  };
};

export type SprintWithTickets = Sprint & {
  tickets: TicketWithRelations[];
};
