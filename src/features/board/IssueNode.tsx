import { memo, useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'

import { toNormalized, toScreen, type Point, type Size } from '@/lib/coord'
import { readableTextColor } from '@/lib/contrast'
import type { Issue } from '@/types/models'

interface IssueNodeProps {
  issue: Issue
  size: Size
  color: string
  svgRef: React.RefObject<SVGSVGElement | null>
  onMove: (issueId: string, position: Point) => void
  onHover: (issue: Issue, point: Point) => void
  onLeave: () => void
  onOpenMenu: (issue: Issue, point: Point) => void
}

function pointerToSvg(
  event: { clientX: number; clientY: number },
  svgRef: React.RefObject<SVGSVGElement | null>,
): Point {
  const rect = svgRef.current?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max)

export const IssueNode = memo(function IssueNode({
  issue,
  size,
  color,
  svgRef,
  onMove,
  onHover,
  onLeave,
  onOpenMenu,
}: IssueNodeProps) {
  const [dragPosition, setDragPosition] = useState<Point | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const offset = useRef<Point>({ x: 0, y: 0 })
  const latestPosition = useRef<Point | null>(null)
  const wasDragged = useRef(false)

  const base = toScreen({ x: issue.x, y: issue.y }, size)
  const position = dragPosition ?? base

  const handlePointerDown = useCallback(
    (event: PointerEvent<SVGGElement>) => {
      if (event.button !== 0) return
      wasDragged.current = false
      const point = pointerToSvg(event, svgRef)
      offset.current = { x: point.x - base.x, y: point.y - base.y }
      latestPosition.current = base
      setDragPosition(base)
      setIsDragging(true)
      onLeave()
    },
    [base, onLeave, svgRef],
  )

  useEffect(() => {
    if (!isDragging) return

    function handleMove(event: globalThis.PointerEvent) {
      const point = pointerToSvg(event, svgRef)
      const next = {
        x: clamp(point.x - offset.current.x, size.width),
        y: clamp(point.y - offset.current.y, size.height),
      }
      wasDragged.current = true
      latestPosition.current = next
      setDragPosition(next)
    }

    function handleUp() {
      const final = latestPosition.current
      setIsDragging(false)
      setDragPosition(null)
      latestPosition.current = null
      if (wasDragged.current && final) {
        onMove(issue.id, toNormalized(final, size))
      }
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [isDragging, issue.id, onMove, size, svgRef])

  const handleClick = useCallback(() => {
    if (wasDragged.current || !issue.url) return
    window.open(issue.url, '_blank', 'noopener,noreferrer')
  }, [issue.url])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.key === 'Enter' || event.key === ' ') && issue.url) {
        event.preventDefault()
        window.open(issue.url, '_blank', 'noopener,noreferrer')
      }
    },
    [issue.url],
  )

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      if (isDragging) return
      onHover(issue, { x: event.clientX, y: event.clientY })
    },
    [isDragging, issue, onHover],
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (isDragging) return
      onHover(issue, { x: event.clientX, y: event.clientY })
    },
    [isDragging, issue, onHover],
  )

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      onOpenMenu(issue, { x: event.clientX, y: event.clientY })
    },
    [issue, onOpenMenu],
  )

  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={onLeave}
      onContextMenu={handleContextMenu}
      className={isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      style={{ touchAction: 'none' }}
      role="button"
      tabIndex={0}
      aria-label={`Issue ${issue.number}: ${issue.title}`}
    >
      <circle
        r={22}
        fill={color}
        opacity={0.35}
        className="transition-transform duration-150"
        style={{
          transform: isDragging ? 'scale(1.15)' : 'scale(1)',
          transformBox: 'fill-box',
          transformOrigin: 'center',
        }}
      />
      <circle r={18} fill={color} />
      <text
        className="pointer-events-none font-mono text-[11px] font-semibold select-none"
        textAnchor="middle"
        dy="0.35em"
        style={{ fill: readableTextColor(color) }}
      >
        {issue.number}
      </text>
    </g>
  )
})
