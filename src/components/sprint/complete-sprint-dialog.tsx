/**
 * CompleteSprintDialog Component
 *
 * Dialog for completing a sprint
 * Shows summary of completed/incomplete tickets
 * Options for handling incomplete tickets:
 * - Move to backlog
 * - Move to new sprint (if one exists)
 * - Keep in current sprint
 */

'use client';

import { useState } from 'react';
import type { Sprint } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface CompleteSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint;
  completedTicketsCount: number;
  incompleteTicketsCount: number;
  hasNextSprint?: boolean;
  onCompleteSprint: (
    action: 'backlog' | 'next-sprint' | 'keep'
  ) => Promise<void>;
}

type IncompleteTicketAction = 'backlog' | 'next-sprint' | 'keep';

export function CompleteSprintDialog({
  open,
  onOpenChange,
  sprint,
  completedTicketsCount,
  incompleteTicketsCount,
  hasNextSprint = false,
  onCompleteSprint,
}: CompleteSprintDialogProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] =
    useState<IncompleteTicketAction>('backlog');

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onCompleteSprint(selectedAction);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to complete sprint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalTickets = completedTicketsCount + incompleteTicketsCount;
  const completionRate =
    totalTickets > 0
      ? Math.round((completedTicketsCount / totalTickets) * 100)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('sprint.completeDialog.title')}: {sprint.name}
          </DialogTitle>
          <DialogDescription>
            {t('sprint.completeDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sprint Summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">
              {t('sprint.completeDialog.summary')}
            </h4>

            <div className="space-y-2">
              {/* Completed Tickets */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{t('sprint.completeDialog.completed')}</span>
                </div>
                <span className="font-semibold">{completedTicketsCount}</span>
              </div>

              {/* Incomplete Tickets */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-orange-700">
                  <ListTodo className="h-4 w-4" />
                  <span>{t('sprint.completeDialog.incomplete')}</span>
                </div>
                <span className="font-semibold">{incompleteTicketsCount}</span>
              </div>

              {/* Completion Rate */}
              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-sm font-medium">
                <span>{t('sprint.completeDialog.completionRate')}</span>
                <span
                  className={cn(
                    'text-lg',
                    completionRate >= 80 && 'text-green-600',
                    completionRate >= 50 &&
                      completionRate < 80 &&
                      'text-orange-600',
                    completionRate < 50 && 'text-red-600'
                  )}
                >
                  {completionRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Incomplete Tickets Action */}
          {incompleteTicketsCount > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-900">
                {t('sprint.completeDialog.incompleteAction')}
              </Label>

              <RadioGroup
                value={selectedAction}
                onValueChange={(v) =>
                  setSelectedAction(v as IncompleteTicketAction)
                }
              >
                {/* Move to Backlog */}
                <div className="flex items-start space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                  <RadioGroupItem
                    value="backlog"
                    id="backlog"
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="backlog"
                      className="cursor-pointer font-medium"
                    >
                      {t('sprint.completeDialog.moveToBacklog')}
                    </Label>
                    <p className="mt-1 text-xs text-gray-600">
                      {t('sprint.completeDialog.moveToBacklogDesc')}
                    </p>
                  </div>
                </div>

                {/* Move to Next Sprint (if exists) */}
                {hasNextSprint && (
                  <div className="flex items-start space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                    <RadioGroupItem
                      value="next-sprint"
                      id="next-sprint"
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="next-sprint"
                        className="cursor-pointer font-medium"
                      >
                        {t('sprint.completeDialog.moveToNextSprint')}
                      </Label>
                      <p className="mt-1 text-xs text-gray-600">
                        {t('sprint.completeDialog.moveToNextSprintDesc')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Keep in Current Sprint */}
                <div className="flex items-start space-x-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                  <RadioGroupItem value="keep" id="keep" className="mt-0.5" />
                  <div className="flex-1">
                    <Label
                      htmlFor="keep"
                      className="cursor-pointer font-medium"
                    >
                      {t('sprint.completeDialog.keepInSprint')}
                    </Label>
                    <p className="mt-1 text-xs text-gray-600">
                      {t('sprint.completeDialog.keepInSprintDesc')}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Warning Alert */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm text-gray-700">
              {t('sprint.completeDialog.warning')}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('sprint.completeDialog.completing')}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t('sprint.completeDialog.button')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
