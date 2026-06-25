import { Button } from '@/components/ui/button'
import { CartItems } from '@/components/cart-items'
import { Stepper } from '@/components/stepper'
import { guardStep } from '@/lib/cart'
import { proceedToPayment } from '../actions'

export default async function CheckoutPage() {
  const progress = await guardStep(1)

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Stepper current={1} progress={progress} />

      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-balance">
        Checkout
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Review the items below, then continue to payment.
      </p>

      <CartItems />

      <form action={proceedToPayment} className="mt-8 flex justify-end">
        <Button type="submit" size="lg">
          Continue to payment
        </Button>
      </form>
    </main>
  )
}
