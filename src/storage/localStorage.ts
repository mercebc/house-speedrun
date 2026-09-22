import type { Room, Task } from '../domain/tasks/task.types'
import type { CleaningRun } from '../domain/runs/run.types'
import { seedRooms } from '../data/seedRooms'
import { seedTasks } from '../data/seedTasks'
import { DEFAULT_SETTINGS, type Settings, type StorageService } from './storage'

const KEYS = {
  tasks: 'house-speedrun:tasks',
  runs: 'house-speedrun:runs',
  settings: 'house-speedrun:settings',
} as const

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  return JSON.parse(raw) as T
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function createLocalStorageService(): StorageService {
  return {
    async getTasks(): Promise<Task[]> {
      const raw = localStorage.getItem(KEYS.tasks)
      if (raw === null) {
        write(KEYS.tasks, seedTasks)
        return seedTasks
      }
      return JSON.parse(raw) as Task[]
    },

    async saveTask(task: Task): Promise<void> {
      const tasks = await this.getTasks()
      const index = tasks.findIndex((t) => t.id === task.id)
      const next =
        index === -1
          ? [...tasks, task]
          : tasks.map((t) => (t.id === task.id ? task : t))
      write(KEYS.tasks, next)
    },

    async getRuns(): Promise<CleaningRun[]> {
      return read<CleaningRun[]>(KEYS.runs, [])
    },

    async saveRun(run: CleaningRun): Promise<void> {
      const runs = await this.getRuns()
      write(KEYS.runs, [...runs, run])
    },

    async getRooms(): Promise<Room[]> {
      return seedRooms
    },

    async getSettings(): Promise<Settings> {
      const raw = localStorage.getItem(KEYS.settings)
      if (raw === null) {
        write(KEYS.settings, DEFAULT_SETTINGS)
        return DEFAULT_SETTINGS
      }
      return JSON.parse(raw) as Settings
    },

    async saveSettings(settings: Settings): Promise<void> {
      write(KEYS.settings, settings)
    },
  }
}
