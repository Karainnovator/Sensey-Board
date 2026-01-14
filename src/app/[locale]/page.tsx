import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Locale Root Page
 *
 * Redirects to the dashboard for the current locale.
 * The middleware will handle redirecting to login if not authenticated.
 */
export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard`);
}
