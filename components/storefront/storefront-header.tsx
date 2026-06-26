'use client'

import { useState } from 'react'
import { Icon } from '@/components/icon'
import { cn } from '@/lib/utils'
import { CartLink } from './cart-link'
import { NavDrawer } from './nav-drawer'
import { SimulatedSearch } from './simulated-search'
import type { StorefrontChromeConfig } from './types'

type StorefrontHeaderProps = {
  config: StorefrontChromeConfig
  initialCartCount: number
  className?: string
}

/**
 * Storefront header shell: hamburger drawer, brand, simulated search, cart badge.
 * Pass `CART_APP_CHROME_CONFIG` or `BROWSE_APP_CHROME_CONFIG` from
 * `lib/storefront-chrome.ts`.
 */
export function StorefrontHeader({
  config,
  initialCartCount,
  className,
}: StorefrontHeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur',
          className,
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="storefront-nav-drawer"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => setDrawerOpen(true)}
          >
            <Icon name="menu" className="size-5" />
          </button>

          <a
            href={config.brandHref}
            className="hidden shrink-0 text-lg font-semibold tracking-tight sm:inline"
          >
            {config.brandLabel}
          </a>

          <SimulatedSearch items={config.searchItems} className="min-w-0 flex-1" />

          <CartLink
            cartHref={config.cartHref}
            cartCountApiPath={config.cartCountApiPath}
            initialCount={initialCartCount}
          />
        </div>
      </header>

      <NavDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        brandLabel={config.brandLabel}
        links={config.navLinks}
      />
    </>
  )
}
