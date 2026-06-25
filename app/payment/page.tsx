import { OrderSummary } from '@/components/order-summary'
import { Stepper } from '@/components/stepper'
import { SubmitButton } from '@/components/submit-button'
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
        Enter your card details below. This is a simulation — nothing is charged.
      </p>

      {/* Simulated hosted payment field, embedded as an iframe like a real
          payment provider. The /cart basePath is included explicitly because
          a raw iframe src is not rewritten by Next.js. */}
      <div className="overflow-hidden rounded-lg border border-border">
        <iframe
          title="Payment details"
          src="/cart/payment/frame"
          className="h-80 w-full"
        />
      </div>

      <div className="mt-6">
        <OrderSummary />
      </div>

      <form action={submitOrder} className="mt-8 flex justify-end">
        <SubmitButton>Submit order</SubmitButton>
      </form>
    </main>
  )
}
