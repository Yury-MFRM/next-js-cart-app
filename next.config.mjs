/** @type {import('next').NextConfig} */

// The host of the storefront this cart sub-web is mounted in front of.
const STOREFRONT_ORIGIN = 'https://browse-flax.vercel.app'

const BUILD_TIME = new Date().toISOString()

const nextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIME: BUILD_TIME,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // This app is a "sub-web": it owns every route under /cart and nothing else.
  basePath: '/cart',
  // NOTE: if we need to update cached assets, we can change the URL to include a version, ex: /cart/v2/style.css.
  async headers() {
    return [
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      // `fallback` rewrites only run when a request did NOT match any route
      // owned by this app (i.e. anything that is not part of the /cart sub-web).
      // Those requests are transparently proxied to the storefront so that the
      // two zones look like a single site behind the CDN.
      fallback: [
        {
          source: '/:path*',
          destination: `${STOREFRONT_ORIGIN}/:path*`,
          // `basePath: false` keeps the source matching the raw incoming path
          // (e.g. /headphones, /products/watch.png) instead of /cart/...
          basePath: false,
        },
      ],
    }
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.vercel.app",
        "mattressfirm.com",
        "*.mattressfirm.com",
      ],
    },
  },
}

export default nextConfig
