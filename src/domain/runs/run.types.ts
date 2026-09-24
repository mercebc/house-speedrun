export interface CleaningRun {
  id: string
  taskId: string
  startedAt: string
  finishedAt: string
  durationSeconds: number
  previousPersonalBestSeconds: number | null
  isPersonalBest: boolean
}

// A timer that's currently running (or was left running when the app closed).
export interface ActiveRun {
  taskId: string
  startedAt: string
}
