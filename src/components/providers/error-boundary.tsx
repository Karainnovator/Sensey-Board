'use client';

/**
 * Error Boundary Component
 *
 * Catches React errors and displays a fallback UI
 * Follows WCAG 2.1 AA guidelines
 */

import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Default Error Fallback UI
 */
function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
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
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. Please try refreshing the page or
            contact support if the problem persists.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
            <p className="mb-2 text-xs font-medium text-destructive">
              Error Details (Development Only):
            </p>
            <pre className="overflow-auto text-xs text-muted-foreground">
              {error.message}
            </pre>
            {error.stack && (
              <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            onClick={resetError}
            variant="default"
            className="gap-2"
            aria-label="Try again"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            className="gap-2"
            aria-label="Go to home page"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Error Boundary Class Component
 * Must be a class component as error boundaries require componentDidCatch
 */
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to an error tracking service
    // Example: Sentry, LogRocket, etc.
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary, DefaultErrorFallback };
