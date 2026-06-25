import { ShoppingCart } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

/**
 * Empty-cart experience. Mirrors the terminal order-complete page: a centered
 * card with an icon, a short message, and a single link back to the storefront
 * home — no stepper, since there is no checkout flow to progress through.
 */
export function EmptyCart() {
  return (
    <div className="flex flex-col items-center rounded-lg border border-border bg-card px-6 py-12 text-center">
      <ShoppingCart
        className="mb-4 h-12 w-12 text-muted-foreground"
        aria-hidden="true"
      />
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-balance">
        Your cart is empty
      </h1>
      <p className="mb-8 max-w-sm text-pretty text-sm text-muted-foreground">
        {"There's nothing in your cart yet. Browse the store to find something you like."}
      </p>
      {/* Storefront home lives outside the /cart sub-web, so use a plain anchor
          to bypass the basePath and let the proxy/CDN serve it. */}
      <a href="/" className={buttonVariants({ size: 'lg' })}>
        Back to home
      </a>
    </div>
  )
}
