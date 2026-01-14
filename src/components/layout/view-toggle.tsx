'use client';

import { LayoutList, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type ViewMode = 'list' | 'kanban';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-neutral-100 p-1',
        className
      )}
      role="group"
      aria-label={t('views.modeToggle')}
    >
      {/* List View Button */}
      <Button
        variant="ghost"
        onClick={() => onViewChange('list')}
        className={cn(
          'min-h-[44px] min-w-[44px] gap-2 px-3 transition-all',
          view === 'list' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200/50'
        )}
        aria-label={t('views.switchToList')}
        aria-pressed={view === 'list'}
      >
        <LayoutList className="h-4 w-4" />
        <span className="text-xs font-medium">{t('views.list')}</span>
      </Button>

      {/* Kanban View Button */}
      <Button
        variant="ghost"
        onClick={() => onViewChange('kanban')}
        className={cn(
          'min-h-[44px] min-w-[44px] gap-2 px-3 transition-all',
          view === 'kanban' ? 'bg-white shadow-sm' : 'hover:bg-neutral-200/50'
        )}
        aria-label={t('views.switchToKanban')}
        aria-pressed={view === 'kanban'}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="text-xs font-medium">{t('views.kanban')}</span>
      </Button>
    </div>
  );
}
