/**
 * CreateSprintDialog Component
 *
 * Dialog for creating a new sprint with auto-migration
 * CRITICAL: Auto-moves incomplete tickets (TODO, IN_PROGRESS, IN_REVIEW) from previous sprint
 * DONE tickets stay in their original sprint
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schema validation messages will be in English since Zod doesn't support dynamic translations easily
// But we can translate them in the form messages
const createSprintSchema = z
  .object({
    name: z.string().min(1, 'Sprint name is required'),
    goal: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    autoMigrate: z.boolean(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type CreateSprintFormData = z.infer<typeof createSprintSchema>;

interface CreateSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextSprintNumber: number;
  hasActiveSprint: boolean;
  incompleteTicketsCount?: number;
  onCreateSprint: (data: {
    name: string;
    goal?: string;
    startDate: Date;
    endDate: Date;
    autoMigrate: boolean;
  }) => Promise<void>;
}

export function CreateSprintDialog({
  open,
  onOpenChange,
  nextSprintNumber,
  hasActiveSprint,
  incompleteTicketsCount = 0,
  onCreateSprint,
}: CreateSprintDialogProps) {
  const t = useTranslations('sprint');
  const tCommon = useTranslations('common');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSprintFormData>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      name: `Sprint ${nextSprintNumber}`,
      goal: '',
      startDate: new Date(),
      endDate: addDays(new Date(), 14), // Default 2-week sprint
      autoMigrate: true,
    },
  });

  const handleSubmit = async (data: CreateSprintFormData) => {
    setIsSubmitting(true);
    try {
      await onCreateSprint(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create sprint:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showMigrationWarning =
    incompleteTicketsCount > 0 && form.watch('autoMigrate');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createNewSprint')}</DialogTitle>
          <DialogDescription>{t('planYourNextSprint')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Sprint Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sprint Goal */}
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('goal')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('goalPlaceholder')}
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t('goalDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('startDate')} *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'MMM d, yyyy')
                            ) : (
                              <span>{tCommon('selectDate')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('endDate')} *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'MMM d, yyyy')
                            ) : (
                              <span>{tCommon('selectDate')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date('1900-01-01') ||
                            (form.watch('startDate') &&
                              date <= form.watch('startDate'))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Auto-migration Alert */}
            {showMigrationWarning && (
              <Alert className="border-sakura-200 bg-sakura-50">
                <AlertCircle className="h-4 w-4 text-sakura-600" />
                <AlertDescription className="text-sm text-gray-700">
                  {t('ticketsWillMigrate', { count: incompleteTicketsCount })}
                </AlertDescription>
              </Alert>
            )}

            {/* Active Sprint Warning */}
            {hasActiveSprint && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm text-gray-700">
                  {t('activeSprintWarning')}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {tCommon('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-sakura-600 hover:bg-sakura-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('creating')}
                  </>
                ) : (
                  t('create')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
