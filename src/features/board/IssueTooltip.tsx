import { colorForLabel } from '@/features/labels/default-labels'
import { readableTextColor } from '@/lib/contrast'
import type { Issue, Label } from '@/types/models'

interface IssueTooltipProps {
  issue: Issue
  point: { x: number; y: number }
  labels: Label[]
}

export function IssueTooltip({ issue, point, labels }: IssueTooltipProps) {
  return (
    <div
      role="tooltip"
      style={{ top: point.y + 16, left: point.x + 16 }}
      className="pointer-events-none fixed z-50 max-w-xs rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md"
    >
      <p className="font-mono text-xs text-muted-foreground">{issue.number}</p>
      <p className="mt-0.5 text-sm font-medium">{issue.title}</p>
      {issue.labels.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {issue.labels.map((name) => {
            const background = colorForLabel(labels, name)
            return (
              <span
                key={name}
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ backgroundColor: background, color: readableTextColor(background) }}
              >
                {name}
              </span>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
