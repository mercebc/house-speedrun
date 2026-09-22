import { formatDuration } from '../utils/duration'
import type { CleaningRun } from '../domain/runs/run.types'

type FinishedStep = Pick<CleaningRun, 'durationSeconds' | 'isPersonalBest'>

export function MissionStepResult({
  run,
  nextTaskName,
  onNext,
}: {
  run: FinishedStep
  nextTaskName: string
  onNext: () => void
}) {
  return (
    <div className="mission-step-result">
      {run.isPersonalBest ? (
        <>
          <p className="mission-step-result__trophy" aria-hidden="true">
            🏆
          </p>
          <h1>New PB</h1>
        </>
      ) : (
        <h1>Done</h1>
      )}
      <p className="mission-step-result__time">{formatDuration(run.durationSeconds)}</p>

      <p className="mission-step-result__next-label">Next</p>
      <p className="mission-step-result__next-name">{nextTaskName}</p>

      <button type="button" className="mission-step-result__start-next" onClick={onNext}>
        Start next
      </button>
    </div>
  )
}
