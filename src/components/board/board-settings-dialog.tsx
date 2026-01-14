'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Settings, Users, FolderTree } from 'lucide-react';
import { BoardMembersList } from './board-members-list';
import { BoardHierarchy } from './board-hierarchy';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface Board {
  id: string;
  name: string;
  description?: string | null;
  color: string;
}

interface BoardSettingsDialogProps {
  boardId: string;
  board: Board;
  children: React.ReactNode;
  currentUserRole?: string;
}

const COLOR_OPTIONS = [
  { name: 'Sakura', value: '#FFB7C5', class: 'bg-[#FFB7C5]' },
  { name: 'Purple', value: '#C4B5FD', class: 'bg-[#C4B5FD]' },
  { name: 'Blue', value: '#93C5FD', class: 'bg-[#93C5FD]' },
  { name: 'Green', value: '#86EFAC', class: 'bg-[#86EFAC]' },
  { name: 'Yellow', value: '#FDE047', class: 'bg-[#FDE047]' },
  { name: 'Orange', value: '#FDBA74', class: 'bg-[#FDBA74]' },
];

export function BoardSettingsDialog({
  boardId,
  board,
  children,
  currentUserRole,
}: BoardSettingsDialogProps) {
  const t = useTranslations();
  const router = useRouter();
  const utils = trpc.useUtils();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description || '');
  const [selectedColor, setSelectedColor] = useState(board.color);

  const updateBoard = trpc.board.update.useMutation({
    onSuccess: () => {
      utils.board.invalidate();
      setOpen(false);
    },
    onError: (error) => {
      alert('Failed to update board: ' + error.message);
    },
  });

  const deleteBoard = trpc.board.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      alert('Failed to delete board: ' + error.message);
    },
  });

  const handleSave = async () => {
    updateBoard.mutate({
      id: boardId,
      name: name.trim(),
      description: description.trim() || undefined,
      color: selectedColor,
    });
  };

  const handleDelete = async () => {
    if (!confirm(t('board.settings.deleteConfirmMessage'))) {
      return;
    }

    deleteBoard.mutate({ id: boardId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('board.settings.title')}</DialogTitle>
          <DialogDescription>
            {t('board.settings.description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              {t('board.settings.tabs.general')}
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              {t('board.settings.tabs.members')}
            </TabsTrigger>
            <TabsTrigger value="subboards" className="gap-2">
              <FolderTree className="h-4 w-4" />
              {t('board.settings.tabs.subBoards')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 py-4">
            {/* Board Name */}
            <div className="space-y-2">
              <Label htmlFor="board-name">
                {t('board.settings.boardName')}
              </Label>
              <Input
                id="board-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('board.settings.boardNamePlaceholder')}
                className="w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="board-description">
                {t('board.settings.descriptionLabel')}
              </Label>
              <Input
                id="board-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('board.settings.descriptionPlaceholder')}
                className="w-full"
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>{t('board.settings.boardColor')}</Label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`h-10 w-10 rounded-md border-2 transition-all ${color.class} ${
                      selectedColor === color.value
                        ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    aria-label={`Select ${color.name} color`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h4 className="text-sm font-semibold text-red-900">
                  {t('board.settings.dangerZone')}
                </h4>
                <p className="mt-1 text-xs text-red-700">
                  {t('board.settings.deleteWarning')}
                </p>
                <Button
                  variant="destructive"
                  className="mt-3 gap-2 min-h-[44px]"
                  onClick={handleDelete}
                  disabled={deleteBoard.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>
                    {deleteBoard.isPending
                      ? t('board.settings.deleting')
                      : t('board.settings.deleteButton')}
                  </span>
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={updateBoard.isPending}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name.trim() || updateBoard.isPending}
              >
                {updateBoard.isPending
                  ? t('common.saving')
                  : t('board.settings.saveChanges')}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="members" className="py-4">
            <BoardMembersList
              boardId={boardId}
              currentUserRole={currentUserRole}
            />
          </TabsContent>

          <TabsContent value="subboards" className="py-4">
            <BoardHierarchy boardId={boardId} showAlways />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
