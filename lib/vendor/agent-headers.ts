import { NextRequest, userAgent } from "next/server";
import { buildInfoString } from '@/lib/build-info'
// // @ts-expect-error No type librarry for request-ip
// import { getClientIp } from "request-ip";

/**
 * Set own headers for the request standard way for backward compatibility.
 * @param request
 *   //https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 *   //https://stackoverflow.com/questions/59494037/how-to-detect-the-device-on-react-ssr-app-with-next-js
 *   // https://www.npmjs.com/package/request-ip
 */
export const REAL_IP = "true-client-ip"; // Cloudflare, value for "x-real-ip" Vercel
export const FORWARDED_HOST = "forwarded-host"; // Cloudflare, value for "x-forwarded-host" Vercel
export function setupHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  const agent = userAgent(request);
  headers.set("x-url", request.url);
  headers.set("x-0-pathname", request.nextUrl.pathname);
  headers.set(
    "x-0-query-search",
    new URLSearchParams(request.nextUrl.searchParams).toString(),
  );

  headers.set(
    "x-0-is-smartphone",
    (
      agent.device.type === "mobile" || process.env.IS_SMARTPHONE! === "true"
    ).toString(),
  );
  headers.set(
    "x-0-is-tablet",
    (
      agent.device.type === "tablet" || process.env.IS_TABLET! === "true"
    ).toString(),
  );
  headers.set("x-0-browser", agent.browser.name || process.env.BROWSER!);
  headers.set(
    "x-0-is-ios",
    (
      agent.device.vendor === "Apple" || process.env.IS_IOS! === "true"
    ).toString(),
  );
  headers.set(
    "x-0-is-android",
    (
      agent.device.vendor === "Android" || process.env.IS_ANDROID! === "true"
    ).toString(),
  );
   
  // Try Cloud Flare first then backoff to Vercel, then fall back to standard
  const clientIp =
    headers.get(REAL_IP) ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for");
  if (clientIp) {
    headers.set("x-0-client-ip", clientIp);
  } else {
    console.error("No client ip found in headers");
  }
  const requestId = headers.get("x-request-id");

  if (requestId) {
    console.log("Dubling request id", requestId);
    headers.set("x-0-request-id", requestId);
  } else {
    console.warn("No request id found in headers", headers);
    // headers.set("x-request-id", headers.get("x-vercel-id") || requestId || "");
  }

  console.log("requestId", requestId);
  headers.set("x-0-version", buildInfoString);
  // Special header from CDN to get the original host name.
  // BUG #142760: Vercel does not allow overwriting the forwarded-host, will use fallback value
  headers.set(
    "x-0-forwarded-host",
    headers.get(FORWARDED_HOST) || headers.get("x-forwarded-host") || "",
  );
  /**
  if(!headers.get("x-forwarded-port") && headers.get("x-forwarded-host")) {
    console.log("NOT Setting x-forwarded-proto from x-forwarded-host", headers.get("x-forwarded-host"));
    // headers.set(
    //   "x-forwarded-proto",
    //   headers.get("x-forwarded-port") == "443" ? "https" : "http",
    // );
  }
  */
  return headers;
}
