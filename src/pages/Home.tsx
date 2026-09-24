import { useEffect, useState } from 'react'
import { getSuperOverdueTasks } from '../domain/tasks/task.status'
import type { Task } from '../domain/tasks/task.types'
import {
  buildMorningNotificationContent,
  getNotificationPermission,
  shouldShowMorningNotification,
  showNotification,
} from '../notifications/notifications'
import { useStorage } from '../storage/useStorage'
import { useSettings } from '../storage/useSettings'

export function Home({ now = new Date() }: { now?: Date } = {}) {
  const storage = useStorage()
  const { settings } = useSettings()
  const [tasks, setTasks] = useState<Task[] | null>(null)

  useEffect(() => {
    storage.getTasks().then(setTasks)
  }, [storage])

  useEffect(() => {
    if (tasks === null) return

    storage.getLastMorningNotificationDate().then((lastShownDate) => {
      const shouldShow = shouldShowMorningNotification({
        settings,
        now,
        lastShownDate,
        permissionGranted: getNotificationPermission() === 'granted',
      })
      if (!shouldShow) return

      showNotification(buildMorningNotificationContent(tasks, now, settings.superOverdueDays))
      storage.saveLastMorningNotificationDate(now.toISOString().slice(0, 10))
    })
  }, [storage, settings, tasks, now])

  if (tasks === null) {
    return (
      <section>
        <h1>What are we doing?</h1>
      </section>
    )
  }

  const superOverdueTasks = getSuperOverdueTasks(tasks, now, settings.superOverdueDays)

  return (
    <section>
      <h1>What are we doing?</h1>

      {superOverdueTasks.length > 0 ? (
        <p className="home-banner home-banner--warning">
          <span aria-hidden="true">🔴</span> {superOverdueTasks.length} super overdue
        </p>
      ) : (
        <p className="home-banner">Nothing is more than {settings.superOverdueDays} days overdue. 🎉</p>
      )}
    </section>
  )
}
