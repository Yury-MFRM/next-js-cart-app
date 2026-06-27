import { PRODUCTS } from '@/lib/cart'
import type { StorefrontChromeConfig } from '@/components/storefront/types'

/** Default storefront chrome config for the /cart sub-web. */
export const CART_APP_CHROME_CONFIG: StorefrontChromeConfig = {
  brandLabel: 'Browse',
  brandHref: '/',
  cartHref: '/',
  cartCountApiPath: '/api/cart',
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'Wireless Headphones', href: '/headphones' },
    { label: 'Everyday Sneakers', href: '/sneakers' },
    { label: 'Classic Watch', href: '/watch' },
    { label: 'Canvas Backpack', href: '/backpack' },
  ],
  searchItems: Object.values(PRODUCTS).map((product) => ({
    label: product.name,
    href: product.productPath,
  })),
}

/**
 * Example config for browse-flax (`next-js-browse-app`). Copy into that repo as
 * `lib/storefront-chrome.ts` when wiring the shared header components.
 */
export const BROWSE_APP_CHROME_CONFIG: StorefrontChromeConfig = {
  brandLabel: 'Browse',
  brandHref: '/',
  cartHref: '/cart',
  cartCountApiPath: '/api/cart',
  navLinks: [
    { label: 'Home', href: '/' },
    { label: 'Wireless Headphones', href: '/headphones' },
    { label: 'Everyday Sneakers', href: '/sneakers' },
    { label: 'Classic Watch', href: '/watch' },
    { label: 'Canvas Backpack', href: '/backpack' },
  ],
  searchItems: Object.values(PRODUCTS).map((product) => ({
    label: product.name,
    href: product.productPath,
  })),
}
