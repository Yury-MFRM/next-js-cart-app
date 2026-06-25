import {
  absoluteUrl,
  formatMoney,
  getCartProducts,
  getCdnOrigin,
  type Product,
} from '@/lib/cart'

/**
 * Server component that renders the products in the cart. Image sources and
 * product links are built as absolute, user-facing URLs from the CDN origin
 * (the `x-cdn-url` header set by the proxy) so they resolve through the CDN to
 * the storefront for simulation.
 */
export async function CartItems() {
  const [products, origin] = await Promise.all([getCartProducts(), getCdnOrigin()])

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {products.map((product) => (
        <CartRow key={product.key} product={product} origin={origin} />
      ))}
    </ul>
  )
}

function CartRow({ product, origin }: { product: Product; origin: string }) {
  const productUrl = absoluteUrl(origin, product.productPath)
  const imageUrl = absoluteUrl(origin, product.imagePath)

  return (
    <li className="flex items-center gap-4 p-4">
      <a
        href={productUrl}
        className="block shrink-0 overflow-hidden rounded-md border border-border bg-muted"
      >
        {/* Absolute, CDN-resolved image. crossOrigin not needed (plain img). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={product.name}
          width={72}
          height={72}
          className="h-18 w-18 object-cover"
        />
      </a>
      <div className="min-w-0 flex-1">
        <a
          href={productUrl}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {product.name}
        </a>
        <p className="text-sm text-muted-foreground">Qty 1</p>
      </div>
      <span className="font-medium text-foreground">
        {formatMoney(product.price)}
      </span>
    </li>
  )
}
