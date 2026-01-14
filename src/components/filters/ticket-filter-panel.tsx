'use client';

import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';
import type { TicketFilters } from '@/lib/hooks/use-ticket-filters';
import type { TicketStatus, TicketType, Priority } from '@prisma/client';

interface ChildBoard {
  id: string;
  name: string;
  prefix: string;
  color: string;
}

interface TicketFilterPanelProps {
  filters: TicketFilters;
  onChange: (filters: TicketFilters) => void;
  onClear: () => void;
  activeCount: number;
  availableAssignees?: { id: string; name: string }[];
  boardId: string;
  childBoards?: ChildBoard[];
  showBoardFilter?: boolean;
}

const STATUSES: TicketStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const TYPES: TicketType[] = ['ISSUE', 'FIX', 'HOTFIX', 'PROBLEM'];
const PRIORITIES: Priority[] = ['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST'];

// Status label mapping
const STATUS_KEYS: Record<TicketStatus, string> = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  IN_REVIEW: 'inReview',
  DONE: 'done',
};

// Type label mapping
const TYPE_KEYS: Record<TicketType, string> = {
  ISSUE: 'issue',
  FIX: 'fix',
  HOTFIX: 'hotfix',
  PROBLEM: 'problem',
};

// Priority label mapping
const PRIORITY_KEYS: Record<Priority, string> = {
  LOWEST: 'lowest',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  HIGHEST: 'highest',
};

export function TicketFilterPanel({
  filters,
  onChange,
  onClear,
  activeCount,
  availableAssignees: _availableAssignees = [],
  boardId,
  childBoards = [],
  showBoardFilter = false,
}: TicketFilterPanelProps) {
  const t = useTranslations('filters');
  const tCommon = useTranslations('common');
  const tStatus = useTranslations('ticket.status');
  const tTypes = useTranslations('ticket.types');
  const tPriority = useTranslations('ticket.priority');
  const tProject = useTranslations('project');
  const { user } = useAuth();

  // Fetch projects for the current board
  const { data: projects = [] } = trpc.project.list.useQuery({ boardId });

  const toggleArrayFilter = <T extends string>(
    key: 'statuses' | 'types' | 'priorities' | 'assigneeIds',
    value: T
  ) => {
    const current = filters[key] as T[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-h-[44px] px-4">
          <Filter className="h-4 w-4" />
          <span>{t('title')}</span>
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 bg-sakura-100 text-sakura-700"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* My Tickets / All Tickets Toggle */}
          {user && (
            <>
              <div>
                <Label className="text-xs font-medium text-gray-500 mb-2 block">
                  Quick Filters
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      filters.assigneeId === user.id ? 'default' : 'outline'
                    }
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      onChange({ ...filters, assigneeId: user.id })
                    }
                  >
                    {tCommon('myTickets')}
                  </Button>
                  <Button
                    variant={!filters.assigneeId ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => onChange({ ...filters, assigneeId: null })}
                  >
                    {tCommon('allTickets')}
                  </Button>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Search */}
          <div>
            <Label className="text-xs font-medium text-gray-500">
              {t('searchTicketId')}
            </Label>
            <Input
              placeholder="PRJ-123..."
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
              className="mt-1"
            />
          </div>

          <Separator />

          {/* Project Filter */}
          {projects.length > 0 && (
            <>
              <div>
                <Label className="text-xs font-medium text-gray-500">
                  {t('project')}
                </Label>
                <Select
                  value={filters.projectId || 'all'}
                  onValueChange={(value) =>
                    onChange({
                      ...filters,
                      projectId: value === 'all' ? null : value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={tProject('select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{tCommon('allTickets')}</SelectItem>
                    <SelectItem value="none">
                      {tProject('noProject')}
                    </SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <span>{project.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
            </>
          )}

          {/* Board Filter (only shown when includeChildBoards is enabled) */}
          {showBoardFilter && childBoards.length > 0 && (
            <>
              <div>
                <Label className="text-xs font-medium text-gray-500">
                  {t('board')}
                </Label>
                <Select
                  value={filters.boardId || 'all'}
                  onValueChange={(value) =>
                    onChange({
                      ...filters,
                      boardId: value === 'all' ? null : value,
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('allBoards')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allBoards')}</SelectItem>
                    {childBoards.map((board) => (
                      <SelectItem key={board.id} value={board.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded"
                            style={{ backgroundColor: board.color }}
                          />
                          <span>{board.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({board.prefix})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
            </>
          )}

          {/* Status */}
          <div>
            <Label className="text-xs font-medium text-gray-500">
              {t('status')}
            </Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {STATUSES.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={filters.statuses.includes(status)}
                    onCheckedChange={() =>
                      toggleArrayFilter('statuses', status)
                    }
                  />
                  <span>{tStatus(STATUS_KEYS[status])}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Type */}
          <div>
            <Label className="text-xs font-medium text-gray-500">
              {t('type')}
            </Label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={filters.types.includes(type)}
                    onCheckedChange={() => toggleArrayFilter('types', type)}
                  />
                  <span>{tTypes(TYPE_KEYS[type])}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Priority */}
          <div>
            <Label className="text-xs font-medium text-gray-500">
              {t('priority')}
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRIORITIES.map((priority) => (
                <label
                  key={priority}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Checkbox
                    checked={filters.priorities.includes(priority)}
                    onCheckedChange={() =>
                      toggleArrayFilter('priorities', priority)
                    }
                  />
                  <span>{tPriority(PRIORITY_KEYS[priority])}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Story Points */}
          <div>
            <Label className="text-xs font-medium text-gray-500">
              {t('storyPoints')}
            </Label>
            <div className="mt-2 flex gap-2">
              <Input
                type="number"
                placeholder={t('storyPointsMin')}
                value={filters.storyPointsMin ?? ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    storyPointsMin: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-20"
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder={t('storyPointsMax')}
                value={filters.storyPointsMax ?? ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    storyPointsMax: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                className="w-20"
              />
            </div>
          </div>

          {/* Clear Button */}
          {activeCount > 0 && (
            <>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2"
                onClick={onClear}
              >
                <X className="h-4 w-4" />
                {t('clearAll')}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
