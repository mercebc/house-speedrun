import { describe, expect, it } from 'vitest'
import { calculatePersonalBest, finishRun, getTaskAverage, getTaskImprovement } from './run.service'
import type { Task } from '../tasks/task.types'
import type { CleaningRun } from './run.types'

function buildRun(overrides: Partial<CleaningRun> = {}): CleaningRun {
  return {
    id: 'run',
    taskId: 'clean-oven',
    startedAt: '2026-09-01T09:00:00.000Z',
    finishedAt: '2026-09-01T09:10:00.000Z',
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
    ...overrides,
  }
}

describe('finishRun', () => {
  it('records the elapsed duration between start and finish', () => {
    const task = buildTask()
    const startedAt = new Date('2026-09-22T09:00:00.000Z')
    const finishedAt = new Date('2026-09-22T09:05:31.000Z')

    const { run } = finishRun(task, startedAt, finishedAt, 'run-1')

    expect(run).toEqual({
      id: 'run-1',
      taskId: 'clean-oven',
      startedAt: '2026-09-22T09:00:00.000Z',
      finishedAt: '2026-09-22T09:05:31.000Z',
      durationSeconds: 331,
      previousPersonalBestSeconds: null,
      isPersonalBest: true,
    })
  })

  it('is a personal best when there was no previous time', () => {
    const task = buildTask({ personalBestSeconds: null })
    const startedAt = new Date('2026-09-22T09:00:00.000Z')
    const finishedAt = new Date('2026-09-22T09:10:00.000Z')

    const { run, updatedTask } = finishRun(task, startedAt, finishedAt, 'run-1')

    expect(run.isPersonalBest).toBe(true)
    expect(updatedTask.personalBestSeconds).toBe(600)
  })

  it('is a personal best when the new time beats the old one', () => {
    const task = buildTask({ personalBestSeconds: 700 })
    const startedAt = new Date('2026-09-22T09:00:00.000Z')
    const finishedAt = new Date('2026-09-22T09:10:00.000Z') // 600s

    const { run, updatedTask } = finishRun(task, startedAt, finishedAt, 'run-1')

    expect(run.isPersonalBest).toBe(true)
    expect(run.previousPersonalBestSeconds).toBe(700)
    expect(updatedTask.personalBestSeconds).toBe(600)
  })

  it('is not a personal best when the new time is slower', () => {
    const task = buildTask({ personalBestSeconds: 500 })
    const startedAt = new Date('2026-09-22T09:00:00.000Z')
    const finishedAt = new Date('2026-09-22T09:10:00.000Z') // 600s

    const { run, updatedTask } = finishRun(task, startedAt, finishedAt, 'run-1')

    expect(run.isPersonalBest).toBe(false)
    expect(updatedTask.personalBestSeconds).toBe(500)
  })

  it('is not a personal best when the new time exactly ties the old one', () => {
    const task = buildTask({ personalBestSeconds: 600 })
    const startedAt = new Date('2026-09-22T09:00:00.000Z')
    const finishedAt = new Date('2026-09-22T09:10:00.000Z') // 600s

    const { run } = finishRun(task, startedAt, finishedAt, 'run-1')

    expect(run.isPersonalBest).toBe(false)
  })

  it('sets lastCompletedAt on the updated task to the finish time', () => {
    const task = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z' })
    const finishedAt = new Date('2026-09-22T09:10:00.000Z')

    const { updatedTask } = finishRun(task, new Date('2026-09-22T09:00:00.000Z'), finishedAt, 'run-1')

    expect(updatedTask.lastCompletedAt).toBe('2026-09-22T09:10:00.000Z')
  })

  it('does not mutate the original task', () => {
    const task = buildTask({ personalBestSeconds: 700 })

    finishRun(task, new Date('2026-09-22T09:00:00.000Z'), new Date('2026-09-22T09:10:00.000Z'), 'run-1')

    expect(task.personalBestSeconds).toBe(700)
  })
})

describe('calculatePersonalBest', () => {
  it('returns null when there are no runs', () => {
    expect(calculatePersonalBest([])).toBeNull()
  })

  it('returns the fastest duration among the runs', () => {
    const runs = [buildRun({ durationSeconds: 600 }), buildRun({ durationSeconds: 420 }), buildRun({ durationSeconds: 500 })]

    expect(calculatePersonalBest(runs)).toBe(420)
  })
})

describe('getTaskAverage', () => {
  it('returns null when there are no runs', () => {
    expect(getTaskAverage([])).toBeNull()
  })

  it('returns the mean duration across the runs', () => {
    const runs = [buildRun({ durationSeconds: 600 }), buildRun({ durationSeconds: 400 }), buildRun({ durationSeconds: 500 })]

    expect(getTaskAverage(runs)).toBe(500)
  })

  it('rounds to the nearest second', () => {
    const runs = [buildRun({ durationSeconds: 100 }), buildRun({ durationSeconds: 101 })]

    expect(getTaskAverage(runs)).toBe(101)
  })
})

describe('getTaskImprovement', () => {
  it('returns null when no run ever beat a previous personal best', () => {
    const runs = [buildRun({ isPersonalBest: true, previousPersonalBestSeconds: null })]

    expect(getTaskImprovement(runs)).toBeNull()
  })

  it('returns null when there are no runs', () => {
    expect(getTaskImprovement([])).toBeNull()
  })

  it('compares the most recent PB-setting run against the time it beat', () => {
    const runs = [
      buildRun({
        finishedAt: '2026-09-01T09:00:00.000Z',
        durationSeconds: 434,
        previousPersonalBestSeconds: null,
        isPersonalBest: true,
      }),
      buildRun({
        finishedAt: '2026-09-18T09:00:00.000Z',
        durationSeconds: 342,
        previousPersonalBestSeconds: 434,
        isPersonalBest: true,
      }),
      buildRun({
        finishedAt: '2026-09-22T09:00:00.000Z',
        durationSeconds: 331,
        previousPersonalBestSeconds: 342,
        isPersonalBest: true,
      }),
    ]

    expect(getTaskImprovement(runs)).toEqual({ oldSeconds: 342, newSeconds: 331, improvementSeconds: 11 })
  })

  it('ignores non-PB runs when finding the most recent improvement', () => {
    const runs = [
      buildRun({
        finishedAt: '2026-09-18T09:00:00.000Z',
        durationSeconds: 342,
        previousPersonalBestSeconds: 434,
        isPersonalBest: true,
      }),
      buildRun({
        finishedAt: '2026-09-22T09:00:00.000Z',
        durationSeconds: 400,
        previousPersonalBestSeconds: null,
        isPersonalBest: false,
      }),
    ]

    expect(getTaskImprovement(runs)).toEqual({ oldSeconds: 434, newSeconds: 342, improvementSeconds: 92 })
  })
})
