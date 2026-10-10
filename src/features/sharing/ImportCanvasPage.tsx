import { useEffect, useState } from 'react'
import { Download, Frown } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { FullScreenLoader } from '@/components/full-screen-loader'
import { useAuth } from '@/features/auth/auth-context'
import { getSharedCanvas, importSharedCanvas } from '@/features/sharing/sharing.service'
import type { SharedCanvas } from '@/types/models'

type Status = 'loading' | 'ready' | 'missing' | 'error'

export function ImportCanvasPage() {
  const { shareId } = useParams<{ shareId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [canvas, setCanvas] = useState<SharedCanvas | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (!shareId) return
    let active = true
    getSharedCanvas(shareId)
      .then((result) => {
        if (!active) return
        if (result) {
          setCanvas(result)
          setStatus('ready')
        } else {
          setStatus('missing')
        }
      })
      .catch(() => active && setStatus('error'))
    return () => {
      active = false
    }
  }, [shareId])

  async function handleImport() {
    if (!user || !canvas || !shareId) return
    setImporting(true)
    try {
      const projectId = await importSharedCanvas(shareId, user.uid, canvas)
      toast.success('Board imported')
      navigate(`/board/${projectId}`)
    } catch {
      toast.error('Could not import this board. Please try again.')
      setImporting(false)
    }
  }

  if (status === 'loading') return <FullScreenLoader />

  if (status === 'missing' || status === 'error') {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
        <Frown className="size-8 text-muted-foreground" />
        <h1 className="font-heading text-lg font-medium">This board is not available</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {status === 'missing'
            ? 'The link may be incorrect, or the board was removed.'
            : 'Something went wrong while loading the board.'}
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Go to my boards
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="font-heading text-lg font-medium">Import shared board</h1>
        <div className="my-5 rounded-lg border bg-muted/40 p-4">
          <p className="font-medium">{canvas?.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This adds a copy to your account. Your own boards are unaffected.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => void handleImport()} disabled={importing}>
            <Download />
            {importing ? 'Importing...' : 'Import to my account'}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
