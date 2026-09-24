import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Stats } from './Stats'
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
    supplyIds: [],
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

function renderStats(tasks: Task[], runs: CleaningRun[]) {
  const storage = createFakeStorage({ tasks, runs })
  render(
    <StorageProvider storage={storage}>
      <Stats now={now} />
    </StorageProvider>,
  )
}

describe('Stats page', () => {
  it('shows total cleaning time for the last 7 days', async () => {
    const tasks = [buildTask()]
    const runs = [
      buildRun({ id: 'r1', durationSeconds: 4200, finishedAt: '2026-09-21T09:00:00.000Z' }), // 1h 10m
      buildRun({ id: 'r2', durationSeconds: 3840, finishedAt: '2026-09-20T09:00:00.000Z' }), // 1h 4m
      buildRun({ id: 'too-old', durationSeconds: 999_999, finishedAt: '2026-08-01T09:00:00.000Z' }),
    ]
    renderStats(tasks, runs)

    expect(await screen.findByText('2h 14m')).toBeInTheDocument()
  })

  it('counts runs and personal bests in the last 7 days', async () => {
    const tasks = [buildTask()]
    const runs = [
      buildRun({ id: 'r1', isPersonalBest: true, finishedAt: '2026-09-21T09:00:00.000Z' }),
      buildRun({ id: 'r2', isPersonalBest: false, finishedAt: '2026-09-20T09:00:00.000Z' }),
      buildRun({ id: 'too-old', isPersonalBest: true, finishedAt: '2026-08-01T09:00:00.000Z' }),
    ]
    renderStats(tasks, runs)

    expect(await screen.findByText('2')).toBeInTheDocument()
    expect(screen.getByText('1 🏆')).toBeInTheDocument()
  })

  it('shows the current streak', async () => {
    const tasks = [buildTask()]
    const runs = [
      buildRun({ id: 'r1', finishedAt: '2026-09-22T09:00:00.000Z' }),
      buildRun({ id: 'r2', finishedAt: '2026-09-21T09:00:00.000Z' }),
      buildRun({ id: 'r3', finishedAt: '2026-09-20T09:00:00.000Z' }),
    ]
    renderStats(tasks, runs)

    expect(await screen.findByText('3 days')).toBeInTheDocument()
  })

  it('shows the most improved task', async () => {
    const tasks = [buildTask({ id: 'kitchen-counters', name: 'Kitchen counters' })]
    const runs = [
      buildRun({
        taskId: 'kitchen-counters',
        isPersonalBest: true,
        previousPersonalBestSeconds: 434,
        durationSeconds: 331,
        finishedAt: '2026-09-22T09:00:00.000Z',
      }),
    ]
    renderStats(tasks, runs)

    expect(await screen.findByText('Kitchen counters')).toBeInTheDocument()
    expect(screen.getByText('07:14')).toBeInTheDocument()
    expect(screen.getByText('05:31')).toBeInTheDocument()
    expect(screen.getByText('01:43')).toBeInTheDocument()
  })

  it('omits the most-improved card when nothing has improved yet', async () => {
    const tasks = [buildTask({ id: 'task', name: 'Task' })]
    const runs = [buildRun({ taskId: 'task', isPersonalBest: true, previousPersonalBestSeconds: null })]
    renderStats(tasks, runs)

    await screen.findByText('1 day')
    expect(screen.queryByText(/most improved/i)).not.toBeInTheDocument()
  })

  it('handles having no runs at all', async () => {
    renderStats([], [])

    expect(await screen.findByText('0m')).toBeInTheDocument()
    expect(screen.getByText('0 days')).toBeInTheDocument()
  })
})
