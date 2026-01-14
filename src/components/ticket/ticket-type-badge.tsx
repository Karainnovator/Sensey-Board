/**
 * TicketTypeBadge Component
 *
 * Displays a colored badge for ticket types (ISSUE, FIX, HOTFIX, PROBLEM)
 * Colors per visual-design-reference.md section 7:
 * - ISSUE: #FFB7C5 (Sakura)
 * - FIX: #4ADE80 (Green)
 * - HOTFIX: #F87171 (Red)
 * - PROBLEM: #FBBF24 (Yellow)
 */

import type { TicketType } from '@prisma/client';
import { cn } from '@/lib/utils';

interface TicketTypeBadgeProps {
  type: TicketType;
  size?: 'sm' | 'md';
  className?: string;
}

const typeConfig = {
  ISSUE: {
    label: 'ISSUE',
    className: 'bg-sakura-100 text-sakura-500',
  },
  FIX: {
    label: 'FIX',
    className: 'bg-green-100 text-green-600',
  },
  HOTFIX: {
    label: 'HOTFIX',
    className: 'bg-red-100 text-red-600',
  },
  PROBLEM: {
    label: 'PROBLEM',
    className: 'bg-amber-100 text-amber-600',
  },
} as const;

export function TicketTypeBadge({
  type,
  size = 'md',
  className,
}: TicketTypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded',
        size === 'sm' ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]',
        'font-semibold uppercase tracking-wider',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
