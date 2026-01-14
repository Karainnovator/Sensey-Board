import type { ReactNode } from 'react';

/**
 * Root Layout
 *
 * Minimal root layout - all main layout logic is in [locale]/layout.tsx
 * This exists only to satisfy Next.js requirements.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
