import { formatDuration } from '../utils/duration'
import type { CleaningRun } from '../domain/runs/run.types'

export function RunResult({
  taskName,
  run,
  onDone,
}: {
  taskName: string
  run: CleaningRun
  onDone: () => void
}) {
  return (
    <div className="run-result">
      {run.isPersonalBest ? (
        <>
          <p className="run-result__trophy" aria-hidden="true">
            🏆
          </p>
          <h1>New personal best</h1>
          <p className="run-result__time">{formatDuration(run.durationSeconds)}</p>
          {run.previousPersonalBestSeconds !== null && (
            <div className="run-result__comparison">
              <p>
                Previous <span>{formatDuration(run.previousPersonalBestSeconds)}</span>
              </p>
              <p>
                You saved <span>{run.previousPersonalBestSeconds - run.durationSeconds} seconds</span>
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <h1>Nice work</h1>
          <p className="run-result__time">{formatDuration(run.durationSeconds)}</p>
          {run.previousPersonalBestSeconds !== null && (
            <p className="run-result__comparison">
              PB <span>{formatDuration(run.previousPersonalBestSeconds)}</span>
            </p>
          )}
        </>
      )}
      <p className="run-result__task-name">{taskName}</p>
      <button type="button" className="run-result__done" onClick={onDone}>
        Done
      </button>
    </div>
  )
}
