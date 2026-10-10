import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import { AppShell } from '@/components/app-shell'
import { NotFoundPage } from '@/components/not-found-page'
import { RequireAuth } from '@/features/auth/RequireAuth'

// Route components load on demand so the initial bundle stays small.
const Login = lazy(() => import('@/features/auth/Login').then((m) => ({ default: m.Login })))
const BoardPage = lazy(() =>
  import('@/features/board/BoardPage').then((m) => ({ default: m.BoardPage })),
)
const DashboardPage = lazy(() =>
  import('@/features/projects/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const ImportCanvasPage = lazy(() =>
  import('@/features/sharing/ImportCanvasPage').then((m) => ({ default: m.ImportCanvasPage })),
)

export const router = createBrowserRouter([
  { path: '/login', Component: Login },
  {
    path: '/import/:shareId',
    element: (
      <RequireAuth>
        <ImportCanvasPage />
      </RequireAuth>
    ),
  },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, Component: DashboardPage },
      { path: 'board/:projectId', Component: BoardPage },
    ],
  },
  { path: '*', Component: NotFoundPage },
])
