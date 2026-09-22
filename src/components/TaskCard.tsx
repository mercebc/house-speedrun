import { Link } from 'react-router-dom'
import { getDaysOverdue, getTaskStatus } from '../domain/tasks/task.status'
import type { Room, Task } from '../domain/tasks/task.types'
import { formatFrequency, formatRelativeDate } from '../utils/dates'
import { formatDuration } from '../utils/duration'
import { StatusBadge } from './StatusBadge'
import { TaskPhoto } from './TaskPhoto'

export function TaskCard({ task, room, now }: { task: Task; room: Room; now: Date }) {
  const status = getTaskStatus(task, now)
  const daysOverdue = getDaysOverdue(task, now)

  return (
    <article className="task-card">
      <TaskPhoto taskId={task.id} taskName={task.name} />
      <div className="task-card__main">
        <h3 className="task-card__name">{task.name}</h3>
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
          <span>{task.lastCompletedAt === null ? 'Never' : formatRelativeDate(task.lastCompletedAt, now)}</span>
        </p>
        <StatusBadge status={status} daysOverdue={daysOverdue} />
      </div>
      <Link to={`/tasks/${task.id}`} className="task-card__start">
        Start
      </Link>
    </article>
  )
}
