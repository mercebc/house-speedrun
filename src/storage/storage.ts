import type { Room, Task } from '../domain/tasks/task.types'
import type { ActiveRun, CleaningRun } from '../domain/runs/run.types'
import type { ActiveMission } from '../domain/missions/mission.types'
import type { Supply } from '../domain/supplies/supply.types'

export interface Settings {
  superOverdueDays: number
  morningNotificationEnabled: boolean
  morningNotificationTime: string
  showEstimates: boolean
  vibrationEnabled: boolean
  soundEnabled: boolean
  spotifyPlaylistUrl: string
}

export const DEFAULT_SETTINGS: Settings = {
  superOverdueDays: 15,
  morningNotificationEnabled: true,
  morningNotificationTime: '08:30',
  showEstimates: true,
  vibrationEnabled: true,
  soundEnabled: false,
  spotifyPlaylistUrl: '',
}

export interface StorageService {
  getTasks(): Promise<Task[]>
  saveTask(task: Task): Promise<void>
  deleteTask(taskId: string): Promise<void>

  getRuns(): Promise<CleaningRun[]>
  saveRun(run: CleaningRun): Promise<void>

  getActiveRun(): Promise<ActiveRun | null>
  saveActiveRun(activeRun: ActiveRun | null): Promise<void>

  getActiveMission(): Promise<ActiveMission | null>
  saveActiveMission(activeMission: ActiveMission | null): Promise<void>

  getRooms(): Promise<Room[]>

  getSupplies(): Promise<Supply[]>

  getSettings(): Promise<Settings>
  saveSettings(settings: Settings): Promise<void>

  getLastMorningNotificationDate(): Promise<string | null>
  saveLastMorningNotificationDate(date: string | null): Promise<void>
}
