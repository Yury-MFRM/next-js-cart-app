'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Submit button for the checkout server-action forms. While the action is
 * pending it disables itself (preventing double submission) and shows a spinner
 * so the visitor sees progress until the next page paints.
 */
export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" disabled={pending} aria-busy={pending}>
      {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
      {pending ? 'Processing…' : children}
    </Button>
  )
}
