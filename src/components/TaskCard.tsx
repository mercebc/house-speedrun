import { Link } from 'react-router-dom'
import { getDaysOverdue, getTaskStatus } from '../domain/tasks/task.status'
import type { Room, Task } from '../domain/tasks/task.types'
import type { Supply } from '../domain/supplies/supply.types'
import { formatFrequency, formatRelativeDate } from '../utils/dates'
import { formatDuration } from '../utils/duration'
import { useSettings } from '../storage/useSettings'
import { StatusBadge } from './StatusBadge'
import { SuppliesCollage } from './SuppliesCollage'

export function TaskCard({
  task,
  room,
  supplies,
  now,
  onLogCompletion,
}: {
  task: Task
  room: Room
  supplies: Supply[]
  now: Date
  onLogCompletion: () => void
}) {
  const { settings } = useSettings()
  const status = getTaskStatus(task, now, settings.superOverdueDays)
  const daysOverdue = getDaysOverdue(task, now)

  return (
    <article className="task-card">
      <div className="task-card__main">
        <h3 className="task-card__name">
          <Link to={`/tasks/${task.id}`}>{task.name}</Link>
        </h3>
        <p className="task-card__meta">
          <span aria-hidden="true">{room.icon}</span> <span>{room.name}</span>
          {' · '}
          <span>{formatFrequency(task.frequencyDays)}</span>
        </p>
        {supplies.length > 0 && (
          <div className="task-card__supplies">
            <SuppliesCollage supplies={supplies} />
          </div>
        )}
        <p className="task-card__pb">
          PB {task.personalBestSeconds === null ? '—' : formatDuration(task.personalBestSeconds)}
        </p>
        <p className="task-card__last-done">
          Last done{' '}
          <span>{task.lastCompletedAt === null ? 'Not logged' : formatRelativeDate(task.lastCompletedAt, now)}</span>
        </p>
        <StatusBadge status={status} daysOverdue={daysOverdue} />
      </div>
      <div className="task-card__actions">
        <Link to={`/tasks/${task.id}/timer`} className="task-card__start">
          Start
        </Link>
        <button type="button" className="task-card__log" onClick={onLogCompletion}>
          Log it
        </button>
      </div>
    </article>
  )
}
