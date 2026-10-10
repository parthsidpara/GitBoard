/**
 * A curated palette for auto-creating labels during issue import, so imported
 * labels look intentional rather than random. All values are hex so they can be
 * round-tripped through `<input type="color">`.
 */
const LABEL_PALETTE = [
  '#e5484d',
  '#e546a5',
  '#8e4ec6',
  '#6e56cf',
  '#3e63dd',
  '#0090ff',
  '#12a594',
  '#30a46c',
  '#f76808',
  '#8d8d8d',
] as const

export function randomLabelColor(): string {
  const index = Math.floor(Math.random() * LABEL_PALETTE.length)
  return LABEL_PALETTE[index]
}
