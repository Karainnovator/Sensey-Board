/**
 * Board Card Component
 *
 * Card for displaying a board with gradient bar at top
 * Enhanced with smooth hover animations
 */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { MoreVertical, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BoardMember {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
}

interface BoardCardProps {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  members: BoardMember[];
  ticketCount: number;
}

// Color to gradient mapping
const colorToGradient: Record<string, string> = {
  '#FFB7C5': 'from-sakura-200 to-sakura-300',
  '#93C5FD': 'from-blue-200 to-blue-400',
  '#6EE7B7': 'from-green-200 to-green-400',
  '#C4B5FD': 'from-purple-200 to-purple-400',
  '#FCD34D': 'from-amber-200 to-amber-400',
};

function getGradientClass(color: string): string {
  // Try exact match first
  if (colorToGradient[color]) {
    return colorToGradient[color];
  }
  // Default to sakura
  return 'from-sakura-200 to-sakura-300';
}

export function BoardCard({
  id,
  name,
  description,
  color,
  members,
  ticketCount,
}: BoardCardProps) {
  const locale = useLocale();
  const t = useTranslations();

  // Get first 3 members to display
  const displayMembers = members.slice(0, 3);
  const remainingCount = Math.max(0, members.length - 3);
  const gradientClass = getGradientClass(color);

  return (
    <Link href={`/${locale}/board/${id}`}>
      <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-150 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-transparent">
        {/* Gradient Bar - 8px height */}
        <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />

        {/* Content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-sakura-500 transition-colors">
                {name}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {description}
                </p>
              )}
            </div>

            {/* Menu Button - visible on hover */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // TODO: Open menu
              }}
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
            {/* Members */}
            <div className="flex -space-x-2 flex-shrink-0">
              {displayMembers.map((member) => {
                const initials =
                  member.user.name
                    ?.split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase() || 'U';

                return (
                  <Avatar
                    key={member.id}
                    className="h-7 w-7 rounded-lg border-2 border-white ring-0"
                  >
                    <AvatarImage
                      src={member.user.avatar || undefined}
                      alt={member.user.name || 'User'}
                    />
                    <AvatarFallback className="rounded-lg bg-sakura-200 text-sakura-500 text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {remainingCount > 0 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-white bg-gray-100 text-xs font-semibold text-gray-600">
                  +{remainingCount}
                </div>
              )}
            </div>

            {/* Ticket Count */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0 ml-auto relative z-10">
              <ClipboardList className="h-4 w-4" />
              <span className="whitespace-nowrap">
                {ticketCount}{' '}
                {ticketCount === 1 ? t('ticket.ticket') : t('ticket.tickets')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Create Board Card - Special card for creating new boards
 */
export function CreateBoardCard({ onClick }: { onClick: () => void }) {
  const t = useTranslations('board');

  return (
    <div
      onClick={onClick}
      className="group relative h-[180px] bg-white rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 hover:border-sakura-300 hover:bg-sakura-50 flex flex-col items-center justify-center"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-sakura-200 flex items-center justify-center mb-3 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 group-hover:text-sakura-500 transition-colors"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-gray-600 group-hover:text-sakura-500 transition-colors">
        {t('create')}
      </h3>
      <p className="text-sm text-gray-400 mt-1">{t('startNewProject')}</p>
    </div>
  );
}
