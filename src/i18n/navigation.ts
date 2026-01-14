/**
 * Navigation Configuration
 *
 * Provides locale-aware navigation utilities using next-intl
 * This ensures proper locale handling when navigating between pages
 */

import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './request';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'always',
  });
