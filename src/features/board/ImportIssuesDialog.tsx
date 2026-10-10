import { useRef, useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { fetchOpenIssues, parseRepoUrl, toIssueInput } from '@/lib/github'
import { readableTextColor } from '@/lib/contrast'
import type { GitHubIssue, IssueInput } from '@/types/models'

function GithubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.94c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

interface ImportIssuesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (issues: IssueInput[]) => void | Promise<void>
}

export function ImportIssuesDialog({ open, onOpenChange, onImport }: ImportIssuesDialogProps) {
  const [repoUrl, setRepoUrl] = useState('')
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const abortRef = useRef<AbortController | null>(null)

  async function fetchIssues() {
    const repo = parseRepoUrl(repoUrl)
    if (!repo) {
      setError('Enter a repository URL like https://github.com/owner/repo')
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError('')
    setIssues([])
    setSelected(new Set())

    try {
      const result = await fetchOpenIssues(repo, controller.signal)
      setIssues(result)
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return
      setError(caught instanceof Error ? caught.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function toggle(id: number) {
    setSelected((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((previous) =>
      previous.size === issues.length ? new Set() : new Set(issues.map((issue) => issue.id)),
    )
  }

  async function importSelection(list: GitHubIssue[]) {
    if (list.length === 0) return
    await onImport(list.map(toIssueInput))
    onOpenChange(false)
  }

  const allSelected = issues.length > 0 && selected.size === issues.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GithubMark className="size-4" />
            Import GitHub issues
          </DialogTitle>
          <DialogDescription>
            Fetch open issues from any public repository and plot them on this board.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void fetchIssues()
              }
            }}
            placeholder="https://github.com/owner/repo"
          />
          <Button onClick={() => void fetchIssues()} disabled={loading || !repoUrl.trim()}>
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            Fetch
          </Button>
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {issues.length > 0 ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {issues.length} open issue{issues.length === 1 ? '' : 's'}
                {selected.size > 0 ? ` · ${selected.size} selected` : ''}
              </span>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs font-medium text-primary hover:underline"
              >
                {allSelected ? 'Clear selection' : 'Select all'}
              </button>
            </div>

            <ScrollArea className="h-72 rounded-md border">
              <ul className="divide-y">
                {issues.map((issue) => (
                  <li
                    key={issue.id}
                    className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selected.has(issue.id)}
                      onCheckedChange={() => toggle(issue.id)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{issue.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{issue.number}
                        </span>
                        {issue.labels.slice(0, 3).map((label) => {
                          const background = `#${label.color}`
                          return (
                            <span
                              key={label.id}
                              className="rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: background,
                                color: readableTextColor(background),
                              }}
                            >
                              {label.name}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </>
        ) : null}

        <DialogFooter>
          {selected.size > 0 ? (
            <Button
              onClick={() => void importSelection(issues.filter((issue) => selected.has(issue.id)))}
            >
              <Plus />
              Add selected ({selected.size})
            </Button>
          ) : (
            <Button onClick={() => void importSelection(issues)} disabled={issues.length === 0}>
              <Plus />
              Add all
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
