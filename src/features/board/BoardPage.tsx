import { useCallback, useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { useParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { IssueDialog } from '@/features/board/IssueDialog'
import { ImportIssuesDialog } from '@/features/board/ImportIssuesDialog'
import { MatrixBoard } from '@/features/board/MatrixBoard'
import { addIssue, deleteIssue, importIssues, updateIssue } from '@/features/board/board.service'
import { useIssues } from '@/features/board/useIssues'
import { useAuth } from '@/features/auth/auth-context'
import { useLabels } from '@/features/labels/useLabels'
import { useProject } from '@/features/projects/useProject'
import { useConfirmStore } from '@/store/confirm'
import type { Issue, IssueInput } from '@/types/models'

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const { project } = useProject(projectId)
  const labels = useLabels(user?.uid ?? null)
  const { issues, loading, moveIssue } = useIssues(projectId)
  const confirm = useConfirmStore((state) => state.confirm)

  const [editing, setEditing] = useState<{ open: boolean; issue: Issue | null }>({
    open: false,
    issue: null,
  })
  const [importOpen, setImportOpen] = useState(false)

  const handleSave = useCallback(
    async (input: IssueInput) => {
      if (!projectId) return
      if (editing.issue) {
        await updateIssue(projectId, editing.issue.id, input)
        toast.success('Issue updated')
      } else {
        await addIssue(projectId, input)
        toast.success('Issue added')
      }
    },
    [editing.issue, projectId],
  )

  const handleDelete = useCallback(
    (issue: Issue) => {
      if (!projectId) return
      confirm({
        title: 'Delete issue',
        description: `Delete ${issue.number} "${issue.title}"? This cannot be undone.`,
        confirmLabel: 'Delete',
        destructive: true,
        onConfirm: async () => {
          await deleteIssue(projectId, issue.id)
          toast.success('Issue deleted')
        },
      })
    },
    [confirm, projectId],
  )

  const handleImport = useCallback(
    async (inputs: IssueInput[]) => {
      if (!projectId || !user) return
      const existingLabelNames = new Set(labels.map((label) => label.name))
      await importIssues(projectId, user.uid, existingLabelNames, inputs)
      toast.success(`Imported ${inputs.length} issue${inputs.length === 1 ? '' : 's'}`)
    },
    [labels, projectId, user],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-lg font-medium">{project?.name ?? 'Board'}</h1>
          <p className="text-sm text-muted-foreground">
            Drag issues between quadrants. Click one to open it on GitHub.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload />
            Import
          </Button>
          <Button onClick={() => setEditing({ open: true, issue: null })}>
            <Plus />
            Add issue
          </Button>
        </div>
      </header>

      <MatrixBoard
        issues={issues}
        labels={labels}
        loading={loading}
        onMove={moveIssue}
        onEdit={(issue) => setEditing({ open: true, issue })}
        onDelete={handleDelete}
      />

      {editing.open ? (
        <IssueDialog
          key={editing.issue?.id ?? 'new'}
          open
          onOpenChange={(open) => !open && setEditing({ open: false, issue: null })}
          issue={editing.issue}
          labels={labels}
          onSubmit={handleSave}
        />
      ) : null}

      <ImportIssuesDialog open={importOpen} onOpenChange={setImportOpen} onImport={handleImport} />
    </div>
  )
}
