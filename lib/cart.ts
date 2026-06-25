import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

/* -------------------------------------------------------------------------- */
/*  Products                                                                  */
/* -------------------------------------------------------------------------- */

export type ProductKey = 'headphones' | 'sneakers' | 'watch' | 'backpack'

export type Product = {
  key: ProductKey
  name: string
  price: string
  /** Relative path to the product detail page on the storefront. */
  productPath: string
  /** Relative path to the product image on the storefront. */
  imagePath: string
}

// All 4 names + relative paths are hardcoded, matching the storefront catalog
// served at https://browse-flax.vercel.app.
export const PRODUCTS: Record<ProductKey, Product> = {
  headphones: {
    key: 'headphones',
    name: 'Wireless Headphones',
    price: '$199',
    productPath: '/headphones',
    imagePath: '/products/headphones.png',
  },
  sneakers: {
    key: 'sneakers',
    name: 'Everyday Sneakers',
    price: '$120',
    productPath: '/sneakers',
    imagePath: '/products/sneakers.png',
  },
  watch: {
    key: 'watch',
    name: 'Classic Watch',
    price: '$249',
    productPath: '/watch',
    imagePath: '/products/watch.png',
  },
  backpack: {
    key: 'backpack',
    name: 'Canvas Backpack',
    price: '$89',
    productPath: '/backpack',
    imagePath: '/products/backpack.png',
  },
}

export const CART_ITEMS_COOKIE = 'cart_items'
export const DEFAULT_CART_ITEMS: ProductKey[] = [
  'headphones',
  'sneakers',
  'watch',
  'backpack',
]

/** Reads the `cart_items` cookie and resolves it to real product records. */
export async function getCartProducts(): Promise<Product[]> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(CART_ITEMS_COOKIE)?.value
  const keys = (raw ? raw.split(',') : DEFAULT_CART_ITEMS)
    .map((k) => k.trim())
    .filter((k): k is ProductKey => k in PRODUCTS)

  const unique = Array.from(new Set(keys.length ? keys : DEFAULT_CART_ITEMS))
  return unique.map((k) => PRODUCTS[k])
}

/* -------------------------------------------------------------------------- */
/*  CDN / user-facing absolute URLs                                           */
/* -------------------------------------------------------------------------- */

/**
 * The user-facing origin (the CDN / Cloudflare host in front of this app) is
 * injected by the proxy as the `x-cdn-url` request header. We use it to build
 * absolute links so product pages and images resolve through the CDN, which
 * proxies non-/cart requests back to the storefront.
 */
export async function getCdnOrigin(): Promise<string> {
  const headerStore = await headers()
  return headerStore.get('x-cdn-url') ?? ''
}

/** Builds an absolute, user-facing URL from a relative storefront path. */
export function absoluteUrl(origin: string, path: string): string {
  if (!origin) return path
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`
}

/* -------------------------------------------------------------------------- */
/*  Checkout steps + progress guard                                           */
/* -------------------------------------------------------------------------- */

export type Step = {
  /** Path relative to the /cart basePath. */
  path: string
  label: string
}

// Ordered list of checkout steps. The index is the "level" stored in the
// progress cookie.
export const STEPS: Step[] = [
  { path: '/', label: 'Cart' },
  { path: '/checkout', label: 'Checkout' },
  { path: '/payment', label: 'Payment' },
  { path: '/ordercomplete', label: 'Complete' },
]

export const PROGRESS_COOKIE = 'cart_progress'

/** Highest step index the visitor has unlocked (defaults to the cart page). */
export async function getProgress(): Promise<number> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PROGRESS_COOKIE)?.value
  const value = raw ? Number.parseInt(raw, 10) : 0
  if (Number.isNaN(value) || value < 0) return 0
  return Math.min(value, STEPS.length - 1)
}

/**
 * Guards a step page: the visitor may sit on, or go back to, any unlocked step,
 * but may never skip forward by typing a URL. If they try, send them to the
 * furthest step they have actually unlocked.
 */
export async function guardStep(stepIndex: number): Promise<number> {
  const progress = await getProgress()
  if (stepIndex > progress) {
    redirect(STEPS[progress].path)
  }
  return progress
}

/** Advances progress to at least `stepIndex` and stores it in the cookie. */
export async function advanceProgress(stepIndex: number): Promise<void> {
  const cookieStore = await cookies()
  const current = await getProgress()
  const next = Math.max(current, stepIndex)
  cookieStore.set(PROGRESS_COOKIE, String(next), {
    path: '/cart',
    httpOnly: true,
    sameSite: 'lax',
  })
}
