'use client';

import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/use-auth';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

/**
 * UserMenu Component
 *
 * Dropdown menu showing user info and sign out option.
 * Displays in the top-right corner of the dashboard header.
 *
 * Features:
 * - User avatar (or initials)
 * - User name and email
 * - Sign out button
 * - Follows Sensey Board design system
 */
export function UserMenu() {
  const { user, isLoading } = useAuth();
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    return;
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get user initials for avatar
  const initials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ??
    user.email?.[0]?.toUpperCase() ??
    '?';

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFB7C5] focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#FFB7C5] flex items-center justify-center text-white font-medium text-sm">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? 'User'}
              width={32}
              height={32}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* User Name */}
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {user.name ?? user.email}
        </span>

        {/* Dropdown Arrow */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user.name ?? 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            {user.role && (
              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded bg-[#FFEEF2] text-[#FFB7C5]">
                {user.role}
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Profile (placeholder for future) */}
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to profile page
              }}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {t('profile')}
              </div>
            </button>

            {/* Settings (placeholder for future) */}
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => {
                setIsOpen(false);
                // TODO: Navigate to settings page
              }}
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {t('settings')}
              </div>
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: '/login' });
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                {t('logOut')}
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
