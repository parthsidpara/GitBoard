import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { colorForLabel } from '@/features/labels/default-labels'
import { IssueContextMenu } from '@/features/board/IssueContextMenu'
import { IssueNode } from '@/features/board/IssueNode'
import { IssueTooltip } from '@/features/board/IssueTooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { Point, Size } from '@/lib/coord'
import type { Issue, Label } from '@/types/models'

interface MatrixBoardProps {
  issues: Issue[]
  labels: Label[]
  loading: boolean
  onMove: (issueId: string, position: Point) => void
  onEdit: (issue: Issue) => void
  onDelete: (issue: Issue) => void
}

const QUADRANT_LABELS: { key: string; text: string }[] = [
  { key: 'do', text: 'Important & urgent' },
  { key: 'schedule', text: 'Important & not urgent' },
  { key: 'delegate', text: 'Not important & urgent' },
  { key: 'delete', text: 'Not important & not urgent' },
]

// Full class names are written out literally so Tailwind can see and generate
// them. A template literal such as `fill-quadrant-${key}/8` would not be
// detected, leaving the SVG rects with no fill (which renders black).
const QUADRANT_TINTS: { key: string; x: number; y: number; className: string }[] = [
  { key: 'do', x: 0, y: 0, className: 'fill-quadrant-do/8' },
  { key: 'schedule', x: 0.5, y: 0, className: 'fill-quadrant-schedule/8' },
  { key: 'delegate', x: 0, y: 0.5, className: 'fill-quadrant-delegate/8' },
  { key: 'delete', x: 0.5, y: 0.5, className: 'fill-quadrant-delete/8' },
]

export function MatrixBoard({
  issues,
  labels,
  loading,
  onMove,
  onEdit,
  onDelete,
}: MatrixBoardProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const [tooltip, setTooltip] = useState<{ issue: Issue; point: Point } | null>(null)
  const [menu, setMenu] = useState<{ issue: Issue; point: Point } | null>(null)

  useLayoutEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const update = () => {
      const rect = svg.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(svg)
    return () => observer.disconnect()
  }, [])

  const handleHover = useCallback((issue: Issue, point: Point) => {
    setTooltip({ issue, point })
  }, [])
  const handleLeave = useCallback(() => setTooltip(null), [])
  const handleOpenMenu = useCallback((issue: Issue, point: Point) => {
    setTooltip(null)
    setMenu({ issue, point })
  }, [])
  const closeMenu = useCallback(() => setMenu(null), [])

  const colorFor = useCallback(
    (issue: Issue) => colorForLabel(labels, issue.labels[0] ?? ''),
    [labels],
  )

  return (
    <div className="relative flex-1 overflow-hidden rounded-xl border bg-card">
      <svg ref={svgRef} className="size-full" role="group" aria-label="Eisenhower matrix">
        {QUADRANT_TINTS.map((quadrant) => (
          <rect
            key={quadrant.key}
            x={`${quadrant.x * 100}%`}
            y={`${quadrant.y * 100}%`}
            width="50%"
            height="50%"
            className={quadrant.className}
          />
        ))}

        <line x1="50%" y1="0" x2="50%" y2="100%" className="stroke-border" strokeWidth={1} />
        <line x1="0" y1="50%" x2="100%" y2="50%" className="stroke-border" strokeWidth={1} />

        {QUADRANT_LABELS.map((quadrant, index) => {
          const left = index % 2 === 0
          const top = index < 2
          return (
            <text
              key={quadrant.key}
              x={left ? 16 : '100%'}
              y={top ? 26 : '100%'}
              dx={left ? 0 : -16}
              dy={top ? 0 : -14}
              textAnchor={left ? 'start' : 'end'}
              className="fill-muted-foreground font-sans text-xs"
            >
              {quadrant.text}
            </text>
          )
        })}

        {issues.map((issue) => (
          <IssueNode
            key={issue.id}
            issue={issue}
            size={size}
            color={colorFor(issue)}
            svgRef={svgRef}
            onMove={onMove}
            onHover={handleHover}
            onLeave={handleLeave}
            onOpenMenu={handleOpenMenu}
          />
        ))}
      </svg>

      {loading ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <Skeleton className="h-full w-full rounded-none opacity-60" />
        </div>
      ) : null}

      {!loading && issues.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p className="max-w-60 text-center text-base text-muted-foreground">
            No issues yet. Add one, or import them from a GitHub repository.
          </p>
        </div>
      ) : null}

      {tooltip ? (
        <IssueTooltip issue={tooltip.issue} point={tooltip.point} labels={labels} />
      ) : null}

      {menu ? (
        <IssueContextMenu
          issue={menu.issue}
          point={menu.point}
          onEdit={(issue) => {
            closeMenu()
            onEdit(issue)
          }}
          onDelete={(issue) => {
            closeMenu()
            onDelete(issue)
          }}
          onClose={closeMenu}
        />
      ) : null}
    </div>
  )
}
