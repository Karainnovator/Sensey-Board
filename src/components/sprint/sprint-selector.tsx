/**
 * SprintSelector Component
 *
 * Dropdown to select active sprint
 * Per visual-design-reference.md section 9:
 * - Active sprint: sakura-50 background
 * - Completed: gray-400 text with checkmark
 * - "Create New Sprint" button at bottom
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Sprint } from '@prisma/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SprintSelectorProps {
  sprints: Sprint[];
  currentSprintId: string | null;
  onSprintChange: (sprintId: string | null) => void;
  onCreateSprint: () => void;
}

export function SprintSelector({
  sprints,
  currentSprintId,
  onSprintChange,
  onCreateSprint,
}: SprintSelectorProps) {
  const t = useTranslations('sprint');
  const [open, setOpen] = useState(false);

  const currentSprint = sprints.find((s) => s.id === currentSprintId);
  const activeSprints = sprints.filter((s) => s.status === 'ACTIVE');
  const plannedSprints = sprints.filter((s) => s.status === 'PLANNED');
  const completedSprints = sprints.filter((s) => s.status === 'COMPLETED');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[200px] justify-between gap-2"
        >
          <span className="truncate">
            {currentSprint ? (
              <>
                <span className="font-semibold">{currentSprint.name}</span>
                {currentSprint.status === 'ACTIVE' && (
                  <span className="ml-2 text-xs text-sakura-600">
                    {t('active')}
                  </span>
                )}
              </>
            ) : (
              t('selectSprint')
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        {/* Active Sprints */}
        {activeSprints.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
              {t('active')}
            </div>
            {activeSprints.map((sprint) => (
              <DropdownMenuItem
                key={sprint.id}
                onClick={() => {
                  onSprintChange(sprint.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-2 px-3 py-2',
                  sprint.id === currentSprintId && 'bg-sakura-50'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{sprint.name}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(sprint.startDate), 'MMM d')} -{' '}
                    {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
                {sprint.id === currentSprintId && (
                  <Check className="h-4 w-4 text-sakura-600" />
                )}
              </DropdownMenuItem>
            ))}
            {(plannedSprints.length > 0 || completedSprints.length > 0) && (
              <DropdownMenuSeparator />
            )}
          </>
        )}

        {/* Planned Sprints */}
        {plannedSprints.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
              {t('planned')}
            </div>
            {plannedSprints.map((sprint) => (
              <DropdownMenuItem
                key={sprint.id}
                onClick={() => {
                  onSprintChange(sprint.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-2 px-3 py-2',
                  sprint.id === currentSprintId && 'bg-sakura-50'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{sprint.name}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(sprint.startDate), 'MMM d')} -{' '}
                    {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
                {sprint.id === currentSprintId && (
                  <Check className="h-4 w-4 text-sakura-600" />
                )}
              </DropdownMenuItem>
            ))}
            {completedSprints.length > 0 && <DropdownMenuSeparator />}
          </>
        )}

        {/* Completed Sprints */}
        {completedSprints.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
              {t('completed')}
            </div>
            {completedSprints.map((sprint) => (
              <DropdownMenuItem
                key={sprint.id}
                onClick={() => {
                  onSprintChange(sprint.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-2 px-3 py-2',
                  sprint.id === currentSprintId && 'bg-sakura-50'
                )}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-gray-400">
                    {sprint.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(sprint.startDate), 'MMM d')} -{' '}
                    {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {sprint.id === currentSprintId && (
                    <Check className="h-4 w-4 text-sakura-600" />
                  )}
                  <Check className="h-3 w-3 text-green-600" />
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Create New Sprint */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onCreateSprint();
            setOpen(false);
          }}
          className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sakura-600"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">{t('createNewSprint')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
