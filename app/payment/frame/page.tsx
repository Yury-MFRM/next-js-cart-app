import { CreditCard, Lock } from 'lucide-react'

/**
 * Simulated payment widget rendered standalone so it can be embedded in an
 * <iframe> on the payment page (mimicking a hosted card field from a payment
 * provider). Purely visual — nothing is submitted or processed here; the real
 * "Submit order" button lives on the parent page.
 */
export default function PaymentFrame() {
  return (
    <div className="flex min-h-svh flex-col gap-4 bg-muted/40 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Card details
        </div>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" aria-hidden="true" />
          Secure (simulated)
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="card" className="text-xs font-medium text-foreground">
          Card number
        </label>
        <input
          id="card"
          inputMode="numeric"
          placeholder="4242 4242 4242 4242"
          className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="exp" className="text-xs font-medium text-foreground">
            Expiry
          </label>
          <input
            id="exp"
            placeholder="MM / YY"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cvc" className="text-xs font-medium text-foreground">
            CVC
          </label>
          <input
            id="cvc"
            inputMode="numeric"
            placeholder="123"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      <p className="mt-auto text-xs text-muted-foreground text-pretty">
        This is a sandbox payment field for simulation. No card is charged.
      </p>
    </div>
  )
}
