import { useEffect, useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/features/auth/auth-context'
import { DEFAULT_LABELS } from '@/features/labels/default-labels'
import { addLabel, deleteLabel, subscribeToLabels } from '@/features/labels/labels.service'
import type { Label as LabelModel } from '@/types/models'

interface LabelManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DEFAULT_NEW_COLOR = '#0090ff'

export function LabelManagerDialog({ open, onOpenChange }: LabelManagerDialogProps) {
  const { user } = useAuth()
  const [userLabels, setUserLabels] = useState<LabelModel[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_NEW_COLOR)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !user) return
    return subscribeToLabels(user.uid, setUserLabels)
  }, [open, user])

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !name.trim()) return
    setSaving(true)
    try {
      await addLabel(user.uid, { name: name.trim(), color })
      setName('')
      setColor(DEFAULT_NEW_COLOR)
    } catch {
      toast.error('Could not add the label. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(labelId: string) {
    if (!user) return
    try {
      await deleteLabel(user.uid, labelId)
    } catch {
      toast.error('Could not delete the label.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Labels</DialogTitle>
          <DialogDescription>
            Built-in labels are always available. Add your own to categorise issues.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-56 rounded-md border">
          <ul className="divide-y">
            {DEFAULT_LABELS.map((label) => (
              <li
                key={label.id}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground"
              >
                <span className="size-3 rounded-full" style={{ backgroundColor: label.color }} />
                {label.name}
              </li>
            ))}
            {userLabels.map((label) => (
              <li key={label.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span className="size-3 rounded-full" style={{ backgroundColor: label.color }} />
                <span className="flex-1">{label.name}</span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Delete ${label.name}`}
                  onClick={() => void handleDelete(label.id)}
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        </ScrollArea>

        <form onSubmit={handleAdd} className="flex items-end gap-2">
          <div className="grid gap-2">
            <Label htmlFor="label-color" className="sr-only">
              Colour
            </Label>
            <input
              id="label-color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-8 w-10 cursor-pointer rounded-md border bg-transparent p-0.5"
            />
          </div>
          <div className="grid flex-1 gap-2">
            <Label htmlFor="label-name" className="sr-only">
              Label name
            </Label>
            <Input
              id="label-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="New label name"
              required
            />
          </div>
          <Button type="submit" disabled={saving || !name.trim()}>
            Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
