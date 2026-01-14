'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import {
  Bold,
  Italic,
  Link2,
  Eye,
  Pencil,
  Paperclip,
  Upload,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UploadResult {
  url: string;
  isImage: boolean;
  filename: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onFileUpload?: (file: File) => Promise<UploadResult>;
  /** @deprecated Use onFileUpload instead */
  onImageUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
}

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // Step 1: Extract images and links first (to protect URLs from underscore processing)
  const placeholders: string[] = [];
  let text = markdown;

  // Extract images: ![alt](url) - use markers that won't be caught by markdown
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    const placeholder = `<<<IMG${placeholders.length}>>>`;
    const escapedAlt = (alt as string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    placeholders.push(
      `<img src="${url}" alt="${escapedAlt}" class="max-w-full rounded-md my-2" />`
    );
    return placeholder;
  });

  // Extract links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, linkText, url) => {
    const placeholder = `<<<LINK${placeholders.length}>>>`;
    const escapedText = (linkText as string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    placeholders.push(
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-sakura-500 hover:underline">${escapedText}</a>`
    );
    return placeholder;
  });

  // Step 2: Escape HTML in remaining text
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Step 3: Apply text formatting (now safe - URLs are protected)
  const html = text
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br />')
    // Step 4: Restore images and links (match escaped angle brackets)
    .replace(
      /&lt;&lt;&lt;IMG(\d+)&gt;&gt;&gt;/g,
      (match, index) => placeholders[parseInt(index)] ?? match
    )
    .replace(
      /&lt;&lt;&lt;LINK(\d+)&gt;&gt;&gt;/g,
      (match, index) => placeholders[parseInt(index)] ?? match
    );

  return html;
}

// Compress image before upload (skip SVG and GIF)
async function compressImage(
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<File> {
  // Don't compress SVG or GIF - they don't benefit from canvas compression
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

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

        // Determine output type based on original (PNG stays PNG for transparency)
        const outputType =
          file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const ext = outputType === 'image/png' ? '.png' : '.jpg';
        const baseName = file.name.replace(/\.[^/.]+$/, '');

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], baseName + ext, { type: outputType }));
            } else {
              resolve(file);
            }
          },
          outputType,
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
  onFileUpload,
  onImageUpload,
  disabled = false,
}: MarkdownEditorProps) {
  const t = useTranslations('ticket.markdown');
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Support both new and legacy upload handlers
  const hasUploadHandler = onFileUpload || onImageUpload;

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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // Core upload function used by both file input and drag & drop
  const uploadFile = useCallback(
    async (file: File) => {
      if (!hasUploadHandler) return;

      setIsUploading(true);
      try {
        let result: UploadResult;

        if (onFileUpload) {
          // Use new file upload handler
          const isImage = file.type.startsWith('image/');
          const processedFile = isImage ? await compressImage(file) : file;
          result = await onFileUpload(processedFile);
        } else if (onImageUpload) {
          // Legacy: only images supported
          if (!file.type.startsWith('image/')) {
            console.warn('Only images are supported with onImageUpload');
            return;
          }
          const compressedFile = await compressImage(file);
          const url = await onImageUpload(compressedFile);
          result = { url, isImage: true, filename: file.name };
        } else {
          return;
        }

        // Insert markdown - image or link
        const textarea = textareaRef.current;
        const cursorPos = textarea?.selectionStart || value.length;
        const markdown = result.isImage
          ? `\n![${result.filename}](${result.url})\n`
          : `\n[📎 ${result.filename}](${result.url})\n`;

        const newValue =
          value.substring(0, cursorPos) + markdown + value.substring(cursorPos);
        onChange(newValue);
      } catch (error) {
        console.error('File upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [hasUploadHandler, onFileUpload, onImageUpload, value, onChange]
  );

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (!hasUploadHandler || disabled) return;

      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await uploadFile(file);
      }
    },
    [hasUploadHandler, disabled, uploadFile]
  );

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-md border border-input focus-within:border-sakura-400 focus-within:ring-0',
        isDragging && 'border-sakura-400 border-2 bg-sakura-50',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-sakura-50/90">
          <div className="flex flex-col items-center gap-2 text-sakura-600">
            <Upload className="h-8 w-8" />
            <span className="text-sm font-medium">{t('dropFiles')}</span>
          </div>
        </div>
      )}

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
          {hasUploadHandler && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleFileClick}
                disabled={disabled || isPreview || isUploading}
                title={t('uploadFile')}
              >
                <Paperclip
                  className={cn('h-4 w-4', isUploading && 'animate-pulse')}
                />
              </Button>
            </>
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
          className="flex-1 resize-none bg-transparent p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        />
      )}

      {/* Hidden file input for file upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
