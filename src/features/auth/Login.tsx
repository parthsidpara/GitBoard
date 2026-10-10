import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { signInWithGoogle } from '@/lib/firebase'

function GoogleMark() {
  return (
    <svg className="size-4" viewBox="0 0 18 19" aria-hidden="true" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.342A8.8 8.8 0 0 1 8.842 18.083Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function Login() {
  const { user, initializing } = useAuth()
  const [params] = useSearchParams()
  const [pending, setPending] = useState(false)

  const requestedNext = params.get('next')
  const next = requestedNext?.startsWith('/') ? requestedNext : '/'

  if (!initializing && user) return <Navigate to={next} replace />

  async function handleSignIn() {
    setPending(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      toast.error('Could not sign you in', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
      setPending(false)
    }
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04]"
      />
      <div className="relative w-full max-w-sm rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-md bg-primary font-mono text-xs font-semibold text-primary-foreground">
              GB
            </span>
            <span className="font-heading text-base font-medium">GitBoard</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Plot your GitHub issues on an Eisenhower matrix so you can see what actually needs doing
            next.
          </p>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleSignIn}
          disabled={pending}
          data-icon="inline-start"
        >
          <GoogleMark />
          {pending ? 'Signing in...' : 'Continue with Google'}
        </Button>
      </div>
    </div>
  )
}
