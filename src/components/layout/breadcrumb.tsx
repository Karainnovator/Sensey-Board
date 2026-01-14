'use client';

import { Link } from '@/i18n/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const t = useTranslations('common');

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>{t('boards')}</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
