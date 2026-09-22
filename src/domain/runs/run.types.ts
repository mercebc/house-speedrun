export interface CleaningRun {
  id: string
  taskId: string
  startedAt: string
  finishedAt: string
  durationSeconds: number
  previousPersonalBestSeconds: number | null
  isPersonalBest: boolean
}
