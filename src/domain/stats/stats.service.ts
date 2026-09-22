import { getTaskImprovement, type TaskImprovement } from '../runs/run.service'
import type { CleaningRun } from '../runs/run.types'
import type { Task } from '../tasks/task.types'
import { diffInCalendarDays } from '../../utils/dates'

export function getRunsSince(runs: CleaningRun[], since: Date): CleaningRun[] {
  return runs.filter((run) => new Date(run.finishedAt).getTime() >= since.getTime())
}

export function getTotalCleaningSeconds(runs: CleaningRun[]): number {
  return runs.reduce((sum, run) => sum + run.durationSeconds, 0)
}

export function getPersonalBestCount(runs: CleaningRun[]): number {
  return runs.filter((run) => run.isPersonalBest).length
}

// Consecutive calendar days with at least one run, counting back from today.
// A day without a run yet doesn't break the streak until it's fully over —
// i.e. today can be empty as long as yesterday wasn't.
export function getCurrentStreak(runs: CleaningRun[], now: Date): number {
  if (runs.length === 0) return 0

  const daysWithRuns = new Set(runs.map((run) => diffInCalendarDays(new Date(run.finishedAt), now)))

  let cursor = daysWithRuns.has(0) ? 0 : -1
  if (!daysWithRuns.has(cursor)) return 0

  let streak = 0
  while (daysWithRuns.has(cursor)) {
    streak += 1
    cursor -= 1
  }
  return streak
}

export interface MostImprovedTask {
  task: Task
  improvement: TaskImprovement
}

export function getMostImprovedTask(tasks: Task[], runs: CleaningRun[]): MostImprovedTask | null {
  let best: MostImprovedTask | null = null

  for (const task of tasks) {
    const improvement = getTaskImprovement(runs.filter((run) => run.taskId === task.id))
    if (improvement === null) continue
    if (best === null || improvement.improvementSeconds > best.improvement.improvementSeconds) {
      best = { task, improvement }
    }
  }

  return best
}
