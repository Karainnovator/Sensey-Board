/**
 * TicketDialog Component
 *
 * Dialog for creating and editing tickets
 * Layout: Left (Title + 2-col fields) | Right (Markdown Description)
 * Sub-tickets at bottom (full width)
 */

'use client';

import { useState, useEffect } from 'react';
import type { Ticket, User } from '@prisma/client';
import type { TicketUser } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { SubTicketList } from './sub-ticket-list';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { TicketTypeBadge } from './ticket-type-badge';
import type { Priority, TicketType } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc';
import { X, Plus } from 'lucide-react';

interface TicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket & {
    assignee?: User | TicketUser | null;
    subTickets?: Ticket[];
    parent?: Ticket | null;
  };
  mode?: 'create' | 'edit';
  boardId: string;
  sprintId?: string;
  backlogId?: string;
  onSave?: (data: TicketFormData) => Promise<void>;
  onCreateSubTicket?: (parentId: string, title: string) => Promise<void>;
  onDeleteSubTicket?: (subTicketId: string) => Promise<void>;
  onRequestCreateSubTicket?: (parentId: string) => void; // Open full dialog to create sub-ticket
  onOpenSubTicket?: (ticket: Ticket) => void; // Open sub-ticket in full editor
  availableUsers?: (User | TicketUser)[];
  availableParentTickets?: Ticket[]; // Tickets that can be parents
}

export interface TicketFormData {
  title: string;
  description?: string;
  type: TicketType;
  priority: Priority;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  assigneeId?: string;
  assigneeIds?: string[];
  reviewerId?: string;
  reviewerIds?: string[];
  storyPoints?: number;
  percentage?: number;
  weight?: number;
  missionRank?: string;
  projectId?: string;
  parentId?: string;
}

export function TicketDialog({
  open,
  onOpenChange,
  ticket,
  mode = 'create',
  onSave,
  onCreateSubTicket,
  onDeleteSubTicket,
  onRequestCreateSubTicket,
  onOpenSubTicket,
  availableUsers = [],
  availableParentTickets = [],
}: TicketDialogProps) {
  const t = useTranslations();
  const utils = trpc.useUtils();
  const [formData, setFormData] = useState<TicketFormData>({
    title: '',
    description: '',
    type: 'ISSUE',
    priority: 'MEDIUM',
    status: 'TODO',
    assigneeId: undefined,
    assigneeIds: [],
    reviewerId: undefined,
    reviewerIds: [],
    storyPoints: undefined,
    percentage: 0,
    weight: 1,
    missionRank: undefined,
    projectId: undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [subTickets, setSubTickets] = useState<Ticket[]>([]);

  // Fetch ticket with sub-tickets when in edit mode
  const { data: ticketData, refetch: refetchTicket } =
    trpc.ticket.getById.useQuery(
      { id: ticket?.id ?? '' },
      { enabled: mode === 'edit' && !!ticket?.id }
    );

  // Mutations
  const createSubTicket = trpc.ticket.createSubTicket.useMutation({
    onSuccess: () => {
      refetchTicket();
      utils.sprint.getById.invalidate();
      utils.backlog.get.invalidate();
    },
  });

  const deleteTicket = trpc.ticket.delete.useMutation({
    onSuccess: () => {
      refetchTicket();
      utils.sprint.getById.invalidate();
      utils.backlog.get.invalidate();
    },
  });

  const updateTicket = trpc.ticket.update.useMutation({
    onSuccess: () => {
      refetchTicket();
      utils.sprint.getById.invalidate();
      utils.backlog.get.invalidate();
    },
  });

  // Update subTickets when ticketData changes
  useEffect(() => {
    if (ticketData?.subTickets) {
      setSubTickets(ticketData.subTickets);
    } else if (ticket?.subTickets) {
      setSubTickets(ticket.subTickets);
    }
  }, [ticketData, ticket]);

  const TICKET_TYPES: { value: TicketType; label: string }[] = [
    { value: 'ISSUE', label: t('ticket.types.issue') },
    { value: 'FIX', label: t('ticket.types.fix') },
    { value: 'HOTFIX', label: t('ticket.types.hotfix') },
    { value: 'PROBLEM', label: t('ticket.types.problem') },
  ];

  const PRIORITIES: { value: Priority; label: string }[] = [
    { value: 'LOWEST', label: t('ticket.priority.lowest') },
    { value: 'LOW', label: t('ticket.priority.low') },
    { value: 'MEDIUM', label: t('ticket.priority.medium') },
    { value: 'HIGH', label: t('ticket.priority.high') },
    { value: 'HIGHEST', label: t('ticket.priority.highest') },
  ];

  // Helper functions
  const getUserInitials = (user: User | TicketUser) => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  const getUserDisplayName = (user: User | TicketUser) =>
    user.name ?? user.email;

  // Multi-select handlers
  const handleToggleAssignee = (userId: string) => {
    setFormData((prev) => {
      const currentIds = prev.assigneeIds ?? [];
      const newIds = currentIds.includes(userId)
        ? currentIds.filter((id) => id !== userId)
        : [...currentIds, userId];
      return { ...prev, assigneeIds: newIds, assigneeId: newIds[0] };
    });
  };

  const handleRemoveAssignee = (userId: string) => {
    setFormData((prev) => {
      const newIds = (prev.assigneeIds ?? []).filter((id) => id !== userId);
      return { ...prev, assigneeIds: newIds, assigneeId: newIds[0] };
    });
  };

  const handleToggleReviewer = (userId: string) => {
    setFormData((prev) => {
      const currentIds = prev.reviewerIds ?? [];
      const newIds = currentIds.includes(userId)
        ? currentIds.filter((id) => id !== userId)
        : [...currentIds, userId];
      return { ...prev, reviewerIds: newIds, reviewerId: newIds[0] };
    });
  };

  const handleRemoveReviewer = (userId: string) => {
    setFormData((prev) => {
      const newIds = (prev.reviewerIds ?? []).filter((id) => id !== userId);
      return { ...prev, reviewerIds: newIds, reviewerId: newIds[0] };
    });
  };

  const selectedAssignees = availableUsers.filter((u) =>
    formData.assigneeIds?.includes(u.id)
  );
  const selectedReviewers = availableUsers.filter((u) =>
    formData.reviewerIds?.includes(u.id)
  );

  // Initialize form data
  useEffect(() => {
    if (ticket && mode === 'edit') {
      setFormData({
        title: ticket.title,
        description: ticket.description ?? '',
        type: ticket.type,
        priority: ticket.priority,
        status: ticket.status,
        assigneeId: ticket.assigneeId ?? undefined,
        assigneeIds: ticket.assigneeId ? [ticket.assigneeId] : [],
        reviewerId: ticket.reviewerId ?? undefined,
        reviewerIds: ticket.reviewerId ? [ticket.reviewerId] : [],
        storyPoints: ticket.storyPoints ?? undefined,
        percentage: ticket.percentage ?? 0,
        weight: ticket.weight ?? 1,
        missionRank: ticket.missionRank ?? undefined,
        projectId: ticket.projectId ?? undefined,
        parentId: ticket.parentId ?? undefined,
      });
    } else {
      // For create mode, check if parentId is pre-selected (for sub-ticket creation)
      setFormData({
        title: '',
        description: '',
        type: 'ISSUE',
        priority: 'MEDIUM',
        status: 'TODO',
        assigneeId: undefined,
        assigneeIds: [],
        reviewerId: undefined,
        reviewerIds: [],
        storyPoints: undefined,
        percentage: 0,
        weight: 1,
        missionRank: undefined,
        projectId: undefined,
        parentId: ticket?.parentId ?? undefined,
      });
    }
  }, [ticket, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save ticket:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateSubTicket = async (title: string) => {
    if (!ticket?.id) return;
    if (onCreateSubTicket) {
      await onCreateSubTicket(ticket.id, title);
    } else {
      await createSubTicket.mutateAsync({ parentId: ticket.id, title });
    }
  };

  const handleDeleteSubTicket = async (subTicketId: string) => {
    if (onDeleteSubTicket) {
      await onDeleteSubTicket(subTicketId);
    } else {
      await deleteTicket.mutateAsync({ id: subTicketId });
    }
  };

  const handleUpdateSubTicketTitle = async (
    subTicketId: string,
    title: string
  ) => {
    await updateTicket.mutateAsync({ id: subTicketId, title });
  };

  const handleToggleSubTicketComplete = async (
    subTicketId: string,
    completed: boolean
  ) => {
    await updateTicket.mutateAsync({
      id: subTicketId,
      status: completed ? 'DONE' : 'TODO',
    });
  };

  // File upload handler (images, PDFs, docs, etc.)
  const handleFileUpload = async (
    file: File
  ): Promise<{ url: string; isImage: boolean; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Upload failed');
    const data = await response.json();
    return {
      url: data.url,
      isImage: data.isImage,
      filename: data.filename ?? file.name,
    };
  };

  // Render user select popover
  const renderUserSelect = (
    selectedUsers: (User | TicketUser)[],
    onToggle: (id: string) => void,
    onRemove: (id: string) => void,
    selectedIds: string[],
    label: string,
    addLabel: string
  ) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex flex-wrap gap-1 min-h-[28px]">
        {selectedUsers.length === 0 ? (
          <span className="text-xs text-muted-foreground">
            {t('common.unassigned')}
          </span>
        ) : (
          selectedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-1 bg-gray-100 rounded-full pl-0.5 pr-1.5 py-0.5"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback className="text-[8px] bg-sakura-200 text-sakura-700">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-medium">
                {getUserDisplayName(user)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(user.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ))
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-2"
          >
            <Plus className="h-2.5 w-2.5 mr-0.5" />
            {addLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1.5" align="start">
          <div className="text-[10px] font-medium text-muted-foreground px-2 py-1">
            {t('ticket.assignees.selectPlaceholder')}
          </div>
          {availableUsers.length === 0 ? (
            <div className="px-2 py-3 text-[10px] text-center text-muted-foreground">
              {t('ticket.assignees.noTeamMembers')}
            </div>
          ) : (
            availableUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
              >
                <Checkbox
                  checked={selectedIds.includes(user.id)}
                  onCheckedChange={() => onToggle(user.id)}
                  className="h-3.5 w-3.5"
                />
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="text-[8px] bg-sakura-200 text-sakura-700">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{getUserDisplayName(user)}</span>
              </label>
            ))
          )}
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 bg-gray-50/50 px-5 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {mode === 'edit' && ticket && (
              <>
                <TicketTypeBadge type={ticket.type} />
                <span className="text-xs font-mono text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                  {ticket.key}
                </span>
              </>
            )}
          </div>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {mode === 'create'
              ? t('ticket.create')
              : ticket?.title || t('ticket.edit')}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Main content: Left (fields) + Right (description) */}
          <div className="flex gap-5 px-5 py-4 flex-1 overflow-auto">
            {/* Left column: Title + 2-col grid fields */}
            <div className="flex-1 space-y-3 min-w-0">
              {/* Title */}
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs font-medium">
                  {t('ticket.titleLabel')}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder={t('ticket.titlePlaceholder')}
                  required
                  maxLength={200}
                  className="h-9"
                />
              </div>

              {/* 2-column grid for metadata fields */}
              <div className="grid grid-cols-2 gap-3">
                {/* Status (edit only) */}
                {mode === 'edit' && (
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      {t('ticket.statusField')}
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          status: v as typeof formData.status,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">
                          {t('ticket.status.todo')}
                        </SelectItem>
                        <SelectItem value="IN_PROGRESS">
                          {t('ticket.status.inProgress')}
                        </SelectItem>
                        <SelectItem value="IN_REVIEW">
                          {t('ticket.status.inReview')}
                        </SelectItem>
                        <SelectItem value="DONE">
                          {t('ticket.status.done')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Type */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('ticket.typeField')}
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: TicketType) =>
                      setFormData({ ...formData, type: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('ticket.priorityField')}
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(v: Priority) =>
                      setFormData({ ...formData, priority: v })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Story Points */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('ticket.storyPointsField')}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.storyPoints ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storyPoints: e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined,
                      })
                    }
                    placeholder="0"
                    className="h-8 text-xs"
                  />
                </div>

                {/* Assignees */}
                <div className="col-span-2">
                  {renderUserSelect(
                    selectedAssignees,
                    handleToggleAssignee,
                    handleRemoveAssignee,
                    formData.assigneeIds ?? [],
                    t('ticket.assigneeField'),
                    t('ticket.assignees.addButton')
                  )}
                </div>

                {/* Reviewers */}
                <div className="col-span-2">
                  {renderUserSelect(
                    selectedReviewers,
                    handleToggleReviewer,
                    handleRemoveReviewer,
                    formData.reviewerIds ?? [],
                    t('ticket.fields.reviewer'),
                    t('ticket.reviewers.addButton')
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('ticket.fields.percentage')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.percentage ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          percentage: parseInt(e.target.value, 10),
                        })
                      }
                      className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sakura-400"
                    />
                    <span className="text-xs font-medium text-gray-600 w-8 text-right">
                      {formData.percentage ?? 0}%
                    </span>
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('ticket.fields.weight')}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.weight ?? 1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: e.target.value
                          ? parseInt(e.target.value, 10)
                          : 1,
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>

                {/* Mission Rank */}
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t('ticket.fields.missionRank')}
                  </Label>
                  <Input
                    type="text"
                    value={formData.missionRank ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        missionRank: e.target.value || undefined,
                      })
                    }
                    placeholder="xs, s, m, l, xl, xxl"
                    className="h-8 text-xs"
                  />
                </div>

                {/* Parent Ticket (for linking as sub-ticket) */}
                {availableParentTickets.length > 0 && (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">
                      {t('ticket.fields.parent')}
                    </Label>
                    <Select
                      value={formData.parentId ?? 'none'}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          parentId: v === 'none' ? undefined : v,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue
                          placeholder={t('ticket.fields.selectParent')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {t('ticket.fields.noParent')}
                        </SelectItem>
                        {availableParentTickets
                          .filter((pt) => pt.id !== ticket?.id) // Exclude self
                          .map((pt) => (
                            <SelectItem key={pt.id} value={pt.id}>
                              <span className="font-mono text-gray-500 mr-1">
                                {pt.key}
                              </span>
                              <span className="truncate">{pt.title}</span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {ticket?.parent && (
                      <p className="text-[10px] text-muted-foreground">
                        {t('ticket.fields.currentParent')}:{' '}
                        <span className="font-mono">{ticket.parent.key}</span> -{' '}
                        {ticket.parent.title}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Description (Markdown Editor) */}
            <div className="w-[320px] flex flex-col space-y-1 flex-shrink-0">
              <Label className="text-xs font-medium">
                {t('ticket.description')}
              </Label>
              <MarkdownEditor
                value={formData.description ?? ''}
                onChange={(v) => setFormData({ ...formData, description: v })}
                placeholder={t('ticket.descriptionPlaceholder')}
                className="flex-1 min-h-[300px]"
                onFileUpload={handleFileUpload}
              />
            </div>
          </div>

          {/* Sub-tickets section (only in edit mode) */}
          {mode === 'edit' && ticket && (
            <div className="border-t border-gray-100 px-5 py-3 flex-shrink-0">
              <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                {t('ticket.subTickets.title')}
              </Label>
              <SubTicketList
                subTickets={subTickets}
                onCreate={
                  onRequestCreateSubTicket ? undefined : handleCreateSubTicket
                }
                onUpdateTitle={handleUpdateSubTicketTitle}
                onToggleComplete={handleToggleSubTicketComplete}
                onDelete={handleDeleteSubTicket}
                onOpenSubTicket={onOpenSubTicket}
                onRequestCreateSubTicket={
                  onRequestCreateSubTicket
                    ? () => {
                        onOpenChange(false); // Close current dialog
                        onRequestCreateSubTicket(ticket.id); // Request to open create dialog with parent
                      }
                    : undefined
                }
                isCreating={createSubTicket.isPending}
              />
            </div>
          )}

          {/* Footer */}
          <DialogFooter className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex-shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || !formData.title.trim()}
            >
              {isSaving
                ? t('common.saving')
                : mode === 'create'
                  ? t('common.create')
                  : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
