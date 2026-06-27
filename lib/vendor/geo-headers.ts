import { FORWARDED_HOST } from "./agent-headers";

/**
 * Set up own geo headers for the request into standard way for backward compatibility.
 * @param request
 *   FIXME: Vercel headers are not reliable, if traffic-split on Akamai then the edge of it will be the source instead of the client
 *   // https://www.npmjs.com/package/geo2zip
 *   // https://www.npmjs.com/package/us-zips
 *   Mapping Geo property on custom header:
 *    "x-geo-{property-name}", using CDN header if set and available or use vercel with fallback (GEO of CDN edge)
 *    support env variable for local development.
 */
const GEO = {
  LATITUDE: ["cf-iplatitude", "x-vercel-ip-latitude"],
  LONGITUDE: ["cf-iplongitude", "x-vercel-ip-longitude"],
  POSTAL_CODE: ["cf-postal-code", "x-vercel-ip-postal-code"],
  COUNTRY_CODE: ["cf-ipcountry", "x-vercel-ip-country"],
  CITY: ["cf-ipcity", "x-vercel-ip-city"],
  REGION: ["cf-region-code", "x-vercel-ip-country-region"],
};
export function setupGeoHeaders(
  headers: Headers,
): Headers {
  // This is Vercel geo headers, or fallback to the edge of the CDN if not available plus local env variable
  /**
  Object.entries(GEO).forEach(([key, value]) => {
    const vercel = headers.get(value[1]);
    headers.set(geoKey(key), vercel || process.env[key] || "");
  });
  */
  return headers;
}

function geoKey(key: string): string {
  return `x-0-geo-${key.toLowerCase().replaceAll("_", "-")}`;
}
