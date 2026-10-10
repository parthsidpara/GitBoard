import { useEffect, useState } from 'react'

import { subscribeToProjects } from '@/features/projects/projects.service'
import type { Project } from '@/types/models'

export function useProjects(userId: string | null) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    return subscribeToProjects(userId, (next) => {
      setProjects(next)
      setLoading(false)
    })
  }, [userId])

  if (!userId) return { projects: [], loading: false }
  return { projects, loading }
}
