/** The basePath this sub-web is mounted at (kept in sync with next.config). */
export const BASE_PATH = '/cart'

/** Builds a path to a static asset under `public/` (includes the basePath prefix). */
export function assetPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${BASE_PATH}${normalized}`
}
