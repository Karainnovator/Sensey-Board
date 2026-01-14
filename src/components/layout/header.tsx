/**
 * Header Component
 *
 * Top navigation bar with logo, breadcrumb, locale switcher, and user dropdown
 * Matches the Sensey Board design system
 */

'use client';

import { Link } from '@/i18n/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  User,
  Search,
} from 'lucide-react';
import { LocaleSwitcher } from './locale-switcher';
import { signOut } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    avatar?: string | null;
  };
  breadcrumbs?: BreadcrumbItem[];
}

export function Header({ user, breadcrumbs }: HeaderProps) {
  const locale = useLocale();
  const t = useTranslations('common');
  const userInitials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';

  const handleLogout = async () => {
    await signOut({ callbackUrl: `/${locale}/login` });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
      <div className="flex h-14 items-center justify-between px-6">
        {/* Logo + Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-sakura-200 to-sakura-300 rounded-lg flex items-center justify-center">
              <span className="text-base">🌸</span>
            </div>
            <span className="text-base font-bold text-gray-900 hidden sm:block">
              Sensey
            </span>
          </Link>

          {/* Breadcrumb Navigation */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-sm ml-2"
            >
              <ChevronRight className="h-4 w-4 text-gray-300" />
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-1">
                  {crumb.href ? (
                    <Link
                      href={crumb.href as '/dashboard'}
                      className="text-gray-500 hover:text-sakura-500 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-gray-900">
                      {crumb.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Locale Switcher */}
          <LocaleSwitcher />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors duration-150 ml-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.avatar || undefined} alt={userName} />
                  <AvatarFallback className="rounded-lg bg-sakura-200 text-sakura-500 text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {userName.split(' ')[0]}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-2 rounded-xl shadow-xl border border-gray-100"
            >
              <DropdownMenuLabel className="px-3 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                asChild
                className="px-3 py-2.5 rounded-lg cursor-pointer"
              >
                <Link href="/profile">
                  <User className="mr-3 h-4 w-4 text-gray-500" />
                  <span>{t('profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="px-3 py-2.5 rounded-lg cursor-pointer"
              >
                <Link href="/settings">
                  <Settings className="mr-3 h-4 w-4 text-gray-500" />
                  <span>{t('settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="px-3 py-2.5 rounded-lg cursor-pointer text-error hover:text-error hover:bg-error-light focus:text-error"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>{t('logOut')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
