import { StorefrontHeader } from '@/components/storefront'
import { getCartProducts, getOrderTotals } from '@/lib/cart'
import { CART_APP_CHROME_CONFIG } from '@/lib/storefront-chrome'
import { logMiddleware } from '../actions';

/** Header slot for the /cart page (parallel route `@header`). */
export default async function CartPageHeader() {
  await logMiddleware("CartPageHeader");
  const products = await getCartProducts()
  const { count } = getOrderTotals(products)

  return (
    <StorefrontHeader
      config={CART_APP_CHROME_CONFIG}
      initialCartCount={count}
    />
  )
}
