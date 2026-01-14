import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Root Page
 *
 * Redirects to the default locale (en).
 * The middleware will handle locale detection and authentication.
 */
export default function RootPage() {
  redirect('/en');
}
