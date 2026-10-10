import type { Point } from '@/lib/coord'
import type { Issue } from '@/types/models'

export type PendingPositions = Record<string, Point>

/** Apply optimistic positions on top of the server snapshot. */
export function applyPendingPositions(issues: Issue[], pending: PendingPositions): Issue[] {
  if (Object.keys(pending).length === 0) return issues
  return issues.map((issue) => {
    const position = pending[issue.id]
    return position ? { ...issue, x: position.x, y: position.y } : issue
  })
}

const POSITION_EPSILON = 0.001

/**
 * Drop optimistic entries once the server echoes a matching position, or once
 * the issue disappears (deleted). Returns the same reference when unchanged.
 */
export function pruneSettled(pending: PendingPositions, issues: Issue[]): PendingPositions {
  if (Object.keys(pending).length === 0) return pending

  const byId = new Map(issues.map((issue) => [issue.id, issue]))
  const next: PendingPositions = { ...pending }
  let changed = false

  for (const id of Object.keys(pending)) {
    const issue = byId.get(id)
    const target = pending[id]
    const settled =
      !issue ||
      (Math.abs(issue.x - target.x) < POSITION_EPSILON &&
        Math.abs(issue.y - target.y) < POSITION_EPSILON)
    if (settled) {
      delete next[id]
      changed = true
    }
  }

  return changed ? next : pending
}
