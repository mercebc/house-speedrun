import type { Task } from './task.types'

export function markTaskCompleted(task: Task, completedAt: Date): Task {
  return { ...task, lastCompletedAt: completedAt.toISOString() }
}
