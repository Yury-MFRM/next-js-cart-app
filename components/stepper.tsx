import Link from 'next/link'
import { Check } from 'lucide-react'
import { STEPS } from '@/lib/cart'
import { cn } from '@/lib/utils'

type StepperProps = {
  /** Index of the step the visitor is currently viewing. */
  current: number
  /** Highest step index the visitor has unlocked. */
  progress: number
}

/**
 * Horizontal checkout stepper. Completed/unlocked steps are links so the
 * visitor can navigate back to any of them. The current step is highlighted and
 * not-yet-reached steps are disabled (no skipping forward).
 */
export function Stepper({ current, progress }: StepperProps) {
  return (
    <nav aria-label="Checkout progress" className="mb-10">
      <ol className="flex items-center">
        {STEPS.map((step, index) => {
          const isComplete = index < current
          const isCurrent = index === current
          const isUnlocked = index <= progress
          // Can navigate to any unlocked step that isn't the current one.
          const isLinkable = isUnlocked && !isCurrent

          const circle = (
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                isCurrent && 'border-primary bg-primary text-primary-foreground',
                isComplete &&
                  'border-primary bg-primary/10 text-primary',
                !isCurrent &&
                  !isComplete &&
                  'border-border bg-muted text-muted-foreground',
              )}
            >
              {isComplete ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
          )

          const label = (
            <span
              className={cn(
                'text-sm font-medium',
                isCurrent ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          )

          return (
            <li key={step.path} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-3">
                {isLinkable ? (
                  <Link
                    href={step.path}
                    className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {circle}
                    {label}
                  </Link>
                ) : (
                  <div
                    className="flex items-center gap-3"
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {circle}
                    {label}
                  </div>
                )}
              </div>
              {index < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-3 h-px flex-1',
                    index < current ? 'bg-primary' : 'bg-border',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
