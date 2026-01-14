import type { ReactNode } from 'react';

/**
 * Auth Layout
 *
 * Beautiful gradient background with decorative elements
 * for authentication pages (login, register, etc.)
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sakura-50 via-white to-sakura-100 px-5 py-10 relative overflow-hidden">
      {/* Decorative gradient circles */}
      <div className="fixed top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-gradient-radial from-sakura-200/50 to-transparent pointer-events-none" />
      <div className="fixed bottom-[-50px] left-[-50px] w-[200px] h-[200px] rounded-full bg-gradient-radial from-sakura-100/50 to-transparent pointer-events-none" />

      {/* Main content */}
      <div className="w-full max-w-[440px] relative z-10">{children}</div>

      {/* Brand badge */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-gray-400">
        Powered by <span className="font-semibold text-gray-600">Sensey</span>
      </div>
    </div>
  );
}
