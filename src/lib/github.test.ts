import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchOpenIssues, parseRepoUrl, toIssueInput } from '@/lib/github'
import type { GitHubIssue } from '@/types/models'

describe('parseRepoUrl', () => {
  it('parses the owner and repo from a GitHub URL', () => {
    expect(parseRepoUrl('https://github.com/facebook/react')).toEqual({
      owner: 'facebook',
      repo: 'react',
    })
  })

  it('rejects non-GitHub hosts', () => {
    expect(parseRepoUrl('https://gitlab.com/facebook/react')).toBeNull()
  })

  it('rejects malformed input', () => {
    expect(parseRepoUrl('not a url')).toBeNull()
  })

  it('rejects an incomplete path', () => {
    expect(parseRepoUrl('https://github.com/facebook')).toBeNull()
  })
})

describe('toIssueInput', () => {
  it('formats a GitHub issue into the app issue shape', () => {
    const issue: GitHubIssue = {
      id: 1,
      number: 12,
      title: 'Login is broken',
      html_url: 'https://github.com/a/b/issues/12',
      labels: [{ id: 9, name: 'bug', color: 'ff0000' }],
    }
    expect(toIssueInput(issue)).toEqual({
      number: '#12',
      title: 'Login is broken',
      url: 'https://github.com/a/b/issues/12',
      labels: ['bug'],
    })
  })
})

describe('fetchOpenIssues', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('drops pull requests from the results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [
          { id: 1, number: 1, title: 'a real issue', html_url: '', labels: [] },
          { id: 2, number: 2, title: 'a pull request', html_url: '', labels: [], pull_request: {} },
        ],
      }),
    )

    const issues = await fetchOpenIssues({ owner: 'a', repo: 'b' })
    expect(issues).toHaveLength(1)
    expect(issues[0].title).toBe('a real issue')
  })

  it('throws a helpful error when the repository is missing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => [] }),
    )
    await expect(fetchOpenIssues({ owner: 'a', repo: 'b' })).rejects.toThrow(/not found/i)
  })
})
