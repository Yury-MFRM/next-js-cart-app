import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { headersMap } from './lib/server-context';
import { setupHeaders } from './lib/vendor/agent-headers';
import { setupGeoHeaders } from './lib/vendor/geo-headers';

const VISITOR_COOKIE = 'visitor_id'
const USE_DEBUG_COOKIE = 'use_debug'
/**
 * Edge proxy that runs in front of the /cart sub-web.
 *
 * Responsibilities:
 *  1. Assign every visitor a stable, unique `visitor_id` cookie, making it
 *     available to the CURRENT request (not just the next one).
 *  2. Expose the user-facing URL (the CDN / Cloudflare host sitting in front of
 *     this app) to the application via the `x-cdn-url` request header. Server
 *     components read it to build absolute links to product pages/images.
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const requestHeaders = setupGeoHeaders(setupHeaders(request), false);

  const isDebug = request.cookies.get(USE_DEBUG_COOKIE)?.value == "true";
  isDebug &&
      console.debug(
        "Checking url",
        requestHeaders.get("forwarded-host"),
        url,
        headersMap(requestHeaders)
      );

  // Forward the original request headers, augmented with the resolved
  // user-facing origin so Server Components can read it via `headers()`.

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

  // 1. Unique visitor id. If the visitor doesn't have one yet, generate it and
  // inject it into the FORWARDED request cookies. This makes the id readable via
  // `cookies()` during this same request (i.e. available for processing now),
  // instead of only on the visitor's next request.
  const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value
  const visitorId = existingVisitorId ?? crypto.randomUUID()
  const requestId = requestHeaders.get("x-request-id");

  if (!existingVisitorId) {
    request.cookies.set(VISITOR_COOKIE, visitorId)
    requestHeaders.set('cookie', request.cookies.toString())
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Persist the id on the browser for subsequent requests.
  if (!existingVisitorId) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  if (
    requestId &&
    (url.pathname.includes("/error") || response.status >= 400)
  ) {
    response.cookies.set("x-request-id", requestId);
  }

  return response
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
