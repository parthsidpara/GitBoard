import type { Quadrant } from '@/types/models'

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

/** Convert a screen-space point (pixels) to the issue's normalized 0..1 space. */
export function toNormalized(point: Point, size: Size): Point {
  if (size.width === 0 || size.height === 0) return { x: 0.5, y: 0.5 }
  return {
    x: point.x / size.width,
    y: 1 - point.y / size.height,
  }
}

/** Convert a normalized 0..1 point back to screen-space pixels. */
export function toScreen(point: Point, size: Size): Point {
  return {
    x: point.x * size.width,
    y: (1 - point.y) * size.height,
  }
}

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/**
 * The quadrant an issue falls in. Matches the on-canvas labels: the vertical
 * axis is urgency (left = urgent) and the horizontal axis is importance
 * (top = important).
 */
export function quadrantOf(point: Point): Quadrant {
  const important = point.y >= 0.5
  const urgent = point.x < 0.5
  if (important && urgent) return 'do'
  if (important && !urgent) return 'schedule'
  if (!important && urgent) return 'delegate'
  return 'delete'
}
