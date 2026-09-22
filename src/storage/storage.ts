import type { Room, Task } from '../domain/tasks/task.types'
import type { CleaningRun } from '../domain/runs/run.types'

export interface Settings {
  superOverdueDays: number
  morningNotificationEnabled: boolean
  morningNotificationTime: string
  showEstimates: boolean
  vibrationEnabled: boolean
  soundEnabled: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  superOverdueDays: 15,
  morningNotificationEnabled: true,
  morningNotificationTime: '08:30',
  showEstimates: true,
  vibrationEnabled: true,
  soundEnabled: false,
}

export interface StorageService {
  getTasks(): Promise<Task[]>
  saveTask(task: Task): Promise<void>

  getRuns(): Promise<CleaningRun[]>
  saveRun(run: CleaningRun): Promise<void>

  getRooms(): Promise<Room[]>

  getSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>
}
