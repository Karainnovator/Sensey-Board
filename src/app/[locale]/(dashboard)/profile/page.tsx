/**
 * Profile Page
 *
 * Placeholder for user profile settings
 */

'use client';

import { useTranslations } from 'next-intl';
import { User, Mail, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const t = useTranslations('common');

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t('profile')}
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-sakura-200 to-sakura-300 flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Your Profile
            </h2>
            <p className="text-sm text-gray-500">
              Update your personal information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Display Name</p>
              <p className="text-sm font-medium text-gray-900">
                Coming soon...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email Address</p>
              <p className="text-sm font-medium text-gray-900">
                Coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
            <p className="text-sm text-gray-500">
              Manage your security settings
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Password management and two-factor authentication settings will be
          available here.
        </p>
        <Button variant="secondary" disabled>
          Coming Soon
        </Button>
      </div>

      {/* Notifications Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Bell className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <p className="text-sm text-gray-500">
              Configure notification preferences
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Email and in-app notification preferences will be available here.
        </p>
        <Button variant="secondary" disabled>
          Coming Soon
        </Button>
      </div>
    </div>
  );
}
