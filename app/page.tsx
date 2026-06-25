import { CartItems } from '@/components/cart-items'
import { OrderSummary } from '@/components/order-summary'
import { Stepper } from '@/components/stepper'
import { SubmitButton } from '@/components/submit-button'
import { guardStep } from '@/lib/cart'
import { proceedToCheckout } from './actions'

export default async function CartPage() {
  const progress = await guardStep(0)

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Stepper current={0} progress={progress} />

      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-balance">
        Your cart
      </h1>

      {/* The cart is the only page that shows product images and links. */}
      <CartItems />

      <div className="mt-6">
        <OrderSummary />
      </div>

      <form action={proceedToCheckout} className="mt-8 flex justify-end">
        <SubmitButton>Checkout</SubmitButton>
      </form>
    </main>
  )
}
