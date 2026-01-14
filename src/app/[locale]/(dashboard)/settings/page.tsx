/**
 * Settings Page
 *
 * Placeholder for application settings
 */

'use client';

import { useTranslations } from 'next-intl';
import { Palette, Globe, Database, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';

export default function SettingsPage() {
  const t = useTranslations('common');

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('settings')}
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Configure your application preferences
        </p>
      </div>

      {/* Language Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-sakura-100 flex items-center justify-center">
              <Globe className="h-5 w-5 text-sakura-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Language</h3>
              <p className="text-sm text-gray-500">
                Choose your preferred language
              </p>
            </div>
          </div>
          <LocaleSwitcher />
        </div>
      </div>

      {/* Appearance Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Palette className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
            <p className="text-sm text-gray-500">Customize the look and feel</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Dark mode and theme customization options will be available here.
        </p>
        <Button variant="secondary" disabled>
          Coming Soon
        </Button>
      </div>

      {/* Integrations Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Integrations
            </h3>
            <p className="text-sm text-gray-500">Connect with other services</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          GitHub, Slack, and other integrations will be available here.
        </p>
        <Button variant="secondary" disabled>
          Coming Soon
        </Button>
      </div>

      {/* Data & Privacy Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Database className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Data & Privacy
            </h3>
            <p className="text-sm text-gray-500">
              Manage your data and privacy settings
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Data export and privacy controls will be available here.
        </p>
        <Button variant="secondary" disabled>
          Coming Soon
        </Button>
      </div>
    </div>
  );
}
