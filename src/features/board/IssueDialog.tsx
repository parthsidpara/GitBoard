import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Issue, IssueInput, Label as LabelModel } from '@/types/models'

interface IssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue: Issue | null
  labels: LabelModel[]
  onSubmit: (input: IssueInput) => void | Promise<void>
}

export function IssueDialog({ open, onOpenChange, issue, labels, onSubmit }: IssueDialogProps) {
  const [number, setNumber] = useState(issue?.number ?? '')
  const [title, setTitle] = useState(issue?.title ?? '')
  const [url, setUrl] = useState(issue?.url ?? '')
  const [selected, setSelected] = useState<string[]>(issue?.labels ?? [])
  const [saving, setSaving] = useState(false)

  function toggleLabel(name: string) {
    setSelected((previous) =>
      previous.includes(name) ? previous.filter((entry) => entry !== name) : [...previous, name],
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ number, title, url, labels: selected })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{issue ? 'Edit issue' : 'Add issue'}</DialogTitle>
          <DialogDescription>
            {issue
              ? 'Update the details for this issue.'
              : 'Add an issue to the board. You can drag it into place once saved.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="issue-number">Issue number</Label>
            <Input
              id="issue-number"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="#123"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="issue-title">Title</Label>
            <Input
              id="issue-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Fix the login button"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="issue-url">URL (optional)</Label>
            <Input
              id="issue-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://github.com/..."
            />
          </div>

          <div className="grid gap-2">
            <Label>Labels</Label>
            <div className="grid max-h-40 grid-cols-2 gap-1 overflow-y-auto rounded-md border p-2">
              {labels.map((label) => (
                <label
                  key={label.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                >
                  <Checkbox
                    checked={selected.includes(label.name)}
                    onCheckedChange={() => toggleLabel(label.name)}
                  />
                  <span className="flex items-center gap-1.5 text-sm">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {issue ? 'Save changes' : 'Add issue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
