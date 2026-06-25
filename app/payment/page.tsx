import { Button } from '@/components/ui/button'
import { CartItems } from '@/components/cart-items'
import { Stepper } from '@/components/stepper'
import { guardStep } from '@/lib/cart'
import { submitOrder } from '../actions'

export default async function PaymentPage() {
  const progress = await guardStep(2)

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Stepper current={2} progress={progress} />

      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-balance">
        Payment
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        This is a simulation — no payment details are processed.
      </p>

      <CartItems />

      <form action={submitOrder} className="mt-8 flex justify-end">
        <Button type="submit" size="lg">
          Submit order
        </Button>
      </form>
    </main>
  )
}
