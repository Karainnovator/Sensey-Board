'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams, useParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Login Page Content
 *
 * Beautiful login page with Sakura Pink theme.
 * Supports both Azure AD SSO and development credentials.
 */
function LoginContent() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const callbackUrl = searchParams.get('callbackUrl') ?? `/${locale}/dashboard`;
  const error = searchParams.get('error');
  const isDev = process.env.NODE_ENV === 'development';

  const [email, setEmail] = useState('demo@sensey.dev');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);

  const handleAzureSignIn = () => {
    signIn('azure-ad', { callbackUrl });
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn('credentials', { email, password, callbackUrl });
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-12 animate-fade-in">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-[72px] h-[72px] bg-gradient-to-br from-sakura-200 to-sakura-300 rounded-[20px] flex items-center justify-center">
          <span className="text-4xl">🌸</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          {t('welcome')}
        </h1>
        <p className="text-base text-gray-500">{t('signInToManage')}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-error-light border border-error/20 rounded-xl text-error text-sm">
          {error === 'OAuthSignin' &&
            'Azure AD not configured. Use development login.'}
          {error === 'CredentialsSignin' && t('invalidCredentials')}
          {!['OAuthSignin', 'CredentialsSignin'].includes(error) &&
            `Error: ${error}`}
        </div>
      )}

      {/* Microsoft SSO Button */}
      <button
        onClick={handleAzureSignIn}
        className="w-full bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
          <rect width="9" height="9" fill="#F25022" />
          <rect x="11" width="9" height="9" fill="#7FBA00" />
          <rect y="11" width="9" height="9" fill="#00A4EF" />
          <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
        </svg>
        {t('signInWithMicrosoft')}
      </button>

      {/* Development Login */}
      {isDev && (
        <>
          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleCredentialsSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                {t('password')}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base"
            >
              {isLoading ? `${t('signIn')}...` : t('signIn')}
            </Button>
          </form>
        </>
      )}

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <a href="#" className="text-sakura-500 font-medium hover:underline">
            Contact your admin
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Login Page with Suspense boundary
 */
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-3xl shadow-xl p-12 animate-pulse">
          {/* Logo skeleton */}
          <div className="flex justify-center mb-6">
            <div className="w-[72px] h-[72px] bg-gray-200 rounded-[20px]" />
          </div>
          {/* Text skeletons */}
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2" />
            <div className="h-5 bg-gray-100 rounded w-64 mx-auto" />
          </div>
          {/* Button skeleton */}
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
