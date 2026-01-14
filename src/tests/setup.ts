/**
 * Test Setup
 *
 * Global test setup and configuration
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, prop) => {
        return vi.fn(({ children, ...props }) => {
          // Return a simple div that forwards all props
          return {
            $$typeof: Symbol.for('react.element'),
            type: prop,
            props: { ...props, children },
          };
        });
      },
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));
