import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MissionStepResult } from './MissionStepResult'
import type { CleaningRun } from '../domain/runs/run.types'

function buildRun(overrides: Partial<CleaningRun> = {}): CleaningRun {
  return {
    id: 'run-1',
    taskId: 'kitchen-counters',
    startedAt: '2026-09-22T09:00:00.000Z',
    finishedAt: '2026-09-22T09:05:31.000Z',
    durationSeconds: 331,
    previousPersonalBestSeconds: 342,
    isPersonalBest: true,
    ...overrides,
  }
}

describe('MissionStepResult', () => {
  it('celebrates a new personal best', () => {
    render(<MissionStepResult run={buildRun({ isPersonalBest: true })} nextTaskName="Kitchen sink" onNext={() => {}} />)

    expect(screen.getByText(/new pb/i)).toBeInTheDocument()
    expect(screen.getByText('05:31')).toBeInTheDocument()
  })

  it('shows a plain completion when it was not a personal best', () => {
    render(
      <MissionStepResult
        run={buildRun({ isPersonalBest: false })}
        nextTaskName="Kitchen sink"
        onNext={() => {}}
      />,
    )

    expect(screen.queryByText(/new pb/i)).not.toBeInTheDocument()
    expect(screen.getByText('05:31')).toBeInTheDocument()
  })

  it('shows the name of the next task', () => {
    render(<MissionStepResult run={buildRun()} nextTaskName="Kitchen sink" onNext={() => {}} />)

    expect(screen.getByText('Kitchen sink')).toBeInTheDocument()
  })

  it('calls onNext when "Start next" is pressed', async () => {
    const onNext = vi.fn()
    const user = userEvent.setup()
    render(<MissionStepResult run={buildRun()} nextTaskName="Kitchen sink" onNext={onNext} />)

    await user.click(screen.getByRole('button', { name: /start next/i }))

    expect(onNext).toHaveBeenCalled()
  })
})
