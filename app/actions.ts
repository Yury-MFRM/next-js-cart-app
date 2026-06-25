'use server'

import { redirect } from 'next/navigation'
import { advanceProgress } from '@/lib/cart'

// Each action simulates submitting the current step's data, records progress in
// the cookie, and redirects to the next step. No real processing happens.

export async function proceedToCheckout() {
  await advanceProgress(1)
  redirect('/checkout')
}

export async function proceedToPayment() {
  await advanceProgress(2)
  redirect('/payment')
}

export async function submitOrder() {
  await advanceProgress(3)
  redirect('/ordercomplete')
}
