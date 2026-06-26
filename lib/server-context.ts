import { performance } from "perf_hooks";

export const isServer = typeof window === "undefined";

export const getRequestContext = async (): Promise<{
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  warning?: string;
  timespan?: number;
}> => {
  const start = performance.now();
  if (isServer) {
    return await import("next/headers").then(async ({ headers, cookies }) => {
      try {
        const headersList = await headers();
        const cookiesList = (await cookies()).getAll();
        if (cookiesList && headersList) {
          return {
            headers: headersMap(headersList, [
              "x-request-id",
              "ecid",
              "x-server-action-name",
              "next-action",
            ]),
            cookies: cookiesMap(cookiesList, [
              "_msdyn365___cart_",
              "_msdyn365___checkout_cart_",
              "zip_code",
              "x-request-id",
              "ECID",
            ]),
            timespan: performance.now() - start,
          };
        }
        return { timespan: performance.now() - start };
      } catch (e) {
        // This error mostly, skip it to avoid pollution
        // Error: `headers` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context
        // OR
        // Error: Route /cart used "headers" inside a function cached with "unstable_cache(...)". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use "headers" outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache'
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const errorText = `${e}`;
        if (
          errorText.includes("outside a request scope") ||
          errorText.includes("inside a cache scope") ||
          errorText.includes("after()")
        )
          return {};
        return { timespan: performance.now() - start, warning: errorText };
      }
    });
  }
  if (performance.now() - start < 10) return {};
  return { timespan: performance.now() - start };
};

export const headersMap = (
  hdrs: Headers,
  keys?: string[],
): Record<string, string> => {
  const headersMap = {} as Record<string, string>;
  hdrs.forEach((v: string, k: string) => {
    if (
      ![
        "cookie",
        "x-vercel-oidc-token",
        "x-vercel-proxy-signature",
        "x-vercel-sc-headers",
        "x-vercel-sc-host",
        "x-vercel-ja4-digest",
        "forwarded",
      ].includes(k) &&
      (!keys || keys.includes(k))
    )
      headersMap[k] = v;
  });
  return headersMap;
};

export const cookiesMap = (
  cookiesList: { name: string; value?: string }[],
  keys?: string[],
): Record<string, string> => {
  return Object.fromEntries(
    cookiesList
      .filter((c) => !keys || keys.includes(c.name))
      .map((c) => [c.name, c.value?.slice(0, 100) || ""]),
  );
};
