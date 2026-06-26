import { getCartProducts, getOrderTotals } from '@/lib/cart'
import { NextResponse } from 'next/server'

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
