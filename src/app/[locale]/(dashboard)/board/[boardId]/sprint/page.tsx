'use client';

import { use, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ViewToggle, type ViewMode } from '@/components/layout/view-toggle';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, FolderTree } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { SprintList } from '@/components/sprint/sprint-list';
import { SprintKanban } from '@/components/sprint/sprint-kanban';
import { CreateSprintDialog } from '@/components/sprint/create-sprint-dialog';
import {
  TicketDialog,
  type TicketFormData,
} from '@/components/ticket/ticket-dialog';
import { useTicketFilters } from '@/lib/hooks/use-ticket-filters';
import { TicketFilterPanel } from '@/components/filters/ticket-filter-panel';
import type { TicketStatus, Ticket } from '@prisma/client';
import type { TicketWithRelations } from '@/types/database';

export const dynamic = 'force-dynamic';

interface SprintPageProps {
  params: Promise<{ boardId: string }>;
}

export default function SprintPage({ params }: SprintPageProps) {
  const resolvedParams = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketWithRelations | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [createWithParentId, setCreateWithParentId] = useState<string | null>(
    null
  ); // For creating sub-tickets
  const [includeChildBoards, setIncludeChildBoards] = useState(false);

  const utils = trpc.useUtils();

  // Initialize filters with current user as default assignee filter (My Tickets)
  const { filters, setFilters, applyFilters, clearFilters, activeFilterCount } =
    useTicketFilters({
      assigneeId: user?.id ?? null,
    });

  // Fetch all sprints for the board
  const { data: sprints = [], isLoading: sprintsLoading } =
    trpc.sprint.getAll.useQuery({
      boardId: resolvedParams.boardId,
    });

  // Fetch current active sprint
  const { data: activeSprint, isLoading: activeSprintLoading } =
    trpc.sprint.getCurrent.useQuery({
      boardId: resolvedParams.boardId,
    });

  // Fetch board with members for assignee dropdown
  const { data: board } = trpc.board.getById.useQuery({
    id: resolvedParams.boardId,
  });
  const boardMembers = useMemo(
    () => board?.members?.map((m) => m.user) ?? [],
    [board?.members]
  );

  // Fetch child boards for the sub-boards toggle
  const { data: childBoards = [] } = trpc.board.getChildren.useQuery({
    boardId: resolvedParams.boardId,
  });
  const hasChildBoards = childBoards.length > 0;

  // Determine which sprint to display
  const currentSprint = selectedSprintId
    ? (sprints.find((s) => s.id === selectedSprintId) ?? null)
    : (activeSprint ?? null);

  // Fetch tickets for selected sprint
  const { data: sprintData, isLoading: sprintDataLoading } =
    trpc.sprint.getById.useQuery(
      { id: currentSprint?.id ?? '' },
      { enabled: !!currentSprint?.id && !includeChildBoards }
    );

  // Fetch tickets with child boards when toggle is enabled
  const { data: hierarchyTickets = [], isLoading: hierarchyLoading } =
    trpc.ticket.getWithHierarchy.useQuery(
      {
        boardId: resolvedParams.boardId,
        includeChildBoards: true,
        sprintId: currentSprint?.id,
      },
      { enabled: !!currentSprint?.id && includeChildBoards }
    );

  const tickets = useMemo(
    () =>
      (includeChildBoards
        ? hierarchyTickets
        : (sprintData?.tickets ?? [])) as TicketWithRelations[],
    [includeChildBoards, hierarchyTickets, sprintData?.tickets]
  );
  const filteredTickets = useMemo(
    () => applyFilters(tickets as TicketWithRelations[]),
    [tickets, applyFilters]
  );

  // Create sprint mutation
  const createSprint = trpc.sprint.create.useMutation({
    onSuccess: () => {
      utils.sprint.getAll.invalidate();
      utils.sprint.getCurrent.invalidate();
      setShowCreateDialog(false);
    },
  });

  // Update ticket status mutation
  const updateTicketStatus = trpc.ticket.update.useMutation({
    onSuccess: () => {
      utils.sprint.getById.invalidate();
    },
  });

  // Create ticket mutation
  const createTicket = trpc.ticket.create.useMutation({
    onSuccess: () => {
      utils.sprint.getById.invalidate();
    },
  });

  // Create sub-ticket mutation (for quick add)
  const createSubTicket = trpc.ticket.createSubTicket.useMutation({
    onSuccess: () => {
      utils.sprint.getById.invalidate();
    },
  });

  const handleCreateSprint = async (data: {
    name: string;
    goal?: string;
    startDate: Date;
    endDate: Date;
    autoMigrate: boolean;
  }) => {
    await createSprint.mutateAsync({
      boardId: resolvedParams.boardId,
      name: data.name,
      goal: data.goal,
      startDate: data.startDate,
      endDate: data.endDate,
      autoStart: true,
    });
  };

  const handleStatusChange = async (
    ticketId: string,
    newStatus: TicketStatus
  ) => {
    await updateTicketStatus.mutateAsync({
      id: ticketId,
      status: newStatus,
    });
  };

  // Handle sub-ticket completion toggle
  const handleSubTicketToggle = async (
    subTicketId: string,
    completed: boolean
  ) => {
    await updateTicketStatus.mutateAsync({
      id: subTicketId,
      status: completed ? 'DONE' : 'TODO',
    });
  };

  // Handle quick add sub-ticket from kanban card
  const handleQuickAddSubTicket = async (parentId: string, title: string) => {
    await createSubTicket.mutateAsync({
      parentId,
      title,
    });
  };

  const handleCreateNewTicket = async (data: TicketFormData) => {
    if (!currentSprint?.id) return;

    await createTicket.mutateAsync({
      boardId: resolvedParams.boardId,
      sprintId: currentSprint.id,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      storyPoints: data.storyPoints,
      parentId: data.parentId ?? createWithParentId ?? undefined,
    });
    setCreateWithParentId(null); // Reset after creation
  };

  const handleTicketClick = (ticket: TicketWithRelations) => {
    setSelectedTicket(ticket);
    setShowDetailDialog(true);
  };

  const handleCreateTicket = () => {
    setCreateWithParentId(null);
    setShowTicketDialog(true);
  };

  // Handle request to create sub-ticket via full dialog
  const handleRequestCreateSubTicket = (parentId: string) => {
    setCreateWithParentId(parentId);
    setShowDetailDialog(false);
    setShowTicketDialog(true);
  };

  // Handle opening a sub-ticket for editing
  const handleOpenSubTicket = (ticket: Ticket) => {
    setShowDetailDialog(false);
    setTimeout(() => {
      // Cast to TicketWithRelations - the dialog will fetch full data if needed
      setSelectedTicket(ticket as unknown as TicketWithRelations);
      setShowDetailDialog(true);
    }, 100);
  };

  const nextSprintNumber =
    sprints.length > 0 ? Math.max(...sprints.map((s) => s.number)) + 1 : 1;

  const isLoading =
    sprintsLoading ||
    activeSprintLoading ||
    sprintDataLoading ||
    hierarchyLoading;

  // Format date helper
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  // Calculate days remaining
  const daysRemaining = currentSprint?.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(currentSprint.endDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  // No sprints exist yet
  if (!isLoading && sprints.length === 0) {
    return (
      <div className="flex h-full flex-col bg-neutral-50">
        <NoSprintState onCreateSprint={() => setShowCreateDialog(true)} />
        <CreateSprintDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          nextSprintNumber={nextSprintNumber}
          hasActiveSprint={false}
          incompleteTicketsCount={0}
          onCreateSprint={handleCreateSprint}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-neutral-50">
      {/* Compact toolbar with sprint selector, info, and controls */}
      <div className="border-b border-neutral-200 bg-white px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left side: Sprint selector + info */}
          <div className="flex items-center gap-4">
            {/* Sprint dropdown selector */}
            <select
              value={currentSprint?.id ?? ''}
              onChange={(e) => setSelectedSprintId(e.target.value || null)}
              className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium focus:border-sakura-400 focus:outline-none focus:ring-1 focus:ring-sakura-400"
            >
              {sprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>

            {/* Sprint dates and status */}
            {currentSprint && (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(currentSprint.startDate)} -{' '}
                  {formatDate(currentSprint.endDate)}
                </span>
                {currentSprint.status === 'ACTIVE' && daysRemaining > 0 && (
                  <span className="rounded bg-sakura-100 px-2 py-0.5 text-xs font-medium text-sakura-600">
                    {daysRemaining}d left
                  </span>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              New Sprint
            </Button>
          </div>

          {/* Right side: View toggle, filters, add ticket */}
          <div className="flex items-center gap-2">
            {/* Sub-boards toggle */}
            {hasChildBoards && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 rounded-md border border-neutral-200 px-2 py-1">
                      <FolderTree className="h-4 w-4 text-neutral-500" />
                      <Switch
                        checked={includeChildBoards}
                        onCheckedChange={setIncludeChildBoards}
                        className="h-4 w-8"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('board.includeSubBoards')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
            <TicketFilterPanel
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
              activeCount={activeFilterCount}
              boardId={resolvedParams.boardId}
              childBoards={childBoards}
              showBoardFilter={includeChildBoards}
            />
            <Button size="sm" className="gap-1" onClick={handleCreateTicket}>
              <Plus className="h-4 w-4" />
              {t('sprint.addTicket')}
            </Button>
          </div>
        </div>
      </div>

      {/* Sprint Content */}
      <div className="flex-1 overflow-auto">
        {!currentSprint ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <p className="text-sm text-neutral-500">
              {t('sprint.noActiveSprint')}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {t('sprint.noActiveSprintDescription')}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <SprintList
            tickets={filteredTickets as TicketWithRelations[]}
            onTicketClick={handleTicketClick}
            onCreateTicket={handleCreateTicket}
            isLoading={sprintDataLoading}
          />
        ) : (
          <SprintKanban
            tickets={filteredTickets as TicketWithRelations[]}
            onStatusChange={handleStatusChange}
            onTicketClick={handleTicketClick}
            onCreateTicket={handleCreateTicket}
            onSubTicketToggle={handleSubTicketToggle}
            onQuickAddSubTicket={handleQuickAddSubTicket}
            isLoading={sprintDataLoading}
          />
        )}
      </div>

      {/* Create Sprint Dialog */}
      <CreateSprintDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        nextSprintNumber={nextSprintNumber}
        hasActiveSprint={!!activeSprint}
        incompleteTicketsCount={0}
        onCreateSprint={handleCreateSprint}
      />

      {/* Ticket Dialog for Creating */}
      <TicketDialog
        open={showTicketDialog}
        onOpenChange={(open) => {
          setShowTicketDialog(open);
          if (!open) setCreateWithParentId(null);
        }}
        mode="create"
        boardId={resolvedParams.boardId}
        sprintId={currentSprint?.id}
        onSave={handleCreateNewTicket}
        availableUsers={boardMembers}
        availableParentTickets={tickets.filter((t) => !t.parentId)}
        ticket={
          createWithParentId
            ? ({
                parentId: createWithParentId,
              } as unknown as TicketWithRelations)
            : undefined
        }
      />

      {/* Ticket Dialog for Viewing/Editing */}
      {selectedTicket && (
        <TicketDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          ticket={selectedTicket}
          mode="edit"
          boardId={resolvedParams.boardId}
          availableUsers={boardMembers}
          availableParentTickets={tickets.filter(
            (t) => !t.parentId && t.id !== selectedTicket.id
          )}
          onRequestCreateSubTicket={handleRequestCreateSubTicket}
          onOpenSubTicket={handleOpenSubTicket}
          onSave={async (data) => {
            await updateTicketStatus.mutateAsync({
              id: selectedTicket.id,
              title: data.title,
              description: data.description,
              type: data.type,
              priority: data.priority,
              status: data.status,
              assigneeId: data.assigneeId,
              storyPoints: data.storyPoints,
              parentId: data.parentId,
            });
            setShowDetailDialog(false);
          }}
        />
      )}
    </div>
  );
}

function NoSprintState({ onCreateSprint }: { onCreateSprint: () => void }) {
  const t = useTranslations('sprint');

  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sakura-50">
        <Calendar className="h-10 w-10 text-sakura-500" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-900">
        {t('noActiveSprint')}
      </h2>
      <p className="mt-2 max-w-md text-sm text-neutral-500">
        {t('noActiveSprintDescription')}
      </p>
      <Button className="mt-6 gap-2" onClick={onCreateSprint}>
        <Plus className="h-4 w-4" />
        <span>{t('createFirst')}</span>
      </Button>
    </div>
  );
}
