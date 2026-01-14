'use client';

/**
 * Next.js Error Page
 * Automatically wraps page segments in an error boundary
 */

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Page error:', error);
    }
    // In production, log to error tracking service
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle
              className="h-12 w-12 text-destructive"
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('somethingWentWrong')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('unexpectedError')}
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
            <p className="mb-2 text-xs font-medium text-destructive">
              {t('errorDetails')}
            </p>
            <pre className="overflow-auto text-xs text-muted-foreground">
              {error.message}
            </pre>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="gap-2"
            aria-label={t('tryAgain')}
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            {t('tryAgain')}
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="gap-2"
            aria-label={t('goHome')}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {t('goHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
