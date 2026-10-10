import type { Label } from '@/types/models'

/** Built-in labels every user starts with. Kept as a single source of truth. */
export const DEFAULT_LABELS: Label[] = [
  { id: 'default-bug', name: 'Bug', color: '#ef4444' },
  { id: 'default-enhancement', name: 'Enhancement', color: '#22c55e' },
  { id: 'default-chore', name: 'Chore', color: '#6b7280' },
  { id: 'default-question', name: 'Question', color: '#a855f7' },
  { id: 'default-docs', name: 'Docs', color: '#3b82f6' },
]

export const FALLBACK_LABEL_COLOR = '#6b7280'

/** Resolve a label name to its colour, falling back to a neutral grey. */
export function colorForLabel(labels: Label[], name: string): string {
  return labels.find((label) => label.name === name)?.color ?? FALLBACK_LABEL_COLOR
}
