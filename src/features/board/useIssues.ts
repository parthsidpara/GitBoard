import { useCallback, useEffect, useMemo, useState } from 'react'

import { subscribeToIssues, updateIssuePosition } from '@/features/board/board.service'
import { applyPendingPositions, pruneSettled, type PendingPositions } from '@/lib/optimistic'
import type { Point } from '@/lib/coord'
import type { Issue } from '@/types/models'

export function useIssues(projectId: string | undefined) {
  const [serverIssues, setServerIssues] = useState<Issue[]>([])
  const [pending, setPending] = useState<PendingPositions>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    return subscribeToIssues(projectId, (next) => {
      setServerIssues(next)
      // Clear optimistic positions once Firestore reflects them.
      setPending((previous) => pruneSettled(previous, next))
      setLoading(false)
    })
  }, [projectId])

  const moveIssue = useCallback(
    (issueId: string, position: Point) => {
      setPending((previous) => ({ ...previous, [issueId]: position }))
      if (projectId) void updateIssuePosition(projectId, issueId, position)
    },
    [projectId],
  )

  const issues = useMemo(
    () => applyPendingPositions(serverIssues, pending),
    [serverIssues, pending],
  )

  if (!projectId) return { issues: [], loading: false, moveIssue }
  return { issues, loading, moveIssue }
}
