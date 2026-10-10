import { describe, expect, it } from 'vitest'

import { clamp01, quadrantOf, toNormalized, toScreen } from '@/lib/coord'
import type { Point } from '@/lib/coord'

describe('toNormalized', () => {
  it('maps the bottom-left corner to (0, 0)', () => {
    expect(toNormalized({ x: 0, y: 400 }, { width: 800, height: 400 })).toEqual({ x: 0, y: 0 })
  })

  it('maps the top-right corner to (1, 1)', () => {
    expect(toNormalized({ x: 800, y: 0 }, { width: 800, height: 400 })).toEqual({ x: 1, y: 1 })
  })

  it('falls back to the centre when the canvas has no size yet', () => {
    expect(toNormalized({ x: 10, y: 10 }, { width: 0, height: 0 })).toEqual({ x: 0.5, y: 0.5 })
  })
})

describe('toScreen', () => {
  it('is the inverse of toNormalized', () => {
    expect(toScreen({ x: 0.25, y: 0.75 }, { width: 800, height: 400 })).toEqual({ x: 200, y: 100 })
  })
})

describe('quadrantOf', () => {
  it.each<[Point, string]>([
    [{ x: 0.25, y: 0.75 }, 'do'],
    [{ x: 0.75, y: 0.75 }, 'schedule'],
    [{ x: 0.25, y: 0.25 }, 'delegate'],
    [{ x: 0.75, y: 0.25 }, 'delete'],
  ])('classifies %o as %s', (point, expected) => {
    expect(quadrantOf(point)).toBe(expected)
  })
})

describe('clamp01', () => {
  it('clamps values into the 0..1 range', () => {
    expect(clamp01(-0.5)).toBe(0)
    expect(clamp01(1.5)).toBe(1)
    expect(clamp01(0.4)).toBe(0.4)
  })
})
