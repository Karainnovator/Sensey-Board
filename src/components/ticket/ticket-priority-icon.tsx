/**
 * TicketPriorityIcon Component
 *
 * Displays an icon for ticket priority levels
 * Per visual-design-reference.md section 7:
 * - LOWEST: gray arrow down
 * - LOW: blue arrow down
 * - MEDIUM: gray arrow right
 * - HIGH: orange arrow up
 * - HIGHEST: red double arrow up
 */

import type { Priority } from '@prisma/client';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ChevronsUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TicketPriorityIconProps {
  priority: Priority;
  className?: string;
  size?: number;
}

const priorityConfig = {
  LOWEST: {
    icon: ChevronDown,
    className: 'text-gray-400',
    label: 'Lowest',
  },
  LOW: {
    icon: ArrowDown,
    className: 'text-blue-500',
    label: 'Low',
  },
  MEDIUM: {
    icon: ArrowRight,
    className: 'text-gray-500',
    label: 'Medium',
  },
  HIGH: {
    icon: ArrowUp,
    className: 'text-orange-500',
    label: 'High',
  },
  HIGHEST: {
    icon: ChevronsUp,
    className: 'text-red-500',
    label: 'Highest',
  },
} as const;

export function TicketPriorityIcon({
  priority,
  className,
  size = 16,
}: TicketPriorityIconProps) {
  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <Icon
      className={cn(config.className, className)}
      size={size}
      aria-label={`Priority: ${config.label}`}
    />
  );
}

// Utility to get priority display name
export function getPriorityLabel(priority: Priority): string {
  return priorityConfig[priority].label;
}

// Utility to get priority color class
export function getPriorityColorClass(priority: Priority): string {
  return priorityConfig[priority].className;
}
