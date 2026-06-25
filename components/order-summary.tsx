import { formatMoney, getCartProducts, getOrderTotals } from '@/lib/cart'

/**
 * Server component showing the order totals only (no product images or links).
 * Used on the checkout and payment pages.
 */
export async function OrderSummary() {
  const products = await getCartProducts()
  const { count, subtotal, tax, total } = getOrderTotals(products)

  const rows = [
    { label: `Subtotal (${count} ${count === 1 ? 'item' : 'items'})`, value: formatMoney(subtotal) },
    { label: 'Tax (8%)', value: formatMoney(tax) },
  ]

  return (
    <section
      aria-label="Order summary"
      className="rounded-lg border border-border bg-card p-6"
    >
      <h2 className="mb-4 text-sm font-semibold tracking-tight text-foreground">
        Order summary
      </h2>
      <dl className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
          <dt className="text-sm font-semibold text-foreground">Total</dt>
          <dd className="text-base font-semibold text-foreground">
            {formatMoney(total)}
          </dd>
        </div>
      </dl>
    </section>
  )
}
