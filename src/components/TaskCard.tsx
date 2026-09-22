import { Link } from 'react-router-dom'
import { getDaysOverdue, getTaskStatus } from '../domain/tasks/task.status'
import type { Room, Task } from '../domain/tasks/task.types'
import { formatFrequency, formatRelativeDate } from '../utils/dates'
import { formatDuration } from '../utils/duration'
import { StatusBadge } from './StatusBadge'
import { TaskPhoto } from './TaskPhoto'

export function TaskCard({
  task,
  room,
  now,
  onLogCompletion,
}: {
  task: Task
  room: Room
  now: Date
  onLogCompletion: () => void
}) {
  const status = getTaskStatus(task, now)
  const daysOverdue = getDaysOverdue(task, now)

  return (
    <article className="task-card">
      <TaskPhoto taskId={task.id} taskName={task.name} />
      <div className="task-card__main">
        <h3 className="task-card__name">
          <Link to={`/tasks/${task.id}`}>{task.name}</Link>
        </h3>
        <p className="task-card__meta">
          <span aria-hidden="true">{room.icon}</span> <span>{room.name}</span>
          {' · '}
          <span>{formatFrequency(task.frequencyDays)}</span>
        </p>
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
