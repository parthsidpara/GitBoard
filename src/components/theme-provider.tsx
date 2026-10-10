import { useEffect, type ReactNode } from 'react'

import { useResolvedTheme } from '@/hooks/use-resolved-theme'

/** Applies the resolved theme to <html> so CSS variables and `dark:` work. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const resolved = useResolvedTheme()

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolved === 'dark')
    root.style.colorScheme = resolved
  }, [resolved])

  return <>{children}</>
}
