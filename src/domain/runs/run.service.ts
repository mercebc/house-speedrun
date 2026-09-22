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
