import { describe, expect, it } from 'vitest'

import { applyPendingPositions, pruneSettled } from '@/lib/optimistic'
import type { Issue } from '@/types/models'

function issue(id: string, x: number, y: number): Issue {
  return { id, number: `#${id}`, title: 't', url: '', labels: [], x, y }
}

describe('applyPendingPositions', () => {
  it('overrides the position of pending issues only', () => {
    const issues = [issue('a', 0.1, 0.1), issue('b', 0.2, 0.2)]
    const result = applyPendingPositions(issues, { a: { x: 0.9, y: 0.9 } })
    expect(result[0]).toMatchObject({ id: 'a', x: 0.9, y: 0.9 })
    expect(result[1]).toMatchObject({ id: 'b', x: 0.2, y: 0.2 })
  })

  it('returns the same array when nothing is pending', () => {
    const issues = [issue('a', 0.1, 0.1)]
    expect(applyPendingPositions(issues, {})).toBe(issues)
  })
})

describe('pruneSettled', () => {
  it('drops entries once the server position matches', () => {
    const pending = { a: { x: 0.9, y: 0.9 } }
    const result = pruneSettled(pending, [issue('a', 0.9, 0.9)])
    expect(result).toEqual({})
  })

  it('keeps entries that have not been reflected yet', () => {
    const pending = { a: { x: 0.9, y: 0.9 } }
    const result = pruneSettled(pending, [issue('a', 0.1, 0.1)])
    expect(result).toEqual(pending)
  })

  it('drops entries for issues that no longer exist', () => {
    const pending = { gone: { x: 0.9, y: 0.9 } }
    expect(pruneSettled(pending, [])).toEqual({})
  })

  it('returns the same reference when there is nothing pending', () => {
    const pending = {}
    expect(pruneSettled(pending, [])).toBe(pending)
  })
})
