/**
 * Dashboard Layout
 *
 * Layout wrapper for authenticated dashboard pages
 */

import { Header } from '@/components/layout/header';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/server/auth/config';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated (belt and suspenders with middleware)
  if (!session?.user) {
    redirect('/en/login');
  }

  const user = {
    name: session.user.name || 'User',
    email: session.user.email || '',
    avatar: session.user.image || null,
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header user={user} />
      <main className="flex-1 bg-card-background">{children}</main>
    </div>
  );
}
