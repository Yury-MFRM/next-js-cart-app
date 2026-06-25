'use server'

import { redirect } from 'next/navigation'
import { advanceProgress, cartUrl } from '@/lib/cart'

// Each action simulates submitting the current step's data, records progress in
// the cookie, and redirects to the next step. We redirect to an absolute,
// user-facing URL (built from the CDN origin + /cart basePath) so the basePath
// survives the CDN/proxy and the bare path never hits the storefront fallback
// rewrite. No real processing happens.

export async function proceedToCheckout() {
  await advanceProgress(1)
  redirect(await cartUrl('/checkout'))
}

export async function proceedToPayment() {
  await advanceProgress(2)
  redirect(await cartUrl('/payment'))
}

export async function submitOrder() {
  await advanceProgress(3)
  redirect(await cartUrl('/ordercomplete'))
}
