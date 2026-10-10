import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LABELS,
  FALLBACK_LABEL_COLOR,
  colorForLabel,
} from '@/features/labels/default-labels'

describe('colorForLabel', () => {
  it('resolves a known label to its colour', () => {
    expect(colorForLabel(DEFAULT_LABELS, 'Bug')).toBe('#ef4444')
  })

  it('falls back to a neutral grey for an unknown label', () => {
    expect(colorForLabel(DEFAULT_LABELS, 'nonexistent')).toBe(FALLBACK_LABEL_COLOR)
  })
})
