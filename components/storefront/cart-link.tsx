import Link from 'next/link'
import { Icon } from '@/components/icon'
import { cn } from '@/lib/utils'
import { CartBadge } from './cart-badge'

type CartLinkProps = {
  cartHref: string
  cartCountApiPath: string
  initialCount: number
  className?: string
}

export function CartLink({
  cartHref,
  cartCountApiPath,
  initialCount,
  className,
}: CartLinkProps) {
  return (
    <Link
      href={cartHref}
      aria-label="View cart"
      className={cn(
        'relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
        className,
      )}
    >
      <Icon name="shopping-cart" className="size-5" />
      <CartBadge
        initialCount={initialCount}
        apiPath={cartCountApiPath}
      />
    </Link>
  )
}
