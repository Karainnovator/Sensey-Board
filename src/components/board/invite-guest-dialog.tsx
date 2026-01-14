'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Eye, Edit } from 'lucide-react';

interface InviteGuestDialogProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteGuestDialog({
  boardId,
  open,
  onOpenChange,
}: InviteGuestDialogProps) {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'VIEWER' | 'MEMBER'>('VIEWER');
  const [error, setError] = useState('');

  const utils = trpc.useUtils();

  const inviteMutation = trpc.invitation.inviteGuest.useMutation({
    onSuccess: () => {
      utils.invitation.getBoardGuests.invalidate({ boardId });
      setEmail('');
      setRole('VIEWER');
      setError('');
      onOpenChange(false);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    inviteMutation.mutate({ boardId, email, role });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-sakura-500" />
            {t('guest.invite')}
          </DialogTitle>
          <DialogDescription>{t('guest.inviteDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-error-light border border-error/20 rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('guest.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('guest.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('guest.role')}</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as 'VIEWER' | 'MEMBER')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{t('guest.viewer')}</div>
                      <div className="text-xs text-gray-500">
                        {t('guest.viewerDesc')}
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="MEMBER">
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{t('guest.member')}</div>
                      <div className="text-xs text-gray-500">
                        {t('guest.memberDesc')}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending
                ? t('common.loading')
                : t('guest.sendInvite')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
