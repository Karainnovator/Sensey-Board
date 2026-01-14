import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { SessionProvider } from '@/components/providers/session-provider';
import { TRPCProvider } from '@/lib/trpc';
import { SkipToContent } from '@/components/shared/skip-to-content';
import { notFound } from 'next/navigation';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Sensey Board',
  description:
    'Modern project management tool inspired by Notion and Jira simplicity',
};

// Valid locales
const locales = ['en', 'nl', 'tr'] as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for this locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SkipToContent />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
