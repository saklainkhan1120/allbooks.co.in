import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['m.media-amazon.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
      {
        source: '/:path*.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=1800, stale-while-revalidate=86400' }],
      },
      {
        source: '/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=900, stale-while-revalidate=3600' }],
      },
      {
        source: '/:bookSlug/:authorSlug/:isbn',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' }],
      },
      {
        source: '/(bestsellers|new-releases|just-listed|daily-deals|categories|authors)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=1800, stale-while-revalidate=7200' }],
      },
    ];
  },
  trailingSlash: false,
};

export default nextConfig;
