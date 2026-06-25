import { CheckCircle2 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Stepper } from '@/components/stepper'
import { guardStep } from '@/lib/cart'

export default async function OrderCompletePage() {
  const progress = await guardStep(3)

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Stepper current={3} progress={progress} />

      <div className="flex flex-col items-center rounded-lg border border-border bg-card px-6 py-12 text-center">
        <CheckCircle2 className="mb-4 h-12 w-12 text-primary" aria-hidden="true" />
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-balance">
          Order complete
        </h1>
        <p className="mb-8 max-w-sm text-pretty text-sm text-muted-foreground">
          Thanks for your order! This was a simulation, so nothing was actually
          charged or shipped.
        </p>
        {/* Storefront home lives outside the /cart sub-web, so use a plain
            anchor to bypass the basePath and let the proxy/CDN serve it. */}
        <a href="/" className={buttonVariants({ size: 'lg' })}>
          Back to home
        </a>
      </div>
    </main>
  )
}
