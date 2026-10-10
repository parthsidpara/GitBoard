const DARK_TEXT = '#0b0e14'
const LIGHT_TEXT = '#ffffff'

/** Parse `#rrggbb` or `rrggbb` (and `#rgb`) into RGB, or null if unparseable. */
function parseHexColor(color: string): [number, number, number] | null {
  let hex = color.trim().replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }
  if (hex.length !== 6 || /[^0-9a-f]/i.test(hex)) return null
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ]
}

function channelLuminance(value: number): number {
  const channel = value / 255
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

/**
 * Pick a readable text colour (near-black or white) for a given background,
 * using WCAG relative luminance. Falls back to white for unknown formats.
 */
export function readableTextColor(background: string): string {
  const rgb = parseHexColor(background)
  if (!rgb) return LIGHT_TEXT
  const [r, g, b] = rgb
  const luminance =
    0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
  // 0.179 is the luminance at which contrast against black and white are equal.
  return luminance > 0.179 ? DARK_TEXT : LIGHT_TEXT
}
