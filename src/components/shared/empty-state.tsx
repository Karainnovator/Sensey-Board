/**
 * Empty State Component
 *
 * Shows a friendly message when there's no content
 */

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4 text-center">
        {/* Icon */}
        {icon && (
          <div className="relative">
            {/* Decorative sakura petals */}
            <span className="absolute -top-2 -right-2 text-2xl opacity-30 rotate-12">
              🌸
            </span>
            <span className="absolute -bottom-1 -left-2 text-lg opacity-20 -rotate-12">
              🌸
            </span>

            {/* Main icon with gradient background */}
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-sakura-100 to-sakura-50 text-4xl shadow-lg">
              {icon}
            </div>
          </div>
        )}

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Action */}
        {action && (
          <Button onClick={action.onClick} className="mt-4" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
