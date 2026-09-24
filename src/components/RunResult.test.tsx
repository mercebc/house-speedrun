import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RunResult } from './RunResult'
import type { CleaningRun } from '../domain/runs/run.types'

function buildRun(overrides: Partial<CleaningRun> = {}): CleaningRun {
  return {
    id: 'run-1',
    taskId: 'clean-oven',
    startedAt: '2026-09-22T09:00:00.000Z',
    finishedAt: '2026-09-22T09:05:31.000Z',
    durationSeconds: 331,
    previousPersonalBestSeconds: 342,
    isPersonalBest: true,
    ...overrides,
  }
}

describe('RunResult', () => {
  it('celebrates a new personal best and shows the time saved', () => {
    render(<RunResult taskName="Clean oven" run={buildRun()} onDone={() => {}} />)

    expect(screen.getByText(/new personal best/i)).toBeInTheDocument()
    expect(screen.getByText('05:31')).toBeInTheDocument()
    expect(screen.getByText('05:42')).toBeInTheDocument()
    expect(screen.getByText(/11 seconds/i)).toBeInTheDocument()
  })

  it('celebrates a first-ever personal best without a "saved" comparison', () => {
    render(
      <RunResult
        taskName="Clean oven"
        run={buildRun({ previousPersonalBestSeconds: null, isPersonalBest: true })}
        onDone={() => {}}
      />,
    )

    expect(screen.getByText(/new personal best/i)).toBeInTheDocument()
    expect(screen.queryByText(/saved/i)).not.toBeInTheDocument()
  })

  it('shows a plain completion (no PB claim) when the run did not beat the record', () => {
    render(
      <RunResult
        taskName="Clean oven"
        run={buildRun({ durationSeconds: 400, previousPersonalBestSeconds: 342, isPersonalBest: false })}
        onDone={() => {}}
      />,
    )

    expect(screen.queryByText(/new personal best/i)).not.toBeInTheDocument()
    expect(screen.getByText('06:40')).toBeInTheDocument()
    expect(screen.getByText('05:42')).toBeInTheDocument()
  })

  it('calls onDone when dismissed', async () => {
    const onDone = vi.fn()
    const user = userEvent.setup()
    render(<RunResult taskName="Clean oven" run={buildRun()} onDone={onDone} />)

    await user.click(screen.getByRole('button', { name: /done/i }))

    expect(onDone).toHaveBeenCalled()
  })
})
