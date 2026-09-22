import { useEffect, useMemo, useState } from 'react'
import { getRunsSince } from '../domain/stats/stats.service'
import type { CleaningRun } from '../domain/runs/run.types'
import type { Task } from '../domain/tasks/task.types'
import { formatRelativeDate } from '../utils/dates'
import { formatDuration } from '../utils/duration'
import { useStorage } from '../storage/useStorage'

type HistoryFilter = 'today' | '7d' | '30d' | 'all'

const FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: 'all', label: 'All time' },
]

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function sinceFor(filter: HistoryFilter, now: Date): Date | null {
  switch (filter) {
    case 'today':
      return startOfDay(now)
    case '7d':
      return new Date(now.getTime() - 7 * 86_400_000)
    case '30d':
      return new Date(now.getTime() - 30 * 86_400_000)
    case 'all':
      return null
  }
}

interface RunGroup {
  label: string
  runs: CleaningRun[]
}

function groupByDay(runs: CleaningRun[], now: Date): RunGroup[] {
  const sorted = [...runs].sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())

  const groups: RunGroup[] = []
  for (const run of sorted) {
    const label = formatRelativeDate(run.finishedAt, now)
    const group = groups.find((g) => g.label === label)
    if (group === undefined) {
      groups.push({ label, runs: [run] })
    } else {
      group.runs.push(run)
    }
  }
  return groups
}

export function History({ now = new Date() }: { now?: Date } = {}) {
  const storage = useStorage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [runs, setRuns] = useState<CleaningRun[]>([])
  const [filter, setFilter] = useState<HistoryFilter>('all')

  useEffect(() => {
    storage.getTasks().then(setTasks)
    storage.getRuns().then(setRuns)
  }, [storage])

  const taskNamesById = useMemo(() => new Map(tasks.map((task) => [task.id, task.name])), [tasks])

  const since = sinceFor(filter, now)
  const visibleRuns = since === null ? runs : getRunsSince(runs, since)
  const groups = groupByDay(visibleRuns, now)

  return (
    <section>
      <h1>Your runs</h1>

      <div className="filter-chips" role="group" aria-label="Filter by date">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="filter-chip"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <p>No runs yet.</p>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="history-group">
            <h2>{group.label}</h2>
            <ul className="history-group__list">
              {group.runs.map((run) => (
                <li key={run.id} className="history-group__item">
                  <span className="history-group__task-name">{taskNamesById.get(run.taskId) ?? 'Unknown task'}</span>
                  <span className="history-group__duration">{formatDuration(run.durationSeconds)}</span>
                  {run.isPersonalBest && (
                    <span aria-label="Personal best" className="history-group__pb">
                      🏆
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </section>
  )
}
