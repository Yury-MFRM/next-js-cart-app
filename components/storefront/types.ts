/** A navigation link rendered in the side drawer. */
export type StorefrontNavLink = {
  label: string
  /** Absolute storefront path (e.g. `/headphones`). */
  href: string
}

/** A searchable catalog entry for the simulated search UI. */
export type StorefrontSearchItem = {
  label: string
  /** Absolute storefront path to the product detail page. */
  href: string
}

/**
 * Configuration for storefront chrome shared between the browse storefront
 * and the /cart checkout sub-web. Copy this file + `components/storefront/*`
 * into browse-flax and supply a config with paths relative to that app.
 */
export type StorefrontChromeConfig = {
  brandLabel: string
  /** Link to the storefront home page. Use a plain path (`/`) to bypass basePath. */
  brandHref: string
  /** Link to the cart page. In cart-app this is `/` (→ `/cart`). */
  cartHref: string
  /** GET endpoint returning `{ count: number }` for the cart badge. */
  cartCountApiPath: string
  navLinks: StorefrontNavLink[]
  searchItems: StorefrontSearchItem[]
}
