import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'

import { AuthContext } from '@/features/auth/auth-context'
import { auth } from '@/lib/firebase'

/**
 * Subscribes to Firebase Auth and exposes the current user to the tree.
 * `initializing` stays true until the first auth state resolves, so guarded
 * routes do not flash the login screen on refresh.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setInitializing(false)
    })
    return unsubscribe
  }, [])

  const value = useMemo(() => ({ user, initializing }), [user, initializing])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
