'use client';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Shield, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { InviteGuestDialog } from './invite-guest-dialog';
import { useTranslations } from 'next-intl';

interface BoardMembersListProps {
  boardId: string;
  currentUserRole?: string;
}

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: Edit,
  VIEWER: Eye,
};

const roleColors = {
  OWNER: 'bg-amber-100 text-amber-800',
  ADMIN: 'bg-purple-100 text-purple-800',
  MEMBER: 'bg-blue-100 text-blue-800',
  VIEWER: 'bg-gray-100 text-gray-800',
};

export function BoardMembersList({
  boardId,
  currentUserRole,
}: BoardMembersListProps) {
  const t = useTranslations();
  const [inviteOpen, setInviteOpen] = useState(false);
  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  const { data: members, isLoading } = trpc.invitation.getBoardGuests.useQuery({
    boardId,
  });
  const utils = trpc.useUtils();

  const removeMutation = trpc.invitation.removeGuest.useMutation({
    onSuccess: () => {
      utils.invitation.getBoardGuests.invalidate({ boardId });
    },
  });

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500">{t('board.members.loading')}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">
          {t('board.members.title')}
        </h3>
        {canManage && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInviteOpen(true)}
            className="gap-1"
          >
            <UserPlus className="h-4 w-4" />
            {t('guest.invite')}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {members?.map((member) => {
          const RoleIcon =
            roleIcons[member.role as keyof typeof roleIcons] ?? Eye;
          const roleColor =
            roleColors[member.role as keyof typeof roleColors] ??
            roleColors.VIEWER;

          return (
            <div
              key={member.userId}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user.avatar ?? undefined} />
                  <AvatarFallback>
                    {member.user.name?.charAt(0) ??
                      member.user.email?.charAt(0) ??
                      '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">
                    {member.user.name ?? member.user.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {member.user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={roleColor}>
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {member.role}
                </Badge>
                {canManage && member.role !== 'OWNER' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    onClick={() =>
                      removeMutation.mutate({ boardId, userId: member.userId })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <InviteGuestDialog
        boardId={boardId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
      />
    </div>
  );
}
