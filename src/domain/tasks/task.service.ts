import type { Task } from './task.types'

export function markTaskCompleted(task: Task, completedAt: Date): Task {
  return { ...task, lastCompletedAt: completedAt.toISOString() }
}

export function createTask(
  input: { name: string; roomId: string; frequencyDays: number; estimatedSeconds: number },
  now: Date,
  id: string,
): Task {
  return {
    id,
    name: input.name,
    roomId: input.roomId,
    frequencyDays: input.frequencyDays,
    estimatedSeconds: input.estimatedSeconds,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: now.toISOString(),
    active: true,
    supplyIds: [],
  }
}
