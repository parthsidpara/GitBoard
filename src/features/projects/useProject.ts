import { useEffect, useState } from 'react'

import { subscribeToProject } from '@/features/projects/projects.service'
import type { Project } from '@/types/models'

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    return subscribeToProject(projectId, (next) => {
      setProject(next)
      setLoading(false)
    })
  }, [projectId])

  if (!projectId) return { project: null, loading: false }
  return { project, loading }
}
