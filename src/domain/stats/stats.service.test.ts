import { describe, expect, it } from 'vitest'
import {
  getCurrentStreak,
  getMostImprovedTask,
  getPersonalBestCount,
  getRunsSince,
  getTotalCleaningSeconds,
} from './stats.service'
import type { CleaningRun } from '../runs/run.types'
import type { Task } from '../tasks/task.types'

const now = new Date('2026-09-22T18:00:00.000Z')

function buildRun(overrides: Partial<CleaningRun> = {}): CleaningRun {
  return {
    id: 'run',
    taskId: 'clean-oven',
    startedAt: '2026-09-22T09:00:00.000Z',
    finishedAt: '2026-09-22T09:10:00.000Z',
    durationSeconds: 600,
    previousPersonalBestSeconds: null,
    isPersonalBest: true,
    ...overrides,
  }
}

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'clean-oven',
    name: 'Clean oven',
    roomId: 'kitchen',
    frequencyDays: 30,
    estimatedSeconds: 1500,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    supplyIds: [],
    ...overrides,
  }
}

describe('getRunsSince', () => {
  it('keeps only runs finished on or after the cutoff', () => {
    const runs = [
      buildRun({ id: 'old', finishedAt: '2026-09-01T00:00:00.000Z' }),
      buildRun({ id: 'new', finishedAt: '2026-09-22T00:00:00.000Z' }),
    ]

    const result = getRunsSince(runs, new Date('2026-09-15T00:00:00.000Z'))

    expect(result.map((r) => r.id)).toEqual(['new'])
  })
})

describe('getTotalCleaningSeconds', () => {
  it('sums the duration of every run given', () => {
    const runs = [buildRun({ durationSeconds: 300 }), buildRun({ durationSeconds: 700 })]

    expect(getTotalCleaningSeconds(runs)).toBe(1000)
  })

  it('returns 0 for no runs', () => {
    expect(getTotalCleaningSeconds([])).toBe(0)
  })
})

describe('getPersonalBestCount', () => {
  it('counts only the runs that were a personal best', () => {
    const runs = [
      buildRun({ isPersonalBest: true }),
      buildRun({ isPersonalBest: false }),
      buildRun({ isPersonalBest: true }),
    ]

    expect(getPersonalBestCount(runs)).toBe(2)
  })
})

describe('getCurrentStreak', () => {
  it('is 0 with no runs at all', () => {
    expect(getCurrentStreak([], now)).toBe(0)
  })

  it('counts consecutive days with a run, ending today', () => {
    const runs = [
      buildRun({ finishedAt: '2026-09-22T08:00:00.000Z' }), // today
      buildRun({ finishedAt: '2026-09-21T08:00:00.000Z' }), // yesterday
      buildRun({ finishedAt: '2026-09-20T08:00:00.000Z' }),
    ]

    expect(getCurrentStreak(runs, now)).toBe(3)
  })

  it('still counts the streak as unbroken if today has no run yet, as long as yesterday does', () => {
    const runs = [
      buildRun({ finishedAt: '2026-09-21T08:00:00.000Z' }), // yesterday
      buildRun({ finishedAt: '2026-09-20T08:00:00.000Z' }),
    ]

    expect(getCurrentStreak(runs, now)).toBe(2)
  })

  it('is broken by a gap day', () => {
    const runs = [
      buildRun({ finishedAt: '2026-09-22T08:00:00.000Z' }), // today
      buildRun({ finishedAt: '2026-09-19T08:00:00.000Z' }), // 3 days ago — gap
    ]

    expect(getCurrentStreak(runs, now)).toBe(1)
  })

  it('is 0 when the most recent run was before yesterday', () => {
    const runs = [buildRun({ finishedAt: '2026-09-15T08:00:00.000Z' })]

    expect(getCurrentStreak(runs, now)).toBe(0)
  })

  it('counts a day only once even with multiple runs that day', () => {
    const runs = [
      buildRun({ finishedAt: '2026-09-22T08:00:00.000Z' }),
      buildRun({ finishedAt: '2026-09-22T14:00:00.000Z' }),
    ]

    expect(getCurrentStreak(runs, now)).toBe(1)
  })
})

describe('getMostImprovedTask', () => {
  it('returns null when nothing has improved yet', () => {
    const tasks = [buildTask({ id: 'a' })]
    const runs = [buildRun({ taskId: 'a', isPersonalBest: true, previousPersonalBestSeconds: null })]

    expect(getMostImprovedTask(tasks, runs)).toBeNull()
  })

  it('picks the task with the largest improvement', () => {
    const tasks = [buildTask({ id: 'a', name: 'Task A' }), buildTask({ id: 'b', name: 'Task B' })]
    const runs = [
      buildRun({ taskId: 'a', isPersonalBest: true, previousPersonalBestSeconds: 400, durationSeconds: 390 }), // improved by 10
      buildRun({ taskId: 'b', isPersonalBest: true, previousPersonalBestSeconds: 500, durationSeconds: 400 }), // improved by 100
    ]

    const result = getMostImprovedTask(tasks, runs)

    expect(result?.task.id).toBe('b')
    expect(result?.improvement).toEqual({ oldSeconds: 500, newSeconds: 400, improvementSeconds: 100 })
  })
})
