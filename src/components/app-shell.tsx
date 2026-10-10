import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Outlet } from 'react-router'

import { Button } from '@/components/ui/button'
import { ProjectsRail } from '@/features/projects/ProjectsRail'
import { cn } from '@/lib/utils'

/** The authenticated app frame: a collapsible projects rail plus the board area. */
export function AppShell() {
  const [railOpen, setRailOpen] = useState(false)

  return (
    <div className="flex h-svh overflow-hidden">
      {railOpen ? (
        <div
          aria-hidden
          onClick={() => setRailOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      ) : null}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 transition-transform md:static md:translate-x-0',
          railOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <ProjectsRail onNavigate={() => setRailOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b p-2 md:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Open menu"
            onClick={() => setRailOpen(true)}
          >
            <Menu />
          </Button>
          <span className="font-heading text-sm font-medium">GitBoard</span>
        </div>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
