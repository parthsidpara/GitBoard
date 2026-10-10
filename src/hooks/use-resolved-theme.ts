import { useEffect, useState } from 'react'

import { resolveTheme, useThemeStore, type ResolvedTheme } from '@/store/theme'

/** The current theme with `system` already resolved to light or dark. */
export function useResolvedTheme(): ResolvedTheme {
  const preference = useThemeStore((state) => state.theme)
  const [prefersDark, setPrefersDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return resolveTheme(preference, prefersDark)
}
