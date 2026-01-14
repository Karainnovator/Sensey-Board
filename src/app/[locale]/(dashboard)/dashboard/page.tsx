/**
 * Dashboard Page
 *
 * Main dashboard showing all user boards with stats
 */

'use client';

import { useState } from 'react';
import { BoardGrid } from '@/components/board/board-grid';
import { trpc } from '@/lib/trpc';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all boards for the current user
  const { data: boards, isLoading } = trpc.board.getAll.useQuery();

  // Filter boards based on search
  const filteredBoards =
    boards?.filter(
      (board) =>
        board.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        board.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Calculate stats
  const totalBoards = boards?.length || 0;
  const totalTickets =
    boards?.reduce((sum, board) => sum + (board._count?.tickets || 0), 0) || 0;
  const activeSprints = 0; // TODO: Fetch from API

  return (
    <div className="max-w-[1400px] mx-auto px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('title')}
        </h1>
        <p className="mt-2 text-base text-gray-500">{t('subtitle')}</p>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 min-w-[180px]">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Total Boards
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {isLoading ? '-' : totalBoards}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 min-w-[180px]">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Active Sprints
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {isLoading ? '-' : activeSprints}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 min-w-[180px]">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Open Tickets
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {isLoading ? '-' : totalTickets}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-[320px] mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search boards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11"
        />
      </div>

      {/* Board Grid */}
      <BoardGrid boards={filteredBoards} isLoading={isLoading} />
    </div>
  );
}
