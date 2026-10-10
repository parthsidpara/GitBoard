import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_LABELS } from '@/features/labels/default-labels'
import { subscribeToLabels } from '@/features/labels/labels.service'
import type { Label } from '@/types/models'

/** The user's custom labels, merged with the built-in defaults. */
export function useLabels(userId: string | null): Label[] {
  const [userLabels, setUserLabels] = useState<Label[]>([])

  useEffect(() => {
    if (!userId) return
    const unsubscribe = subscribeToLabels(userId, setUserLabels)
    return () => unsubscribe()
  }, [userId])

  return useMemo(
    () => (userId ? [...DEFAULT_LABELS, ...userLabels] : DEFAULT_LABELS),
    [userId, userLabels],
  )
}
