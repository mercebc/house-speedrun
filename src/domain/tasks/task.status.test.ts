import { describe, expect, it } from 'vitest'
import { getDaysOverdue, getNextDueDate, getTaskStatus } from './task.status'
import type { Task } from './task.types'

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'bathroom-full-clean',
    name: 'Bathroom full clean',
    roomId: 'bathroom',
    frequencyDays: 7,
    estimatedSeconds: 1080,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    ...overrides,
  }
}

describe('getNextDueDate', () => {
  it('returns null for a task that has never been completed', () => {
    expect(getNextDueDate(buildTask({ lastCompletedAt: null }))).toBeNull()
  })

  it('adds the frequency in days to the last completed date', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    const nextDue = getNextDueDate(task)

    expect(nextDue?.toISOString().slice(0, 10)).toBe('2026-08-08')
  })
})

describe('getDaysOverdue', () => {
  it('returns 0 for a task that has never been completed', () => {
    const task = buildTask({ lastCompletedAt: null })

    expect(getDaysOverdue(task, new Date('2026-08-22T00:00:00.000Z'))).toBe(0)
  })

  it('matches the spec example: 14 days overdue on 22 August for a job due 8 August', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    expect(getDaysOverdue(task, new Date('2026-08-22T00:00:00.000Z'))).toBe(14)
  })

  it('matches the spec example: 16 days overdue on 24 August for the same job', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    expect(getDaysOverdue(task, new Date('2026-08-24T00:00:00.000Z'))).toBe(16)
  })

  it('returns a negative number when the task is not yet due', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    expect(getDaysOverdue(task, new Date('2026-08-05T00:00:00.000Z'))).toBe(-3)
  })
})

describe('getTaskStatus', () => {
  it('is "never_done" when the task has no completion history, regardless of how old it is', () => {
    const task = buildTask({ lastCompletedAt: null, createdAt: '2020-01-01T00:00:00.000Z' })

    expect(getTaskStatus(task, new Date('2026-09-22T00:00:00.000Z'))).toBe('never_done')
  })

  it('is "not_due" when today is before the next due date', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    expect(getTaskStatus(task, new Date('2026-08-05T00:00:00.000Z'))).toBe('not_due')
  })

  it('is "due" (not "overdue") when today is exactly the due date', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    expect(getTaskStatus(task, new Date('2026-08-08T00:00:00.000Z'))).toBe('due')
  })

  it('is "overdue" the day after the due date', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    expect(getTaskStatus(task, new Date('2026-08-09T00:00:00.000Z'))).toBe('overdue')
  })

  it('is "overdue", not "super_overdue", at exactly the threshold (15 days)', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    expect(getTaskStatus(task, new Date('2026-08-23T00:00:00.000Z'))).toBe('overdue')
  })

  it('is "super_overdue" one day past the threshold (16 days)', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    expect(getTaskStatus(task, new Date('2026-08-24T00:00:00.000Z'))).toBe('super_overdue')
  })

  it('honours a custom super-overdue threshold', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })

    // Due 8 Aug; 13 Aug is 5 days overdue (at the threshold, not past it)
    expect(getTaskStatus(task, new Date('2026-08-13T00:00:00.000Z'), 5)).toBe('overdue')
    // 14 Aug is 6 days overdue (past the threshold)
    expect(getTaskStatus(task, new Date('2026-08-14T00:00:00.000Z'), 5)).toBe('super_overdue')
  })
})
