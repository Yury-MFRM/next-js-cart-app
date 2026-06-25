import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const VISITOR_COOKIE = 'visitor_id'
const CART_ITEMS_COOKIE = 'cart_items'
const DEFAULT_CART_ITEMS = 'headphones,sneakers,watch,backpack'

/**
 * Edge proxy that runs in front of the /cart sub-web.
 *
 * Responsibilities:
 *  1. Assign every visitor a stable, unique `visitor_id` cookie.
 *  2. Expose the user-facing URL (the CDN / Cloudflare host sitting in front of
 *     this app) to the application via the `x-cdn-url` request header. Server
 *     components read it to build absolute links to product pages/images.
 *  3. Seed a default `cart_items` cookie so the cart has something to render.
 */
export function proxy(request: NextRequest) {
  // Forward the original request headers, augmented with the resolved
  // user-facing origin so Server Components can read it via `headers()`.
  const requestHeaders = new Headers(request.headers)

  // When deployed behind Cloudflare, the public host/proto arrive as
  // x-forwarded-* headers. Fall back to the request URL for local dev.
  const forwardedHost =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    request.nextUrl.host
  const forwardedProto =
    request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')

  const cdnOrigin = `${forwardedProto}://${forwardedHost}`
  requestHeaders.set('x-cdn-url', cdnOrigin)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // 1. Unique visitor id.
  if (!request.cookies.get(VISITOR_COOKIE)) {
    response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  // 3. Default products in the cart.
  if (!request.cookies.get(CART_ITEMS_COOKIE)) {
    response.cookies.set(CART_ITEMS_COOKIE, DEFAULT_CART_ITEMS, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })
  }

  return response
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
