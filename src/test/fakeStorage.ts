import type { Room, Task } from '../domain/tasks/task.types'
import type { CleaningRun } from '../domain/runs/run.types'
import { DEFAULT_SETTINGS, type Settings, type StorageService } from '../storage/storage'

export function createFakeStorage(seed: { tasks?: Task[]; rooms?: Room[]; runs?: CleaningRun[] } = {}): StorageService {
  let tasks = seed.tasks ?? []
  let runs = seed.runs ?? []
  const rooms = seed.rooms ?? []
  let settings = DEFAULT_SETTINGS

  return {
    async getTasks() {
      return tasks
    },
    async saveTask(task: Task) {
      const index = tasks.findIndex((t) => t.id === task.id)
      tasks = index === -1 ? [...tasks, task] : tasks.map((t) => (t.id === task.id ? task : t))
    },
    async getRuns() {
      return runs
    },
    async saveRun(run: CleaningRun) {
      runs = [...runs, run]
    },
    async getRooms() {
      return rooms
    },
    async getSettings() {
      return settings
    },
    async saveSettings(next: Settings) {
      settings = next
    },
  }
}
