/**
 * SprintHeader Component
 *
 * Displays sprint information and actions
 * Shows: Sprint selector, date range, goal, complete sprint button
 */

'use client';

import { useTranslations } from 'next-intl';
import type { Sprint } from '@prisma/client';
import { SprintSelector } from './sprint-selector';
import { Button } from '@/components/ui/button';
import { Calendar, Target, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SprintHeaderProps {
  sprints: Sprint[];
  currentSprint: Sprint | null;
  onSprintChange: (sprintId: string | null) => void;
  onCreateSprint: () => void;
  onCompleteSprint?: () => void;
  showCompleteButton?: boolean;
  className?: string;
}

export function SprintHeader({
  sprints,
  currentSprint,
  onSprintChange,
  onCreateSprint,
  onCompleteSprint,
  showCompleteButton = true,
  className,
}: SprintHeaderProps) {
  const t = useTranslations('sprint');

  const canComplete =
    currentSprint &&
    currentSprint.status === 'ACTIVE' &&
    showCompleteButton &&
    onCompleteSprint;

  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-gray-200 bg-white p-6',
        className
      )}
    >
      {/* Top Row: Selector + Actions */}
      <div className="flex items-center justify-between gap-4">
        <SprintSelector
          sprints={sprints}
          currentSprintId={currentSprint?.id ?? null}
          onSprintChange={onSprintChange}
          onCreateSprint={onCreateSprint}
        />

        {canComplete && (
          <Button
            onClick={onCompleteSprint}
            variant="outline"
            className="gap-2 border-green-600 text-green-600 hover:bg-green-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('complete')}
          </Button>
        )}
      </div>

      {/* Sprint Info */}
      {currentSprint && (
        <div className="flex flex-col gap-3">
          {/* Date Range */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>
              {format(new Date(currentSprint.startDate), 'MMM d')} -{' '}
              {format(new Date(currentSprint.endDate), 'MMM d, yyyy')}
            </span>
            {currentSprint.status === 'ACTIVE' && (
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {t('active')}
              </span>
            )}
            {currentSprint.status === 'COMPLETED' && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                {t('completed')}
              </span>
            )}
            {currentSprint.status === 'PLANNED' && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {t('planned')}
              </span>
            )}
          </div>

          {/* Goal */}
          {currentSprint.goal && (
            <div className="flex items-start gap-2 text-sm">
              <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
              <p className="text-gray-700">{currentSprint.goal}</p>
            </div>
          )}
        </div>
      )}

      {/* No Sprint Selected */}
      {!currentSprint && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">{t('noSprintSelected')}</p>
            <p className="mt-1 text-xs text-gray-500">
              {t('selectOrCreateSprint')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
