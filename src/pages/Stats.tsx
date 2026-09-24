import { useEffect, useState } from 'react'
import {
  getCurrentStreak,
  getMostImprovedTask,
  getPersonalBestCount,
  getRunsSince,
  getTotalCleaningSeconds,
} from '../domain/stats/stats.service'
import type { CleaningRun } from '../domain/runs/run.types'
import type { Task } from '../domain/tasks/task.types'
import { formatDuration, formatHoursMinutes } from '../utils/duration'
import { useStorage } from '../storage/useStorage'

export function Stats({ now = new Date() }: { now?: Date } = {}) {
  const storage = useStorage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [runs, setRuns] = useState<CleaningRun[]>([])

  useEffect(() => {
    storage.getTasks().then(setTasks)
    storage.getRuns().then(setRuns)
  }, [storage])

  const weekAgo = new Date(now.getTime() - 7 * 86_400_000)
  const weekRuns = getRunsSince(runs, weekAgo)

  const totalSeconds = getTotalCleaningSeconds(weekRuns)
  const runCount = weekRuns.length
  const personalBestCount = getPersonalBestCount(weekRuns)
  const streak = getCurrentStreak(runs, now)
  const mostImproved = getMostImprovedTask(tasks, runs)

  return (
    <section>
      <h1>Stats</h1>

      <h2>This week</h2>
      <dl className="stats__grid">
        <div>
          <dt>Total cleaning time</dt>
          <dd>{formatHoursMinutes(totalSeconds)}</dd>
        </div>
        <div>
          <dt>Runs</dt>
          <dd>{runCount}</dd>
        </div>
        <div>
          <dt>Personal bests</dt>
          <dd>{personalBestCount} 🏆</dd>
        </div>
        <div>
          <dt>Current streak</dt>
          <dd>
            {streak} day{streak === 1 ? '' : 's'}
          </dd>
        </div>
      </dl>

      {mostImproved !== null && (
        <div className="stats__most-improved">
          <h2>Most improved task</h2>
          <p className="stats__most-improved-name">{mostImproved.task.name}</p>
          <dl className="stats__grid">
            <div>
              <dt>Old PB</dt>
              <dd>{formatDuration(mostImproved.improvement.oldSeconds)}</dd>
            </div>
            <div>
              <dt>Current PB</dt>
              <dd>{formatDuration(mostImproved.improvement.newSeconds)}</dd>
            </div>
            <div>
              <dt>Improvement</dt>
              <dd>{formatDuration(mostImproved.improvement.improvementSeconds)}</dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  )
}
