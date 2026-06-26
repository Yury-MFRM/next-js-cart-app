'use client'

import { useState, useTransition } from 'react'
import { Icon } from '@/components/icon'
import { notifyCartUpdated } from '@/components/storefront/cart-badge'
import { updateItemQuantity } from '@/app/actions'
import { type ProductKey } from '@/lib/cart'

interface QuantityCounterProps {
  productKey: ProductKey
  initialQuantity: number
  onQuantityChange?: (quantity: number) => void
}

export function QuantityCounter({
  productKey,
  initialQuantity,
  onQuantityChange,
}: QuantityCounterProps) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [isPending, startTransition] = useTransition()

  const handleUpdateQuantity = (newQuantity: number) => {
    setQuantity(newQuantity)
    onQuantityChange?.(newQuantity)

    startTransition(async () => {
      await updateItemQuantity(productKey, newQuantity)
      notifyCartUpdated()
    })
  }

  const handleIncrement = () => {
    handleUpdateQuantity(quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      handleUpdateQuantity(quantity - 1)
    } else {
      // If quantity is 1, delete the item
      handleUpdateQuantity(0)
    }
  }

  // When quantity becomes 0, the item is removed from the cart
  if (quantity <= 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDecrement}
        disabled={isPending}
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-background hover:bg-muted disabled:opacity-50"
        aria-label={quantity === 1 ? 'Remove item' : 'Decrease quantity'}
      >
        {quantity === 1 ? (
          <Icon name="trash-2" className="h-4 w-4 text-foreground" />
        ) : (
          <Icon name="minus" className="h-4 w-4 text-foreground" />
        )}
      </button>

      <span className="w-6 text-center text-sm font-medium text-foreground">
        {quantity}
      </span>

      <button
        onClick={handleIncrement}
        disabled={isPending}
        className="inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-background hover:bg-muted disabled:opacity-50"
        aria-label="Increase quantity"
      >
        <Icon name="plus" className="h-4 w-4 text-foreground" />
      </button>
    </div>
  )
}
