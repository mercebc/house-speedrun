import { diffInCalendarDays } from '../../utils/dates'
import { DEFAULT_SETTINGS } from '../../storage/storage'
import type { Task, TaskStatus } from './task.types'

type DueFields = Pick<Task, 'lastCompletedAt' | 'frequencyDays'>

export function getNextDueDate(task: DueFields): Date | null {
  if (task.lastCompletedAt === null) return null

  const lastCompleted = new Date(task.lastCompletedAt)
  const nextDue = new Date(
    Date.UTC(
      lastCompleted.getUTCFullYear(),
      lastCompleted.getUTCMonth(),
      lastCompleted.getUTCDate() + task.frequencyDays,
    ),
  )
  return nextDue
}

export function getDaysOverdue(task: DueFields, now: Date): number {
  const nextDue = getNextDueDate(task)
  if (nextDue === null) return 0

  return diffInCalendarDays(now, nextDue)
}

export function getTaskStatus(
  task: DueFields,
  now: Date,
  superOverdueDays: number = DEFAULT_SETTINGS.superOverdueDays,
): TaskStatus {
  if (task.lastCompletedAt === null) return 'never_done'

  const daysOverdue = getDaysOverdue(task, now)

  if (daysOverdue < 0) return 'not_due'
  if (daysOverdue === 0) return 'due'
  if (daysOverdue > superOverdueDays) return 'super_overdue'
  return 'overdue'
}
