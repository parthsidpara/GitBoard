import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ImportIssuesDialog } from '@/features/board/ImportIssuesDialog'

const repoInput = () => screen.getByPlaceholderText(/github\.com\/owner\/repo/i)

describe('ImportIssuesDialog', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches issues and imports them as the app issue shape', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [
          {
            id: 1,
            number: 7,
            title: 'First issue',
            html_url: 'https://github.com/a/b/issues/7',
            labels: [{ id: 2, name: 'bug', color: 'ff0000' }],
          },
        ],
      }),
    )

    const onImport = vi.fn()
    render(<ImportIssuesDialog open onOpenChange={vi.fn()} onImport={onImport} />)

    await user.type(repoInput(), 'https://github.com/a/b')
    await user.click(screen.getByRole('button', { name: /fetch/i }))

    expect(await screen.findByText('First issue')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /add all/i }))

    await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1))
    expect(onImport.mock.calls[0][0]).toEqual([
      {
        number: '#7',
        title: 'First issue',
        url: 'https://github.com/a/b/issues/7',
        labels: ['bug'],
      },
    ])
  })

  it('shows an error for an invalid repository URL', async () => {
    const user = userEvent.setup()
    render(<ImportIssuesDialog open onOpenChange={vi.fn()} onImport={vi.fn()} />)

    await user.type(repoInput(), 'not a repository')
    await user.click(screen.getByRole('button', { name: /fetch/i }))

    expect(await screen.findByText(/enter a repository url/i)).toBeInTheDocument()
  })
})
