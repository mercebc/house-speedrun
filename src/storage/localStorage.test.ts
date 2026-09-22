import { beforeEach, describe, expect, it } from 'vitest'
import { createLocalStorageService } from './localStorage'
import { DEFAULT_SETTINGS } from './storage'
import { seedRooms } from '../data/seedRooms'
import { seedTasks } from '../data/seedTasks'
import type { Task } from '../domain/tasks/task.types'
import type { ActiveRun, CleaningRun } from '../domain/runs/run.types'

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'kitchen-counters',
    name: 'Kitchen counters',
    roomId: 'kitchen',
    frequencyDays: 1,
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
    id: 'run-1',
    taskId: 'kitchen-counters',
    startedAt: '2026-01-01T09:00:00.000Z',
    finishedAt: '2026-01-01T09:07:00.000Z',
    durationSeconds: 420,
    previousPersonalBestSeconds: null,
    isPersonalBest: true,
    ...overrides,
  }
}

describe('localStorage StorageService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('tasks', () => {
    it('returns the seed tasks when none have been saved yet', async () => {
      const storage = createLocalStorageService()

      const tasks = await storage.getTasks()

      expect(tasks).toEqual(seedTasks)
    })

    it('returns a saved task on a later read', async () => {
      const storage = createLocalStorageService()
      const task = buildTask({ id: 'a-new-task', name: 'A new task' })

      await storage.saveTask(task)
      const tasks = await storage.getTasks()

      expect(tasks).toContainEqual(task)
    })

    it('replaces an existing task instead of duplicating it', async () => {
      const storage = createLocalStorageService()
      const original = buildTask({ personalBestSeconds: null })
      await storage.saveTask(original)

      const updated = buildTask({ personalBestSeconds: 300 })
      await storage.saveTask(updated)
      const tasks = await storage.getTasks()

      expect(tasks.filter((t) => t.id === updated.id)).toEqual([updated])
    })
  })

  describe('runs', () => {
    it('returns an empty array when no runs have been saved', async () => {
      const storage = createLocalStorageService()

      const runs = await storage.getRuns()

      expect(runs).toEqual([])
    })

    it('returns a saved run on a later read', async () => {
      const storage = createLocalStorageService()
      const run = buildRun()

      await storage.saveRun(run)
      const runs = await storage.getRuns()

      expect(runs).toEqual([run])
    })

    it('keeps prior runs when saving another one', async () => {
      const storage = createLocalStorageService()
      const firstRun = buildRun({ id: 'run-1' })
      const secondRun = buildRun({ id: 'run-2' })

      await storage.saveRun(firstRun)
      await storage.saveRun(secondRun)
      const runs = await storage.getRuns()

      expect(runs).toEqual([firstRun, secondRun])
    })
  })

  describe('active run', () => {
    it('returns null when no timer is running', async () => {
      const storage = createLocalStorageService()

      expect(await storage.getActiveRun()).toBeNull()
    })

    it('returns a saved active run on a later read', async () => {
      const storage = createLocalStorageService()
      const activeRun: ActiveRun = { taskId: 'kitchen-counters', startedAt: '2026-09-22T09:00:00.000Z' }

      await storage.saveActiveRun(activeRun)

      expect(await storage.getActiveRun()).toEqual(activeRun)
    })

    it('clears the active run when saved as null', async () => {
      const storage = createLocalStorageService()
      await storage.saveActiveRun({ taskId: 'kitchen-counters', startedAt: '2026-09-22T09:00:00.000Z' })

      await storage.saveActiveRun(null)

      expect(await storage.getActiveRun()).toBeNull()
    })
  })

  describe('rooms', () => {
    it('returns the seed rooms', async () => {
      const storage = createLocalStorageService()

      const rooms = await storage.getRooms()

      expect(rooms).toEqual(seedRooms)
    })
  })

  describe('settings', () => {
    it('returns default settings when none have been saved', async () => {
      const storage = createLocalStorageService()

      const settings = await storage.getSettings()

      expect(settings).toEqual(DEFAULT_SETTINGS)
    })

    it('returns saved settings on a later read', async () => {
      const storage = createLocalStorageService()
      const settings = { ...DEFAULT_SETTINGS, soundEnabled: true }

      await storage.saveSettings(settings)
      const result = await storage.getSettings()

      expect(result).toEqual(settings)
    })
  })
})
