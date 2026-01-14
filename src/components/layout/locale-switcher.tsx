/**
 * Locale Switcher Component
 *
 * Dropdown menu for switching between available languages (EN, NL, TR)
 */

'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, Check, Loader2 } from 'lucide-react';

const locales = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    // Store preference in cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    // Use startTransition for smoother locale switching
    startTransition(() => {
      router.replace(pathname, { locale: newLocale as 'en' | 'nl' | 'tr' });
    });
  };

  const currentLocale = locales.find((l) => l.code === locale);
  if (!currentLocale) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Globe className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[160px] p-1.5 rounded-xl shadow-xl border border-gray-100"
      >
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => handleLocaleChange(loc.code)}
            className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between my-0.5 focus:bg-gray-100 ${
              locale === loc.code
                ? 'bg-sakura-50 text-sakura-600 focus:bg-sakura-100'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{loc.flag}</span>
              <span className="font-medium">{loc.name}</span>
            </div>
            {locale === loc.code && (
              <Check className="h-4 w-4 text-sakura-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
