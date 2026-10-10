import { useEffect, useRef } from 'react'
import { Pencil, Trash2 } from 'lucide-react'

import type { Issue } from '@/types/models'

interface IssueContextMenuProps {
  issue: Issue
  point: { x: number; y: number }
  onEdit: (issue: Issue) => void
  onDelete: (issue: Issue) => void
  onClose: () => void
}

const MENU_WIDTH = 168
const MENU_HEIGHT = 84

export function IssueContextMenu({
  issue,
  point,
  onEdit,
  onDelete,
  onClose,
}: IssueContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose()
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const left = Math.min(point.x, window.innerWidth - MENU_WIDTH - 8)
  const top = Math.min(point.y, window.innerHeight - MENU_HEIGHT - 8)

  return (
    <div
      ref={ref}
      role="menu"
      style={{ top, left }}
      className="fixed z-50 min-w-42 rounded-lg border bg-popover p-1 text-sm shadow-md"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => onEdit(issue)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted"
      >
        <Pencil className="size-3.5" />
        Edit
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => onDelete(issue)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-3.5" />
        Delete
      </button>
    </div>
  )
}
