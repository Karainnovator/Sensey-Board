'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface SubTicketProgressBarProps {
  completed: number;
  total: number;
  onClick?: () => void;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function SubTicketProgressBar({
  completed,
  total,
  onClick,
  size = 'sm',
  showLabel = true,
  className,
}: SubTicketProgressBarProps) {
  const t = useTranslations('ticket.inlineSubTickets');

  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      aria-label={t('toggle')}
    >
      {/* Progress bar */}
      <div
        className={cn(
          'bg-gray-200 rounded-full overflow-hidden',
          size === 'sm' ? 'w-12 h-1' : 'w-16 h-1.5'
        )}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            completed === total ? 'bg-green-500' : 'bg-sakura-400'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className={cn(
            'font-medium',
            size === 'sm' ? 'text-[10px]' : 'text-xs'
          )}
        >
          {completed}/{total}
        </span>
      )}
    </button>
  );
}
