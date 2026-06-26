'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type CartBadgeProps = {
  /** Server-rendered count for the first paint. */
  initialCount: number
  /** GET endpoint returning `{ count: number }`. */
  apiPath: string
  className?: string
}

/** Client badge that refreshes from the cart API and same-tab update events. */
export function CartBadge({ initialCount, apiPath, className }: CartBadgeProps) {
  const [cartCount, setCartCount] = useState(initialCount)
  const [mounted, setMounted] = useState(false)

  const fetchCartCount = useCallback(async () => {
    try {
      const response = await fetch(apiPath, { method: 'GET' })
      if (response.ok) {
        const data = (await response.json()) as { count?: number }
        setCartCount(data.count ?? 0)
      }
    } catch (error) {
      console.error('Error fetching cart count:', error)
    }
  }, [apiPath])

  useEffect(() => {
    setMounted(true)
    void fetchCartCount()

    const handleCartUpdated = () => {
      void fetchCartCount()
    }

    window.addEventListener('cart:updated', handleCartUpdated)
    window.addEventListener('storage', handleCartUpdated)
    return () => {
      window.removeEventListener('cart:updated', handleCartUpdated)
      window.removeEventListener('storage', handleCartUpdated)
    }
  }, [fetchCartCount])

  if (!mounted || cartCount <= 0) {
    return null
  }

  return (
    <span
      className={cn(
        'absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white',
        className,
      )}
      aria-label={`${cartCount} items in cart`}
    >
      {cartCount}
    </span>
  )
}

/** Dispatched after cart mutations so badges refresh in the same tab. */
export function notifyCartUpdated() {
  window.dispatchEvent(new CustomEvent('cart:updated'))
}
