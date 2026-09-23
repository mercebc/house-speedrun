import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SuppliesCollage } from '../components/SuppliesCollage'
import { StatusBadge } from '../components/StatusBadge'
import { LogCompletionForm } from '../components/LogCompletionForm'
import { getDaysOverdue, getTaskStatus } from '../domain/tasks/task.status'
import { markTaskCompleted } from '../domain/tasks/task.service'
import type { Room, Task } from '../domain/tasks/task.types'
import type { Supply } from '../domain/supplies/supply.types'
import { formatFrequency, formatRelativeDate } from '../utils/dates'
import { formatDuration } from '../utils/duration'
import { useStorage } from '../storage/useStorage'
import { useSettings } from '../storage/useSettings'

export function TaskDetail({ now = new Date() }: { now?: Date } = {}) {
  const { taskId } = useParams<{ taskId: string }>()
  const storage = useStorage()
  const { settings } = useSettings()
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])

  useEffect(() => {
    storage.getTasks().then(setTasks)
    storage.getRooms().then(setRooms)
    storage.getSupplies().then(setSupplies)
  }, [storage])

  const task = useMemo(() => tasks?.find((t) => t.id === taskId) ?? null, [tasks, taskId])
  const room = useMemo(() => rooms.find((r) => r.id === task?.roomId) ?? null, [rooms, task])
  const taskSupplies = useMemo(
    () => supplies.filter((supply) => task?.supplyIds.includes(supply.id)),
    [supplies, task],
  )

  async function handleLogCompletion(completedAt: Date) {
    if (task === null) return
    const updated = markTaskCompleted(task, completedAt)
    await storage.saveTask(updated)
    setTasks((prev) => prev?.map((t) => (t.id === task.id ? updated : t)) ?? null)
  }

  if (tasks === null) {
    return (
      <section>
        <h1>Task detail</h1>
      </section>
    )
  }

  if (task === null || room === null) {
    return (
      <section>
        <h1>Task not found</h1>
        <p>This task may have been removed.</p>
      </section>
    )
  }

  const status = getTaskStatus(task, now, settings.superOverdueDays)
  const daysOverdue = getDaysOverdue(task, now)

  return (
    <section>
      <h1>{task.name}</h1>
      <p className="task-detail__meta">
        <span aria-hidden="true">{room.icon}</span> <span>{room.name}</span>
        {' · '}
        <span>{formatFrequency(task.frequencyDays)}</span>
      </p>

      <div className="task-detail__status-row">
        <StatusBadge status={status} daysOverdue={daysOverdue} />
      </div>

      <Link to={`/tasks/${task.id}/timer`} className="task-detail__start">
        Start timer
      </Link>

      <div className="task-detail__supplies">
        <h2>What you'll need</h2>
        <SuppliesCollage supplies={taskSupplies} />
      </div>

      <dl className="task-detail__stats">
        <div>
          <dt>Personal best</dt>
          <dd>{task.personalBestSeconds === null ? '—' : formatDuration(task.personalBestSeconds)}</dd>
        </div>
        <div>
          <dt>Estimate</dt>
          <dd>{formatDuration(task.estimatedSeconds)}</dd>
        </div>
        <div>
          <dt>Last completed</dt>
          <dd>{task.lastCompletedAt === null ? 'Not logged' : formatRelativeDate(task.lastCompletedAt, now)}</dd>
        </div>
      </dl>

      <div className="task-detail__log">
        <h2>Log a completion</h2>
        <p className="task-detail__log-hint">
          Already did this without using the app? Log it here so the due date stays accurate.
        </p>
        <LogCompletionForm now={now} onLog={handleLogCompletion} />
      </div>
    </section>
  )
}
