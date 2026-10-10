import type { GitHubIssue, IssueInput } from '@/types/models'

const GITHUB_API = 'https://api.github.com'

export interface RepoRef {
  owner: string
  repo: string
}

/** Extract `{ owner, repo }` from a GitHub URL, or null if it is not one. */
export function parseRepoUrl(url: string): RepoRef | null {
  try {
    const { hostname, pathname } = new URL(url)
    if (!hostname.endsWith('github.com')) return null
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length < 2) return null
    return { owner: parts[0], repo: parts[1] }
  } catch {
    return null
  }
}

/** Fetch open issues for a public repository, excluding pull requests. */
export async function fetchOpenIssues(
  { owner, repo }: RepoRef,
  signal?: AbortSignal,
): Promise<GitHubIssue[]> {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/issues?state=open&per_page=100`,
    { headers: { Accept: 'application/vnd.github+json' }, signal },
  )

  if (response.status === 404) {
    throw new Error('Repository not found. Check the URL and make sure it is public.')
  }
  if (response.status === 403) {
    throw new Error('GitHub rate limit reached. Try again in a little while.')
  }
  if (!response.ok) {
    throw new Error(`Could not load issues (status ${response.status}).`)
  }

  const data = (await response.json()) as GitHubIssue[]
  return data.filter((issue) => !issue.pull_request)
}

/** Map a GitHub API issue to the app's issue shape. */
export function toIssueInput(issue: GitHubIssue): IssueInput {
  return {
    number: `#${issue.number}`,
    title: issue.title,
    url: issue.html_url,
    labels: issue.labels.map((label) => label.name),
  }
}
