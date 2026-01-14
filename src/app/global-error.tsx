'use client';

/**
 * Global Error Page
 * Catches errors in the root layout
 * Note: Cannot use next-intl here as this catches errors before locale context is available
 */

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          className="flex min-h-screen items-center justify-center bg-gray-50 p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-full max-w-md space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <AlertTriangle
                  className="h-12 w-12 text-red-600"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Application Error
              </h1>
              <p className="text-sm text-gray-600">
                A critical error occurred. Please refresh the page to continue.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-left">
                <p className="mb-2 text-xs font-medium text-red-600">
                  Error Details (Development Only):
                </p>
                <pre className="overflow-auto text-xs text-gray-700">
                  {error.message}
                </pre>
              </div>
            )}

            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              aria-label="Try again"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
