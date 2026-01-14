/**
 * Create Board Dialog Component
 *
 * Modal dialog for creating a new board
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentBoardId?: string;
  showParentSelector?: boolean;
}

// Predefined color options
const BOARD_COLORS = [
  { name: 'Sakura', value: '#FFB7C5' },
  { name: 'Purple', value: '#C084FC' },
  { name: 'Blue', value: '#60A5FA' },
  { name: 'Green', value: '#4ADE80' },
  { name: 'Yellow', value: '#FBBF24' },
  { name: 'Gray', value: '#9CA3AF' },
];

export function CreateBoardDialog({
  open,
  onOpenChange,
  parentBoardId,
  showParentSelector = false,
}: CreateBoardDialogProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prefix, setPrefix] = useState('');
  const [selectedColor, setSelectedColor] = useState(
    BOARD_COLORS[0]?.value || '#FFB7C5'
  );
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(
    parentBoardId
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch boards for parent selector
  const { data: boards } = trpc.board.getAll.useQuery(undefined, {
    enabled: showParentSelector && open,
  });

  const createBoard = trpc.board.create.useMutation({
    onSuccess: (data) => {
      // Reset form
      setName('');
      setDescription('');
      setPrefix('');
      setSelectedColor(BOARD_COLORS[0]?.value || '#FFB7C5');
      setErrors({});

      // Close dialog
      onOpenChange(false);

      // Navigate to board or refresh
      router.push(`/${locale}/board/${data.id}`);
    },
    onError: (error) => {
      console.error('Failed to create board:', error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = t('board.nameRequired');
    }

    if (!prefix.trim()) {
      newErrors.prefix = t('board.prefixRequired');
    } else if (!/^[A-Z]+$/.test(prefix)) {
      newErrors.prefix = t('board.prefixUppercase');
    } else if (prefix.length > 5) {
      newErrors.prefix = t('board.prefixTooLong');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    createBoard.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      prefix: prefix.toUpperCase(),
      color: selectedColor,
      parentBoardId: selectedParentId || parentBoardId,
    });
  };

  const handleClose = () => {
    if (!createBoard.isPending) {
      setName('');
      setDescription('');
      setPrefix('');
      setSelectedColor(BOARD_COLORS[0]?.value || '#FFB7C5');
      setSelectedParentId(parentBoardId);
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {parentBoardId ? t('board.createChild') : t('board.createNew')}
            </DialogTitle>
            <DialogDescription>
              {parentBoardId
                ? t('board.createChildDescription')
                : t('board.createNewDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Board Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('board.name')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder={t('board.namePlaceholder')}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: '' });
                  }
                }}
                disabled={createBoard.isPending}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Prefix */}
            <div className="space-y-2">
              <Label htmlFor="prefix">
                {t('board.prefix')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prefix"
                placeholder={t('board.prefixPlaceholder')}
                value={prefix}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setPrefix(value);
                  if (errors.prefix) {
                    setErrors({ ...errors, prefix: '' });
                  }
                }}
                maxLength={5}
                disabled={createBoard.isPending}
                className={errors.prefix ? 'border-destructive' : ''}
              />
              {errors.prefix && (
                <p className="text-sm text-destructive">{errors.prefix}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {t('board.prefixHelper')}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('board.description')}</Label>
              <textarea
                id="description"
                placeholder={t('board.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createBoard.isPending}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>

            {/* Parent Board Selector */}
            {showParentSelector && boards && (
              <div className="space-y-2">
                <Label htmlFor="parent-board">{t('board.parent')}</Label>
                <Select
                  value={selectedParentId || 'none'}
                  onValueChange={(value) =>
                    setSelectedParentId(value === 'none' ? undefined : value)
                  }
                  disabled={createBoard.isPending}
                >
                  <SelectTrigger id="parent-board">
                    <SelectValue placeholder={t('board.selectParent')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">
                        {t('board.noParent')}
                      </span>
                    </SelectItem>
                    {boards.map((board) => (
                      <SelectItem key={board.id} value={board.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: board.color }}
                          />
                          <span>{board.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({board.prefix})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Board Color */}
            <div className="space-y-2">
              <Label>{t('board.color')}</Label>
              <div className="flex gap-2">
                {BOARD_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    disabled={createBoard.isPending}
                    className="group relative flex flex-col items-center gap-1"
                  >
                    <div
                      className={`h-12 w-12 rounded-lg transition-all ${
                        selectedColor === color.value
                          ? 'ring-2 ring-primary ring-offset-2 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {color.name}
                    </span>
                    {selectedColor === color.value && (
                      <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={createBoard.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={createBoard.isPending}>
              {createBoard.isPending ? t('common.creating') : t('board.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
