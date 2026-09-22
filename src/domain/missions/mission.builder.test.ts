import { describe, expect, it } from 'vitest'
import { buildMission } from './mission.builder'
import type { Task } from '../tasks/task.types'

const now = new Date('2026-09-22T09:00:00.000Z')

let counter = 0
function buildTask(overrides: Partial<Task> = {}): Task {
  counter += 1
  return {
    id: `task-${counter}`,
    name: `Task ${counter}`,
    roomId: 'kitchen',
    frequencyDays: 7,
    estimatedSeconds: 300,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    ...overrides,
  }
}

function neverDone(overrides: Partial<Task> = {}): Task {
  return buildTask({ lastCompletedAt: null, ...overrides })
}

function notDue(overrides: Partial<Task> = {}): Task {
  return buildTask({ lastCompletedAt: '2026-09-21T00:00:00.000Z', frequencyDays: 7, ...overrides })
}

function overdueBy(days: number, overrides: Partial<Task> = {}): Task {
  const lastCompletedAt = new Date(now.getTime() - (days + 7) * 86_400_000).toISOString()
  return buildTask({ lastCompletedAt, frequencyDays: 7, ...overrides })
}

describe('buildMission', () => {
  it('never exceeds the available time', () => {
    const tasks = [
      neverDone({ id: 'a', estimatedSeconds: 400 }),
      neverDone({ id: 'b', estimatedSeconds: 500 }),
      neverDone({ id: 'c', estimatedSeconds: 600 }),
      neverDone({ id: 'd', estimatedSeconds: 700 }),
    ]

    const mission = buildMission(tasks, 1000, now)

    expect(mission.totalSeconds).toBeLessThanOrEqual(1000)
  })

  it('matches the spec worked example: fills 20 minutes exactly from 7/8/8/6/5-minute jobs', () => {
    const tasks = [
      neverDone({ id: 'kitchen-counters', estimatedSeconds: 7 * 60 }),
      neverDone({ id: 'bathroom-quick-clean', estimatedSeconds: 8 * 60 }),
      neverDone({ id: 'playroom-tidy', estimatedSeconds: 8 * 60 }),
      neverDone({ id: 'coffee-table', estimatedSeconds: 6 * 60 }),
      neverDone({ id: 'kitchen-sink', estimatedSeconds: 5 * 60 }),
    ]

    const mission = buildMission(tasks, 20 * 60, now)

    expect(mission.totalSeconds).toBe(20 * 60)
  })

  it('excludes tasks that are not due yet, even if they would fit', () => {
    const tasks = [notDue({ id: 'not-due-task', estimatedSeconds: 60 })]

    const mission = buildMission(tasks, 600, now)

    expect(mission.items).toEqual([])
  })

  it('excludes inactive tasks', () => {
    const tasks = [overdueBy(5, { id: 'inactive-overdue', active: false, estimatedSeconds: 60 })]

    const mission = buildMission(tasks, 600, now)

    expect(mission.items).toEqual([])
  })

  it('prioritises an overdue task over an equally-sized never-done task when only one fits', () => {
    const overdueTask = overdueBy(10, { id: 'overdue', estimatedSeconds: 600 })
    const neverDoneTask = neverDone({ id: 'never-done', estimatedSeconds: 600 })

    const mission = buildMission([neverDoneTask, overdueTask], 600, now)

    expect(mission.items.map((t) => t.id)).toEqual(['overdue'])
  })

  it('prioritises a super-overdue task over a plain overdue task of the same size', () => {
    const superOverdueTask = overdueBy(20, { id: 'super-overdue', estimatedSeconds: 600 })
    const overdueTask = overdueBy(3, { id: 'overdue', estimatedSeconds: 600 })

    const mission = buildMission([overdueTask, superOverdueTask], 600, now)

    expect(mission.items.map((t) => t.id)).toEqual(['super-overdue'])
  })

  it('prioritises a due-today task over a never-done task of the same size', () => {
    // due today: frequency 7, last completed exactly 7 days ago
    const dueTask = buildTask({
      id: 'due-today',
      estimatedSeconds: 600,
      frequencyDays: 7,
      lastCompletedAt: new Date(now.getTime() - 7 * 86_400_000).toISOString(),
    })
    const neverDoneTask = neverDone({ id: 'never-done', estimatedSeconds: 600 })

    const mission = buildMission([neverDoneTask, dueTask], 600, now)

    expect(mission.items.map((t) => t.id)).toEqual(['due-today'])
  })

  it('reports no eligible tasks when nothing is due', () => {
    const tasks = [notDue({ id: 'a' }), notDue({ id: 'b' })]

    const mission = buildMission(tasks, 1200, now)

    expect(mission.items).toEqual([])
    expect(mission.hadEligibleTasks).toBe(false)
  })

  it('reports eligible tasks existed even when none fit the available time', () => {
    const tasks = [overdueBy(5, { id: 'too-long', estimatedSeconds: 3000 })]

    const mission = buildMission(tasks, 600, now)

    expect(mission.items).toEqual([])
    expect(mission.hadEligibleTasks).toBe(true)
  })

  it('returns an empty mission for an empty task list', () => {
    const mission = buildMission([], 1200, now)

    expect(mission.items).toEqual([])
    expect(mission.hadEligibleTasks).toBe(false)
  })

  it('groups tasks from the same room together rather than interleaving rooms', () => {
    // Two kitchen tasks (higher priority) and one bathroom task (lower priority) in between
    const kitchenA = overdueBy(10, { id: 'kitchen-a', roomId: 'kitchen', estimatedSeconds: 300 })
    const bathroomA = overdueBy(6, { id: 'bathroom-a', roomId: 'bathroom', estimatedSeconds: 300 })
    const kitchenB = overdueBy(2, { id: 'kitchen-b', roomId: 'kitchen', estimatedSeconds: 300 })

    const mission = buildMission([kitchenA, bathroomA, kitchenB], 900, now)

    expect(mission.items.map((t) => t.id)).toEqual(['kitchen-a', 'kitchen-b', 'bathroom-a'])
  })
})
