import { describe, expect, it } from 'vitest'
import { markTaskCompleted } from './task.service'
import type { Task } from './task.types'

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'clean-oven',
    name: 'Clean oven',
    roomId: 'kitchen',
    frequencyDays: 30,
    estimatedSeconds: 1500,
    personalBestSeconds: 1200,
    lastCompletedAt: '2026-08-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    supplyIds: [],
    ...overrides,
  }
}

describe('markTaskCompleted', () => {
  it('sets lastCompletedAt to the given date, without touching anything else', () => {
    const task = buildTask({ lastCompletedAt: null })
    const completedAt = new Date('2026-09-20T00:00:00.000Z')

    const updated = markTaskCompleted(task, completedAt)

    expect(updated).toEqual({ ...task, lastCompletedAt: '2026-09-20T00:00:00.000Z' })
  })

  it('does not record a personal best, since no duration was timed', () => {
    const task = buildTask({ personalBestSeconds: 1200 })

    const updated = markTaskCompleted(task, new Date('2026-09-20T00:00:00.000Z'))

    expect(updated.personalBestSeconds).toBe(1200)
  })

  it('overrides a previous completion date when logged again', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z' })

    const updated = markTaskCompleted(task, new Date('2026-09-20T00:00:00.000Z'))

    expect(updated.lastCompletedAt).toBe('2026-09-20T00:00:00.000Z')
  })
})
