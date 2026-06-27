import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { BASE_PATH } from '@/lib/paths'
import {
  getCartId,
  loadCart,
  loadCartForVisitor,
  saveCart,
  type CartRecord,
} from '@/lib/cart-store'

export { BASE_PATH, assetPath } from '@/lib/paths'
export { CART_ID_COOKIE } from '@/lib/cart-store'

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

function productsFromRecord(cart: CartRecord): Product[] {
  return Object.entries(cart.items)
    .filter(([, qty]) => qty > 0)
    .flatMap(([key, quantity]) => {
      if (!(key in PRODUCTS)) return []
      return [{ ...PRODUCTS[key as ProductKey], quantity }]
    })
}

/**
 * Loads cart line items from Upstash Redis using the `cart_id` cookie.
 * When the cookie or stored cart is missing, the cart is empty.
 */
export async function getCartProducts(): Promise<Product[]> {
  const { cart } = await loadCartForVisitor()
  return productsFromRecord(cart)
}

/**
 * Guard for every checkout page EXCEPT the cart itself: if the cart is empty,
 * there is nothing to check out, so send the visitor to /cart where the
 * empty-cart experience is shown.
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
  console.log('origin', origin,'step', step,'BASE_PATH', BASE_PATH)
  // No origin header (rare): return the bare step so redirect() prepends the
  // basePath itself — avoids a double `/cart/cart` prefix.
  return step;
  // FIXME: this is a temporary test of the cart to work without the origin header
  // if (!origin) return step
  // const path = step === '/' ? BASE_PATH : `${BASE_PATH}${step}`
  // return `${origin}${path}`
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

/** Highest step index the visitor has unlocked (defaults to the cart page). */
export async function getProgress(): Promise<number> {
  const cartId = await getCartId()
  if (!cartId) return 0

  const cart = await loadCart(cartId)
  const value = cart?.progress ?? 0
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

/** Advances progress to at least `stepIndex` and stores it in Redis. */
export async function advanceProgress(stepIndex: number): Promise<void> {
  const cartId = await getCartId()
  if (!cartId) return

  const cart = (await loadCart(cartId)) ?? { items: {}, progress: 0 }
  cart.progress = Math.max(cart.progress, stepIndex)
  await saveCart(cartId, cart)
}

/* -------------------------------------------------------------------------- */
/*  Cart quantity updates                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Updates the quantity of a product in the cart.
 * If qty becomes <= 0, the item is removed from the cart.
 */
export async function updateCartItemQuantity(
  productKey: ProductKey,
  newQuantity: number,
): Promise<void> {
  const cartId = await getCartId()
  if (!cartId) return

  const cart = (await loadCart(cartId)) ?? { items: {}, progress: 0 }

  if (newQuantity <= 0) {
    delete cart.items[productKey]
  } else {
    cart.items[productKey] = newQuantity
  }

  await saveCart(cartId, cart)
}
