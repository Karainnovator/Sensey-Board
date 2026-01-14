'use client';

import { use, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Ticket } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, FolderTree } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { AITicketCreator } from '@/components/ai/ai-ticket-creator';
import {
  TicketDialog,
  type TicketFormData,
} from '@/components/ticket/ticket-dialog';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import { BacklogList } from '@/components/backlog/backlog-list';
import { useTicketFilters } from '@/lib/hooks/use-ticket-filters';
import { TicketFilterPanel } from '@/components/filters/ticket-filter-panel';
import type { TicketWithRelations } from '@/types/database';

export const dynamic = 'force-dynamic';

interface BacklogPageProps {
  params: Promise<{ boardId: string }>;
}

export default function BacklogPage({ params }: BacklogPageProps) {
  const resolvedParams = use(params);
  const t = useTranslations();
  const { user } = useAuth();
  const [showAICreator, setShowAICreator] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] =
    useState<TicketWithRelations | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [includeChildBoards, setIncludeChildBoards] = useState(false);
  const [createSubTicketParentId, setCreateSubTicketParentId] = useState<
    string | null
  >(null);

  const utils = trpc.useUtils();

  // Initialize filters with current user as default assignee filter (My Tickets)
  const { filters, setFilters, applyFilters, clearFilters, activeFilterCount } =
    useTicketFilters({
      assigneeId: user?.id ?? null,
    });

  // Get backlog for this board (always fetch to get backlog ID)
  const { data: backlog, isLoading: backlogLoading } =
    trpc.backlog.get.useQuery({
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

  // Fetch available sprints for this board
  const { data: sprints = [] } = trpc.sprint.getAll.useQuery({
    boardId: resolvedParams.boardId,
  });

  // Fetch tickets with child boards when toggle is enabled
  const { data: hierarchyTickets = [], isLoading: hierarchyLoading } =
    trpc.ticket.getWithHierarchy.useQuery(
      {
        boardId: resolvedParams.boardId,
        includeChildBoards: true,
        backlogId: backlog?.id,
      },
      { enabled: includeChildBoards && !!backlog?.id }
    );

  const isLoading = backlogLoading || hierarchyLoading;

  // Extract tickets from backlog or hierarchy
  const tickets = useMemo(
    () =>
      (includeChildBoards
        ? hierarchyTickets
        : (backlog?.tickets ?? [])) as TicketWithRelations[],
    [includeChildBoards, hierarchyTickets, backlog?.tickets]
  );
  const filteredTickets = useMemo(
    () => applyFilters(tickets as TicketWithRelations[]),
    [tickets, applyFilters]
  );

  // Create ticket mutation
  const createTicket = trpc.ticket.create.useMutation({
    onSuccess: () => {
      utils.backlog.get.invalidate();
    },
  });

  // Update ticket status mutation
  const updateTicketStatus = trpc.ticket.update.useMutation({
    onSuccess: () => {
      utils.backlog.get.invalidate();
      utils.ticket.getWithHierarchy.invalidate();
    },
  });

  // Move ticket to sprint mutation
  const moveToSprint = trpc.ticket.move.useMutation({
    onSuccess: () => {
      utils.backlog.get.invalidate();
      utils.sprint.getById.invalidate();
      utils.sprint.getAll.invalidate();
      utils.ticket.getWithHierarchy.invalidate();
    },
  });

  // Delete ticket mutation
  const deleteTicket = trpc.ticket.delete.useMutation({
    onSuccess: () => {
      utils.backlog.get.invalidate();
      utils.ticket.getWithHierarchy.invalidate();
    },
  });

  const handleMoveToSprint = async (ticketId: string, sprintId: string) => {
    await moveToSprint.mutateAsync({
      ticketId,
      sprintId,
      backlogId: null,
    });
  };

  const handleDeleteTicket = async (ticketId: string) => {
    await deleteTicket.mutateAsync({ id: ticketId });
  };

  // Handle opening a sub-ticket for editing
  const handleOpenSubTicket = (ticket: Ticket) => {
    setShowDetailDialog(false);
    setTimeout(() => {
      setSelectedTicket(ticket as unknown as TicketWithRelations);
      setShowDetailDialog(true);
    }, 100);
  };

  // Handle request to create a sub-ticket via full dialog
  const handleRequestCreateSubTicket = (parentId: string) => {
    setCreateSubTicketParentId(parentId);
    setShowTicketDialog(true);
  };

  const handleCreateTicket = async (data: TicketFormData) => {
    if (!backlog?.id) return;

    await createTicket.mutateAsync({
      boardId: resolvedParams.boardId,
      backlogId: backlog.id,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      storyPoints: data.storyPoints,
      parentId: createSubTicketParentId ?? data.parentId,
    });
    // Reset the parent ID after creating
    setCreateSubTicketParentId(null);
  };

  return (
    <div className="flex h-full flex-col bg-neutral-50">
      {/* Compact Backlog toolbar */}
      <div className="border-b border-neutral-200 bg-white px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-500">
            {tickets.length} {t('ticket.tickets')} in backlog
          </div>

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

            {/* Filters */}
            <TicketFilterPanel
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
              activeCount={activeFilterCount}
              boardId={resolvedParams.boardId}
              childBoards={childBoards}
              showBoardFilter={includeChildBoards}
            />

            {/* Create with AI Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setShowAICreator(true)}
            >
              <Sparkles className="h-4 w-4" />
              AI
            </Button>

            {/* Add Ticket Button */}
            <Button
              size="sm"
              className="gap-1"
              onClick={() => setShowTicketDialog(true)}
            >
              <Plus className="h-4 w-4" />
              {t('ticket.create')}
            </Button>
          </div>
        </div>
      </div>

      {/* Backlog Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-neutral-500">{t('common.loading')}</p>
          </div>
        ) : tickets.length === 0 ? (
          <BacklogEmptyState
            onCreateClick={() => setShowTicketDialog(true)}
            t={t}
          />
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-neutral-500">{t('filters.noResults')}</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              {t('filters.clearAll')}
            </Button>
          </div>
        ) : (
          <BacklogList
            tickets={filteredTickets as TicketWithRelations[]}
            onTicketClick={(ticket) => {
              setSelectedTicket(ticket);
              setShowDetailDialog(true);
            }}
            onCreateTicket={() => setShowTicketDialog(true)}
            sprints={sprints}
            onMoveToSprint={handleMoveToSprint}
            onDeleteTicket={handleDeleteTicket}
          />
        )}
      </div>

      {/* AI Ticket Creator Dialog */}
      <AITicketCreator
        boardId={resolvedParams.boardId}
        open={showAICreator}
        onOpenChange={setShowAICreator}
      />

      {/* Ticket Dialog for Creating */}
      <TicketDialog
        open={showTicketDialog}
        onOpenChange={(open) => {
          setShowTicketDialog(open);
          if (!open) setCreateSubTicketParentId(null);
        }}
        mode="create"
        boardId={resolvedParams.boardId}
        backlogId={backlog?.id}
        onSave={handleCreateTicket}
        availableUsers={boardMembers}
        availableParentTickets={tickets.filter((t) => !t.parentId)}
        ticket={
          createSubTicketParentId
            ? ({ parentId: createSubTicketParentId } as TicketWithRelations)
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
          onOpenSubTicket={handleOpenSubTicket}
          onRequestCreateSubTicket={handleRequestCreateSubTicket}
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

function BacklogEmptyState({
  onCreateClick,
  t,
}: {
  onCreateClick: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <Plus className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900">
          {t('ticket.noTickets')}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          {t('backlog.emptyDescription')}
        </p>
        <Button className="mt-6 gap-2" onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          <span>{t('ticket.create')}</span>
        </Button>
      </div>
    </div>
  );
}
