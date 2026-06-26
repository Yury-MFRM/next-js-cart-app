import { assetPath } from '@/lib/paths'
import { cn } from '@/lib/utils'

const ICONS = {
  'shopping-cart': 'shopping-cart',
  'trash-2': 'trash-2',
  plus: 'plus',
  minus: 'minus',
  check: 'check',
  'check-circle-2': 'check-circle-2',
  'credit-card': 'credit-card',
  lock: 'lock',
  'loader-2': 'loader-2',
} as const

export type IconName = keyof typeof ICONS

type IconProps = {
  name: IconName
  className?: string
} & Omit<React.ComponentProps<'span'>, 'children'>

/**
 * Renders an SVG from `public/icons` using a CSS mask so the icon inherits
 * `currentColor` from its parent (same behavior as lucide-react icons).
 */
export function Icon({ name, className, ...props }: IconProps) {
  const src = assetPath(`/icons/${ICONS[name]}.svg`)

  return (
    <span
      aria-hidden="true"
      className={cn('inline-block shrink-0 bg-current', className)}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
      {...props}
    />
  )
}
