import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { BASE_PATH } from '@/lib/paths'

export { BASE_PATH, assetPath } from '@/lib/paths'

/* -------------------------------------------------------------------------- */
/*  Products                                                                  */
/* -------------------------------------------------------------------------- */

export type ProductKey = 'headphones' | 'sneakers' | 'watch' | 'backpack'

export type ProductBase = {
  key: ProductKey
  name: string
  /** Unit price in whole dollars. */
  price: number
  /** Relative path to the product detail page on the storefront. */
  productPath: string
  /** Relative path to the product image on the storefront. */
  imagePath: string
}

export type Product = ProductBase & {
  /** Quantity of this product in the cart. */
  quantity: number
}

// All 4 names + relative paths are hardcoded, matching the storefront catalog
// served at https://browse-flax.vercel.app.
export const PRODUCTS: Record<ProductKey, ProductBase> = {
  headphones: {
    key: 'headphones',
    name: 'Wireless Headphones',
    price: 199,
    productPath: '/headphones',
    imagePath: '/products/headphones.png',
  },
  sneakers: {
    key: 'sneakers',
    name: 'Everyday Sneakers',
    price: 120,
    productPath: '/sneakers',
    imagePath: '/products/sneakers.png',
  },
  watch: {
    key: 'watch',
    name: 'Classic Watch',
    price: 249,
    productPath: '/watch',
    imagePath: '/products/watch.png',
  },
  backpack: {
    key: 'backpack',
    name: 'Canvas Backpack',
    price: 89,
    productPath: '/backpack',
    imagePath: '/products/backpack.png',
  },
}

/** Formats a dollar amount, e.g. 199 -> "$199.00". */
export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`
}

const TAX_RATE = 0.08

/** Derives the order totals from the products currently in the cart. */
export function getOrderTotals(products: Product[]) {
  const count = products.reduce((sum, p) => sum + p.quantity, 0)
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
  const tax = subtotal * TAX_RATE
  const total = subtotal + tax
  return { count, subtotal, tax, total }
}

export const CART_ITEMS_COOKIE = 'cart_items'

/**
 * Reads the `cart_items` cookie and resolves it to real product records with quantities.
 *
 * Format: "name:qty,name:qty,...". If qty is omitted, defaults to 1.
 * Items with qty <= 0 are filtered out. Duplicates are deduplicated (last qty wins).
 *
 * There is intentionally NO default: the cookie is assumed to be provided by
 * the storefront. When it's missing or empty, the cart is genuinely empty and
 * we return an empty array so callers can render the empty-cart experience.
 */
export async function getCartProducts(): Promise<Product[]> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(CART_ITEMS_COOKIE)?.value
  if (!raw) return []

  const itemMap = new Map<ProductKey, number>()

  raw
    .split(',')
    .map((item) => item.trim())
    .forEach((item) => {
      const [key, qtyStr] = item.split(':')
      const cleanKey = key.trim()
      if (cleanKey in PRODUCTS) {
        const qty = qtyStr ? Number.parseInt(qtyStr, 10) : 1
        const validQty = Number.isNaN(qty) || qty <= 0 ? 1 : qty
        itemMap.set(cleanKey as ProductKey, validQty)
      }
    })

  return Array.from(itemMap.entries()).map(([key, quantity]) => ({
    ...PRODUCTS[key],
    quantity,
  }))
}

/**
 * Guard for every checkout page EXCEPT the cart itself: if the cart is empty
 * (no `cart_items` cookie), there is nothing to check out, so send the visitor
 * to /cart where the empty-cart experience is shown.
 */
export async function requireCart(): Promise<Product[]> {
  const products = await getCartProducts()
  if (products.length === 0) {
    redirect(await cartUrl('/'))
  }
  return products
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

/**
 * Builds an absolute, user-facing URL to a page INSIDE this /cart sub-web.
 *
 * We redirect to absolute URLs (rather than bare paths) on purpose: `redirect()`
 * behind the CDN/proxy can drop the basePath, leaving a bare `/checkout` that
 * the next.config `fallback` rewrite then proxies to the storefront → 404.
 * An absolute URL is never basePath-prefixed and never hits the fallback rewrite,
 * so the visitor reliably lands on `<origin>/cart/<step>`.
 *
 * `step` is relative to the basePath (e.g. "/checkout", or "/" for the cart).
 */
export async function cartUrl(step: string): Promise<string> {
  const origin = await getCdnOrigin()
  // No origin header (rare): return the bare step so redirect() prepends the
  // basePath itself — avoids a double `/cart/cart` prefix.
  if (!origin) return step
  const path = step === '/' ? BASE_PATH : `${BASE_PATH}${step}`
  return `${origin}${path}`
}

/* -------------------------------------------------------------------------- */
/*  Checkout steps + progress guard                                           */
/* -------------------------------------------------------------------------- */

export type Step = {
  /** Path relative to the /cart basePath. */
  path: string
  label: string
}

// Ordered list of checkout steps shown in the stepper. The index is the "level"
// stored in the progress cookie. `ordercomplete` is intentionally NOT a step —
// it's a terminal page (level 3) with no stepper, only a link home.
export const STEPS: Step[] = [
  { path: '/', label: 'Cart' },
  { path: '/checkout', label: 'Checkout' },
  { path: '/payment', label: 'Payment' },
]

/** Level of the terminal order-complete page (one beyond the last stepper step). */
export const ORDER_COMPLETE_LEVEL = STEPS.length // 3

export const PROGRESS_COOKIE = 'cart_progress'

/** Highest step index the visitor has unlocked (defaults to the cart page). */
export async function getProgress(): Promise<number> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(PROGRESS_COOKIE)?.value
  const value = raw ? Number.parseInt(raw, 10) : 0
  if (Number.isNaN(value) || value < 0) return 0
  return Math.min(value, ORDER_COMPLETE_LEVEL)
}

/**
 * Guards a step page: the visitor may sit on, or go back to, any unlocked step,
 * but may never skip forward by typing a URL. If they try, send them to the
 * furthest step they have actually unlocked.
 */
export async function guardStep(stepIndex: number): Promise<number> {
  const progress = await getProgress()
  if (stepIndex > progress) {
    // Redirect to an absolute user-facing URL so the basePath survives the
    // CDN/proxy and the bare path never hits the storefront fallback rewrite.
    redirect(await cartUrl(STEPS[progress].path))
  }
  return progress
}

/**
 * Guard for the cart page (step 0): there is a cart (checked via requireCart),
 * so also render the stepper and track progress from here onward.
 */
export async function requireStepCart(): Promise<number> {
  await requireCart()
  return guardStep(0)
}

/**
 * Guard for the checkout page (step 1): the visitor must have already started
 * the checkout flow (a cart must exist, and they must have moved past the cart
 * page). Direct links to /checkout without visiting /cart first redirect to
 * /cart or the furthest unlocked step.
 */
export async function requireStepCheckout(): Promise<number> {
  await requireCart()
  return guardStep(1)
}

/**
 * Guard for the payment page (step 2): the visitor must have already moved past
 * the checkout step. Direct links to /payment redirect to the furthest unlocked
 * step (cart or checkout).
 */
export async function requireStepPayment(): Promise<number> {
  await requireCart()
  return guardStep(2)
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

/* -------------------------------------------------------------------------- */
/*  Cart quantity updates                                                     */
/* -------------------------------------------------------------------------- */

/** Serializes the cart items to the cookie format: "key:qty,key:qty,..." */
function serializeCart(items: Map<ProductKey, number>): string {
  return Array.from(items.entries())
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => (qty === 1 ? key : `${key}:${qty}`))
    .join(',')
}

/**
 * Updates the quantity of a product in the cart.
 * If qty becomes <= 0, the item is removed from the cart.
 * Returns the updated cart string for the cookie.
 */
export async function updateCartItemQuantity(
  productKey: ProductKey,
  newQuantity: number
): Promise<string> {
  const products = await getCartProducts()
  const itemMap = new Map(products.map((p) => [p.key, p.quantity]))

  if (newQuantity <= 0) {
    itemMap.delete(productKey)
  } else {
    itemMap.set(productKey, newQuantity)
  }

  const cartString = serializeCart(itemMap)
  const cookieStore = await cookies()
  cookieStore.set(CART_ITEMS_COOKIE, cartString, {
    path: '/cart',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return cartString
}
