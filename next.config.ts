import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  /* Config options here */
  reactStrictMode: true,
  poweredByHeader: false,

  typedRoutes: true,

  // Disable static generation for all routes (requires auth/db)
  output: 'standalone',

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  // Rewrite old /uploads/* URLs to API route for dynamic file serving
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
