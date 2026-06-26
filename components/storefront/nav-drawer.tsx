'use client'

import { useEffect } from 'react'
import { Icon } from '@/components/icon'
import { cn } from '@/lib/utils'
import type { StorefrontNavLink } from './types'

type NavDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandLabel: string
  links: StorefrontNavLink[]
}

/** Slide-in navigation drawer toggled by the header hamburger button. */
export function NavDrawer({ open, onOpenChange, brandLabel, links }: NavDrawerProps) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => onOpenChange(false)}
      />

      <aside
        id="storefront-nav-drawer"
        aria-hidden={!open}
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-background shadow-xl transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <span className="text-lg font-semibold tracking-tight">{brandLabel}</span>
          <button
            type="button"
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={() => onOpenChange(false)}
          >
            <Icon name="x" className="size-5" />
          </button>
        </div>

        <nav aria-label="Store navigation" className="flex flex-col gap-1 p-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={() => onOpenChange(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  )
}
