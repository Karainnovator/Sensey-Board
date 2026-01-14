/**
 * Board Grid Component
 *
 * Responsive grid layout for displaying boards
 * Enhanced with staggered animations
 */

'use client';

import { useState } from 'react';
import { BoardCard, CreateBoardCard } from './board-card';
import { CreateBoardDialog } from './create-board-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { BoardGridSkeleton } from '@/components/shared/loading-skeleton';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useTranslations } from 'next-intl';

interface BoardMember {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  };
}

interface Board {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  icon?: string | null;
  members: BoardMember[];
  _count?: {
    tickets: number;
  };
}

interface BoardGridProps {
  boards: Board[];
  isLoading?: boolean;
}

export function BoardGrid({ boards, isLoading }: BoardGridProps) {
  const t = useTranslations('board');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return <BoardGridSkeleton />;
  }

  // Empty state
  if (boards.length === 0) {
    return (
      <>
        <EmptyState
          icon={
            <>
              <span className="text-4xl">🌸</span>
              <span className="text-4xl">📋</span>
            </>
          }
          title={t('noBoards')}
          description={t('createFirst')}
          action={{
            label: t('create'),
            onClick: () => setCreateDialogOpen(true),
          }}
        />
        <CreateBoardDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          showParentSelector
        />
      </>
    );
  }

  // Board grid with create card
  return (
    <>
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Existing Boards */}
        {boards.map((board) => (
          <motion.div key={board.id} variants={staggerItem}>
            <BoardCard
              id={board.id}
              name={board.name}
              description={board.description}
              color={board.color}
              icon={board.icon}
              members={board.members}
              ticketCount={board._count?.tickets || 0}
            />
          </motion.div>
        ))}

        {/* Create New Board Card */}
        <motion.div variants={staggerItem}>
          <CreateBoardCard onClick={() => setCreateDialogOpen(true)} />
        </motion.div>
      </motion.div>

      {/* Create Board Dialog */}
      <CreateBoardDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        showParentSelector
      />
    </>
  );
}
