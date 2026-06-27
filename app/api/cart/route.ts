import {
  getCartProducts,
  getOrderTotals,
  PRODUCTS,
  type ProductKey,
} from '@/lib/cart'
import { loadOrCreateCartForVisitor, saveCart } from '@/lib/cart-store'
import { NextRequest, NextResponse } from 'next/server'

function isProductKey(slug: string): slug is ProductKey {
  return slug in PRODUCTS
}

/** Returns the current cart count for the header badge. */
export async function GET() {
  const products = await getCartProducts()
  const { count } = getOrderTotals(products)

  return NextResponse.json({
    count,
    items: products.map((product) => ({
      slug: product.key,
      qty: product.quantity,
    })),
  })
}

/** Adds one unit of a product to the cart (storefront simulation API). */
export async function POST(request: NextRequest) {
  try {
    const { productSlug } = await request.json()

    if (!productSlug || typeof productSlug !== 'string' || !isProductKey(productSlug)) {
      return NextResponse.json({ error: 'Invalid product slug' }, { status: 400 })
    }

    const { cartId, cart } = await loadOrCreateCartForVisitor()
    cart.items[productSlug] = (cart.items[productSlug] ?? 0) + 1
    await saveCart(cartId, cart)

    let count = 0
    const items = Object.entries(cart.items)
      .filter(([slug, qty]) => qty > 0 && isProductKey(slug))
      .map(([slug, qty]) => {
        count += qty
        return { slug, qty }
      })

    return NextResponse.json({
      success: true,
      count,
      items,
    })
  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
