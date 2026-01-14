'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Bold, Italic, Link2, ImagePlus, Eye, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
}

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const html = markdown
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Images: ![alt](url)
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="max-w-full rounded-md my-2" />'
    )
    // Links: [text](url)
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-sakura-500 hover:underline">$1</a>'
    )
    // Line breaks
    .replace(/\n/g, '<br />');

  return html;
}

// Compress image before upload
async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if too large
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className,
  onImageUpload,
  disabled = false,
}: MarkdownEditorProps) {
  const t = useTranslations('ticket.markdown');
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Insert text at cursor position
  const insertText = useCallback(
    (before: string, after: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newValue =
        value.substring(0, start) +
        before +
        (selectedText || 'text') +
        after +
        value.substring(end);

      onChange(newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newCursorPos =
          start + before.length + (selectedText || 'text').length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  const handleBold = () => insertText('**', '**');
  const handleItalic = () => insertText('*', '*');
  const handleLink = () => insertText('[', '](url)');

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    setIsUploading(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(file);
      const url = await onImageUpload(compressedFile);

      // Insert markdown image
      const textarea = textareaRef.current;
      const cursorPos = textarea?.selectionStart || value.length;
      const newValue =
        value.substring(0, cursorPos) +
        `\n![${file.name}](${url})\n` +
        value.substring(cursorPos);
      onChange(newValue);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className={cn('flex flex-col rounded-md border border-input', className)}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-input bg-gray-50/50 px-2 py-1">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleBold}
            disabled={disabled || isPreview}
            title={t('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleItalic}
            disabled={disabled || isPreview}
            title={t('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleLink}
            disabled={disabled || isPreview}
            title={t('link')}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          {onImageUpload && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleImageClick}
              disabled={disabled || isPreview || isUploading}
              title={t('uploadImage')}
            >
              <ImagePlus
                className={cn('h-4 w-4', isUploading && 'animate-pulse')}
              />
            </Button>
          )}
        </div>

        {/* Preview toggle */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => setIsPreview(!isPreview)}
          disabled={disabled}
        >
          {isPreview ? (
            <>
              <Pencil className="h-3 w-3" />
              {t('edit')}
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              {t('preview')}
            </>
          )}
        </Button>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div
          className="flex-1 overflow-auto p-3 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html:
              markdownToHtml(value) ||
              `<span class="text-muted-foreground">${placeholder || ''}</span>`,
          }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent p-3 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      )}

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>
  );
}
