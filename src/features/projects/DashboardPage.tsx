import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'
import { createProject } from '@/features/projects/projects.service'
import { useProjects } from '@/features/projects/useProjects'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { projects } = useProjects(user?.uid ?? null)
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!user) return
    setCreating(true)
    try {
      const id = await createProject(user.uid, 'New board')
      navigate(`/board/${id}`)
    } finally {
      setCreating(false)
    }
  }

  const hasProjects = projects.length > 0

  return (
    <div className="grid h-full place-items-center">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="font-heading text-2xl font-medium">
          {hasProjects ? 'Pick a board' : `Welcome, ${user?.displayName ?? 'there'}`}
        </h1>
        <p className="text-sm text-muted-foreground">
          {hasProjects
            ? 'Choose a board from the sidebar, or start a new one.'
            : 'Create your first board and start prioritising your issues.'}
        </p>
        <Button onClick={() => void handleCreate()} disabled={creating}>
          <Plus />
          New board
        </Button>
      </div>
    </div>
  )
}
