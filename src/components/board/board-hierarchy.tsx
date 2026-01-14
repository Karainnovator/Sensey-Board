/**
 * Board Hierarchy Component
 *
 * Displays board hierarchy navigation (parent and child boards)
 * Shows breadcrumb navigation for parent boards
 * Shows list of child boards with quick access
 */

'use client';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Plus, FolderTree } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CreateBoardDialog } from './create-board-dialog';
import { useLocale, useTranslations } from 'next-intl';

interface BoardHierarchyProps {
  boardId: string;
}

export function BoardHierarchy({ boardId }: BoardHierarchyProps) {
  const locale = useLocale();
  const t = useTranslations();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: hierarchy } = trpc.board.getHierarchy.useQuery({ boardId });
  const { data: ancestors } = trpc.board.getAncestors.useQuery({ boardId });

  if (!hierarchy) return null;

  const hasHierarchy =
    hierarchy.parentBoard ||
    (hierarchy.childBoards && hierarchy.childBoards.length > 0);

  if (!hasHierarchy) return null;

  return (
    <div className="border rounded-lg p-4 bg-white space-y-4">
      {/* Breadcrumb */}
      {ancestors && ancestors.length > 0 && (
        <div className="flex items-center gap-1 text-sm">
          <FolderTree className="h-4 w-4 text-gray-400 mr-1" />
          {ancestors.map((ancestor) => (
            <span key={ancestor.id} className="flex items-center">
              <Link
                href={`/${locale}/board/${ancestor.id}`}
                className="hover:text-[#FFB7C5] transition-colors"
                style={{ color: ancestor.color }}
              >
                {ancestor.name}
              </Link>
              <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />
            </span>
          ))}
          <span className="font-medium" style={{ color: hierarchy.color }}>
            {hierarchy.name}
          </span>
        </div>
      )}

      {/* Parent Board */}
      {hierarchy.parentBoard && !ancestors?.length && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('board.parent')}:</span>
          <Link
            href={`/${locale}/board/${hierarchy.parentBoard.id}`}
            className="inline-flex items-center gap-1 text-sm hover:underline"
            style={{ color: hierarchy.parentBoard.color }}
          >
            <Badge
              variant="outline"
              style={{ borderColor: hierarchy.parentBoard.color }}
            >
              {hierarchy.parentBoard.prefix}
            </Badge>
            {hierarchy.parentBoard.name}
          </Link>
        </div>
      )}

      {/* Child Boards */}
      {hierarchy.childBoards && hierarchy.childBoards.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {t('board.childBoards')}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCreateOpen(true)}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              {t('board.addChild')}
            </Button>
          </div>
          <div className="grid gap-2">
            {hierarchy.childBoards.map((child) => (
              <Link
                key={child.id}
                href={`/${locale}/board/${child.id}`}
                className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: child.color }}
                  />
                  <span className="font-medium">{child.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {child.prefix}
                  </Badge>
                </div>
                <span className="text-sm text-gray-500">
                  {child._count.tickets} {t('ticket.tickets')}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Create Child Board Dialog */}
      <CreateBoardDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        parentBoardId={boardId}
      />
    </div>
  );
}
