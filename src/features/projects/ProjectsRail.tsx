import { useState } from 'react'
import { LayoutGrid, LogOut, Plus, Tags } from 'lucide-react'
import { useMatch, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/features/auth/auth-context'
import { LabelManagerDialog } from '@/features/labels/LabelManagerDialog'
import { ProjectListItem } from '@/features/projects/ProjectListItem'
import { RenameProjectDialog } from '@/features/projects/RenameProjectDialog'
import { ShareProjectDialog } from '@/features/projects/ShareProjectDialog'
import { createProject, deleteProject, renameProject } from '@/features/projects/projects.service'
import { useProjects } from '@/features/projects/useProjects'
import { shareCanvas } from '@/features/sharing/sharing.service'
import { signOutUser } from '@/lib/firebase'
import { useConfirmStore } from '@/store/confirm'
import type { Project } from '@/types/models'

interface ProjectsRailProps {
  onNavigate?: () => void
}

export function ProjectsRail({ onNavigate }: ProjectsRailProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { projects, loading } = useProjects(user?.uid ?? null)
  const activeMatch = useMatch('/board/:projectId')
  const activeProjectId = activeMatch?.params.projectId
  const confirm = useConfirmStore((state) => state.confirm)

  const [renaming, setRenaming] = useState<Project | null>(null)
  const [shareLink, setShareLink] = useState('')
  const [labelsOpen, setLabelsOpen] = useState(false)

  async function handleCreate() {
    if (!user) return
    const id = await createProject(user.uid, 'New board')
    navigate(`/board/${id}`)
    onNavigate?.()
  }

  async function handleShare(project: Project) {
    if (!user) return
    try {
      const shareId = await shareCanvas(project.id, user.uid, project.name)
      setShareLink(`${window.location.origin}/import/${shareId}`)
    } catch {
      toast.error('Could not create a share link. Please try again.')
    }
  }

  function handleDelete(project: Project) {
    confirm({
      title: 'Delete board',
      description: `Delete "${project.name}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      destructive: true,
      onConfirm: async () => {
        await deleteProject(project.id)
        if (activeProjectId === project.id) navigate('/')
        toast.success('Board deleted')
      },
    })
  }

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-primary font-mono text-[10px] font-semibold text-primary-foreground">
            GB
          </span>
          <span className="font-heading text-sm font-medium">GitBoard</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="New board"
          onClick={() => void handleCreate()}
        >
          <Plus />
        </Button>
      </div>

      <Separator />

      <ScrollArea className="min-h-0 flex-1">
        <nav className="flex flex-col gap-0.5 p-2" aria-label="Boards">
          {loading ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">Loading...</p>
          ) : projects.length === 0 ? (
            <p className="px-2 py-2 text-sm text-muted-foreground">
              No boards yet. Create one to get started.
            </p>
          ) : (
            projects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                active={project.id === activeProjectId}
                onSelect={() => {
                  navigate(`/board/${project.id}`)
                  onNavigate?.()
                }}
                onShare={() => void handleShare(project)}
                onRename={() => setRenaming(project)}
                onDelete={() => handleDelete(project)}
              />
            ))
          )}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="space-y-2 p-3">
        {user ? (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="size-7 rounded-full" />
            ) : (
              <span className="grid size-7 place-items-center rounded-full bg-muted text-xs">
                <LayoutGrid className="size-3.5" />
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-sm">
              {user.displayName ?? user.email}
            </span>
            <ThemeToggle />
          </div>
        ) : null}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setLabelsOpen(true)
            }}
          >
            <Tags />
            Labels
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            onClick={() => void signOutUser()}
          >
            <LogOut />
          </Button>
        </div>
      </div>

      {renaming ? (
        <RenameProjectDialog
          key={renaming.id}
          open
          onOpenChange={(open) => !open && setRenaming(null)}
          currentName={renaming.name}
          onSubmit={async (name) => {
            await renameProject(renaming.id, name)
            toast.success('Board renamed')
          }}
        />
      ) : null}

      <ShareProjectDialog
        open={Boolean(shareLink)}
        onOpenChange={(open) => !open && setShareLink('')}
        link={shareLink}
      />

      <LabelManagerDialog open={labelsOpen} onOpenChange={setLabelsOpen} />
    </div>
  )
}
