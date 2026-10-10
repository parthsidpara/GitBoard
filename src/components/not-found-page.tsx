import { Link } from 'react-router'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="font-heading text-lg font-medium">This page does not exist</h1>
      <Button asChild>
        <Link to="/">Back to your boards</Link>
      </Button>
    </div>
  )
}
