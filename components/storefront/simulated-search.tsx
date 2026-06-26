'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Icon } from '@/components/icon'
import { cn } from '@/lib/utils'
import type { StorefrontSearchItem } from './types'

type SimulatedSearchProps = {
  items: StorefrontSearchItem[]
  className?: string
}

/**
 * Simulated storefront search: filters the provided catalog client-side and
 * navigates to the selected product on the browse storefront.
 */
export function SimulatedSearch({ items, className }: SimulatedSearchProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return items.slice(0, 4)

    return items
      .filter((item) => item.label.toLowerCase().includes(normalized))
      .slice(0, 6)
  }, [items, query])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-md', className)}>
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search products (simulated)"
          aria-label="Search products"
          aria-expanded={open}
          aria-controls={listboxId}
          role="combobox"
          autoComplete="off"
          className="h-10 w-full rounded-md border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        />
      </div>

      {open && results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md"
        >
          {results.map((item) => (
            <li key={item.href} role="option">
              <a
                href={item.href}
                className="block px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  setOpen(false)
                  setQuery('')
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      {open && query.trim() && results.length === 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
          No products match &ldquo;{query.trim()}&rdquo;.
        </div>
      )}
    </div>
  )
}
