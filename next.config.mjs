/** @type {import('next').NextConfig} */

// The host of the storefront this cart sub-web is mounted in front of.
const STOREFRONT_ORIGIN = 'https://browse-flax.vercel.app'

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // This app is a "sub-web": it owns every route under /cart and nothing else.
  basePath: '/cart',
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
}

export default nextConfig
