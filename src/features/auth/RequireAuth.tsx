import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { FullScreenLoader } from '@/components/full-screen-loader'
import { useAuth } from '@/features/auth/auth-context'

/** Gate a route behind authentication, remembering where the user was headed. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) return <FullScreenLoader />
  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  return <>{children}</>
}
