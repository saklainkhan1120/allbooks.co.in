/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['m.media-amazon.com'],
  },
  // Add comprehensive caching headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/:path*.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/:path*.(jpg|jpeg|png|gif|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
      // Cache API routes
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, stale-while-revalidate=86400',
          },
        ],
      },
      // Cache HTML pages
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=900, stale-while-revalidate=3600',
          },
        ],
      },
      // Special caching for book detail pages
      {
        source: '/:bookSlug/:authorSlug/:isbn',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      // Special caching for category pages
      {
        source: '/(bestsellers|new-releases|just-listed|daily-deals|categories|authors)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, stale-while-revalidate=7200',
          },
        ],
      },
    ];
  },
  // Ensure compatibility with Netlify
  trailingSlash: false,
  output: 'standalone',
};

module.exports = nextConfig;