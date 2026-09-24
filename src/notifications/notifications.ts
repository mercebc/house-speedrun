import { getDaysOverdue, getSuperOverdueTasks } from '../domain/tasks/task.status'
import type { Task } from '../domain/tasks/task.types'
import type { Settings } from '../storage/storage'
import { formatDuration } from '../utils/duration'

export interface NotificationContent {
  title: string
  body: string
}

export function buildMorningNotificationContent(
  tasks: Task[],
  now: Date,
  superOverdueDays: number,
): NotificationContent {
  const superOverdueTasks = getSuperOverdueTasks(tasks, now, superOverdueDays)

  if (superOverdueTasks.length === 0) {
    return {
      title: 'House Speedrun',
      body: `Nothing is more than ${superOverdueDays} days overdue. 🎉`,
    }
  }

  const jobWord = superOverdueTasks.length === 1 ? 'job' : 'jobs'
  const lines = [`You have ${superOverdueTasks.length} super-overdue ${jobWord}:`, '']

  for (const task of superOverdueTasks) {
    const daysOverdue = getDaysOverdue(task, now)
    const pb = task.personalBestSeconds === null ? '—' : formatDuration(task.personalBestSeconds)
    lines.push(`🔴 ${task.name}`, `${daysOverdue} days overdue`, `PB ${pb}`, '')
  }

  return { title: 'House Speedrun', body: lines.join('\n').trimEnd() }
}

function currentTimeString(now: Date): string {
  return `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`
}

export function shouldShowMorningNotification({
  settings,
  now,
  lastShownDate,
  permissionGranted,
}: {
  settings: Settings
  now: Date
  lastShownDate: string | null
  permissionGranted: boolean
}): boolean {
  if (!settings.morningNotificationEnabled) return false
  if (!permissionGranted) return false
  if (currentTimeString(now) < settings.morningNotificationTime) return false

  const today = now.toISOString().slice(0, 10)
  if (lastShownDate === today) return false

  return true
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'default'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  return await Notification.requestPermission()
}

export function showNotification(content: NotificationContent): void {
  if (!isNotificationSupported()) return
  if (Notification.permission !== 'granted') return
  new Notification(content.title, { body: content.body })
}
