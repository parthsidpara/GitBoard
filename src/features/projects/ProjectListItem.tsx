import { MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/models'

interface ProjectListItemProps {
  project: Project
  active: boolean
  onSelect: () => void
  onShare: () => void
  onRename: () => void
  onDelete: () => void
}

export function ProjectListItem({
  project,
  active,
  onSelect,
  onShare,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-md pr-1',
        active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-muted',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 truncate px-2 py-1.5 text-left text-sm"
        aria-current={active ? 'page' : undefined}
      >
        {project.name}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Actions for ${project.name}`}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onShare}>
            <Share2 />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRename}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
