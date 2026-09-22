import type { Task } from '../tasks/task.types'
import type { CleaningRun } from './run.types'

export function finishRun(
  task: Task,
  startedAt: Date,
  finishedAt: Date,
  runId: string,
): { run: CleaningRun; updatedTask: Task } {
  const durationSeconds = Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000)
  const previousPersonalBestSeconds = task.personalBestSeconds
  const isPersonalBest = previousPersonalBestSeconds === null || durationSeconds < previousPersonalBestSeconds

  const run: CleaningRun = {
    id: runId,
    taskId: task.id,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationSeconds,
    previousPersonalBestSeconds,
    isPersonalBest,
  }

  const updatedTask: Task = {
    ...task,
    personalBestSeconds: isPersonalBest ? durationSeconds : task.personalBestSeconds,
    lastCompletedAt: finishedAt.toISOString(),
  }

  return { run, updatedTask }
}

export function calculatePersonalBest(runs: CleaningRun[]): number | null {
  if (runs.length === 0) return null
  return Math.min(...runs.map((run) => run.durationSeconds))
}

export function getTaskAverage(runs: CleaningRun[]): number | null {
  if (runs.length === 0) return null
  const total = runs.reduce((sum, run) => sum + run.durationSeconds, 0)
  return Math.round(total / runs.length)
}

export interface TaskImprovement {
  oldSeconds: number
  newSeconds: number
  improvementSeconds: number
}

// Compares the most recent run that beat a personal best against the time
// it beat — i.e. how much faster the task got the last time it improved.
export function getTaskImprovement(runs: CleaningRun[]): TaskImprovement | null {
  const pbRuns = runs
    .filter((run) => run.isPersonalBest && run.previousPersonalBestSeconds !== null)
    .sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())

  const mostRecent = pbRuns[0]
  if (mostRecent === undefined) return null

  const oldSeconds = mostRecent.previousPersonalBestSeconds!
  const newSeconds = mostRecent.durationSeconds
  return { oldSeconds, newSeconds, improvementSeconds: oldSeconds - newSeconds }
}
