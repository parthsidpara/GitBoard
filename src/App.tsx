import { Suspense } from 'react'
import { RouterProvider } from 'react-router'

import { AppProviders } from '@/app/providers'
import { router } from '@/app/router'
import { ErrorBoundary } from '@/components/error-boundary'
import { FullScreenLoader } from '@/components/full-screen-loader'

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Suspense fallback={<FullScreenLoader />}>
          <RouterProvider router={router} />
        </Suspense>
      </AppProviders>
    </ErrorBoundary>
  )
}
