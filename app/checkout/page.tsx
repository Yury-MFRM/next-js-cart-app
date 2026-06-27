import { CustomerInfo } from '@/components/customer-info'
import { OrderSummary } from '@/components/order-summary'
import { Stepper } from '@/components/stepper'
import { SubmitButton } from '@/components/submit-button'
import { requireStepCheckout } from '@/lib/cart'
import { logMiddleware, proceedToPayment } from '../actions'

export default async function CheckoutPage() {
  await logMiddleware("CheckoutPage");
  // Guard: cart must exist and visitor must have reached this step via normal flow.
  const progress = await requireStepCheckout()

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Stepper current={1} progress={progress} />

      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-balance">
        Checkout
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Enter your details, then continue to payment.
      </p>

      {/* Customer info is part of the action form (simulation, not processed). */}
      <form action={proceedToPayment} className="flex flex-col gap-6">
        <CustomerInfo />
        <OrderSummary />
        <div className="flex justify-end">
          <SubmitButton>Continue to payment</SubmitButton>
        </div>
      </form>
    </main>
  )
}
