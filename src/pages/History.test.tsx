import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { History } from './History'
import { StorageProvider } from '../storage/StorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import type { Task } from '../domain/tasks/task.types'
import type { CleaningRun } from '../domain/runs/run.types'

const now = new Date('2026-09-22T18:00:00.000Z')

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task',
    name: 'Task',
    roomId: 'kitchen',
    frequencyDays: 7,
    estimatedSeconds: 420,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    ...overrides,
  }
}

function buildRun(overrides: Partial<CleaningRun> = {}): CleaningRun {
  return {
    id: 'run',
    taskId: 'task',
    startedAt: '2026-09-22T09:00:00.000Z',
    finishedAt: '2026-09-22T09:05:31.000Z',
    durationSeconds: 331,
    previousPersonalBestSeconds: null,
    isPersonalBest: false,
    ...overrides,
  }
}

function renderHistory(tasks: Task[], runs: CleaningRun[]) {
  const storage = createFakeStorage({ tasks, runs })
  render(
    <MemoryRouter>
      <StorageProvider storage={storage}>
        <History now={now} />
      </StorageProvider>
    </MemoryRouter>,
  )
}

describe('History page', () => {
  it('groups runs by day, most recent first', async () => {
    const tasks = [buildTask({ id: 'kitchen-counters', name: 'Kitchen counters' }), buildTask({ id: 'kitchen-sink', name: 'Kitchen sink' })]
    const runs = [
      buildRun({ id: 'r1', taskId: 'kitchen-counters', finishedAt: '2026-09-22T09:05:31.000Z' }),
      buildRun({ id: 'r2', taskId: 'kitchen-sink', finishedAt: '2026-09-21T09:05:31.000Z' }),
    ]
    render(
      <MemoryRouter>
        <StorageProvider storage={createFakeStorage({ tasks, runs })}>
          <History now={now} />
        </StorageProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Yesterday' })).toBeInTheDocument()
    const todayGroup = screen.getByRole('heading', { name: 'Today' }).closest('section')!
    expect(within(todayGroup).getByText('Kitchen counters')).toBeInTheDocument()
    const yesterdayGroup = screen.getByRole('heading', { name: 'Yesterday' }).closest('section')!
    expect(within(yesterdayGroup).getByText('Kitchen sink')).toBeInTheDocument()
  })

  it('shows the duration and a trophy for personal bests', async () => {
    const tasks = [buildTask({ id: 'task', name: 'Kitchen counters' })]
    const runs = [buildRun({ durationSeconds: 331, isPersonalBest: true })]
    renderHistory(tasks, runs)

    expect(await screen.findByText('05:31')).toBeInTheDocument()
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('does not show a trophy for a non-PB run', async () => {
    const tasks = [buildTask({ id: 'task', name: 'Kitchen counters' })]
    const runs = [buildRun({ isPersonalBest: false })]
    renderHistory(tasks, runs)

    await screen.findByText('Kitchen counters')
    expect(screen.queryByText('🏆')).not.toBeInTheDocument()
  })

  it('shows an empty state when there are no runs', async () => {
    renderHistory([], [])

    expect(await screen.findByText(/no runs yet/i)).toBeInTheDocument()
  })

  it('filters to the last 7 days', async () => {
    const tasks = [buildTask({ id: 'task', name: 'Recent job' }), buildTask({ id: 'task-2', name: 'Old job' })]
    const runs = [
      buildRun({ id: 'recent', taskId: 'task', finishedAt: '2026-09-20T09:00:00.000Z' }),
      buildRun({ id: 'old', taskId: 'task-2', finishedAt: '2026-08-01T09:00:00.000Z' }),
    ]
    const user = userEvent.setup()
    renderHistory(tasks, runs)
    await screen.findByText('Recent job')
    expect(screen.getByText('Old job')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '7 days' }))

    expect(screen.getByText('Recent job')).toBeInTheDocument()
    expect(screen.queryByText('Old job')).not.toBeInTheDocument()
  })

  it('filters to today only', async () => {
    const tasks = [buildTask({ id: 'task', name: 'Today job' }), buildTask({ id: 'task-2', name: 'Yesterday job' })]
    const runs = [
      buildRun({ id: 'r1', taskId: 'task', finishedAt: '2026-09-22T09:00:00.000Z' }),
      buildRun({ id: 'r2', taskId: 'task-2', finishedAt: '2026-09-21T09:00:00.000Z' }),
    ]
    const user = userEvent.setup()
    renderHistory(tasks, runs)
    await screen.findByText('Today job')

    await user.click(screen.getByRole('button', { name: 'Today' }))

    expect(screen.getByText('Today job')).toBeInTheDocument()
    expect(screen.queryByText('Yesterday job')).not.toBeInTheDocument()
  })
})
