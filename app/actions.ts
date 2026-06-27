'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'
import { advanceProgress, cartUrl, type ProductKey, updateCartItemQuantity } from '@/lib/cart'
import { cookies, headers } from 'next/headers'

// Each action simulates submitting the current step's data, records progress in
// the cookie, and redirects to the next step. We redirect to an absolute,
// user-facing URL (built from the CDN origin + /cart basePath) so the basePath
// survives the CDN/proxy and the bare path never hits the storefront fallback
// rewrite. No real processing happens.

export async function proceedToCheckout() {
  await logMiddleware("proceedToCheckout");
  await advanceProgress(1)
  redirect(await cartUrl('/checkout'))
}

export async function proceedToPayment() {
  await logMiddleware("proceedToPayment");
  await advanceProgress(2)
  redirect(await cartUrl('/payment'))
}

export async function submitOrder() { 
  await logMiddleware("submitOrder");
  await advanceProgress(3)
  redirect(await cartUrl('/ordercomplete'))
}

export async function updateItemQuantity(productKey: ProductKey, quantity: number): Promise<void> {
  await logMiddleware("updateItemQuantity");
  await updateCartItemQuantity(productKey, quantity)
  refresh()
}

export async function logMiddleware(message: string) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const text = `Middleware from ${message}:
    ECID: ${cookieStore.get("ECID")}
    x-cdn-url: ${headerStore.get("x-cdn-url")}
    x-0-browser: ${headerStore.get("x-0-browser")}
    x-0-request-id: ${headerStore.get("x-0-request-id")}
    x-0-version: ${headerStore.get("x-0-version")}
    x-0-forwarded-host: ${headerStore.get("x-0-forwarded-host")}
    x-0-client-ip: ${headerStore.get("x-0-client-ip")}
    x-0-is-smartphone: ${headerStore.get("x-0-is-smartphone")}
    x-0-is-tablet: ${headerStore.get("x-0-is-tablet")}
    x-0-is-ios: ${headerStore.get("x-0-is-ios")}
    x-0-is-android: ${headerStore.get("x-0-is-android")}
  `;
  console.log(text);
}
