import {
  absoluteUrl,
  assetPath,
  formatMoney,
  getCartProducts,
  getCdnOrigin,
  type Product,
} from '@/lib/cart'
import { QuantityCounter } from '@/components/quantity-counter'

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
  const lineTotal = formatMoney(product.price * product.quantity)

  return (
    <li className="flex items-center gap-4 p-4">
      <a
        href={productUrl}
        className="block shrink-0 overflow-hidden rounded-md border border-border bg-muted"
      >
        {/* Absolute, CDN-resolved image. crossOrigin not needed (plain img). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl || assetPath('/icons/placeholder.svg')}
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
        <div className="mt-2 flex items-center gap-4">
          <QuantityCounter productKey={product.key} initialQuantity={product.quantity} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">
          {formatMoney(product.price)} each
        </span>
        <span className="font-semibold text-foreground">{lineTotal}</span>
      </div>
    </li>
  )
}
