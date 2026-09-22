import type { TaskStatus } from '../domain/tasks/task.types'

const LABELS: Record<TaskStatus, (daysOverdue: number) => string> = {
  never_done: () => 'Not logged yet',
  not_due: () => 'Not due',
  due: () => 'Due today',
  overdue: (daysOverdue) => `Overdue ${daysOverdue}d`,
  super_overdue: (daysOverdue) => `Super overdue ${daysOverdue}d`,
}

const TONES: Record<TaskStatus, string> = {
  never_done: 'status-badge--neutral',
  not_due: 'status-badge--neutral',
  due: 'status-badge--warning',
  overdue: 'status-badge--warning',
  super_overdue: 'status-badge--danger',
}

export function StatusBadge({ status, daysOverdue }: { status: TaskStatus; daysOverdue: number }) {
  return (
    <span className={`status-badge ${TONES[status]}`}>
      <span aria-hidden="true" className="status-badge__dot" />
      {LABELS[status](daysOverdue)}
    </span>
  )
}
