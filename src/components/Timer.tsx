import { formatDuration } from '../utils/duration'

export function Timer({
  taskName,
  elapsedSeconds,
  personalBestSeconds,
  estimatedSeconds,
  showEstimate = true,
  onFinish,
}: {
  taskName: string
  elapsedSeconds: number
  personalBestSeconds: number | null
  estimatedSeconds: number
  showEstimate?: boolean
  onFinish: () => void
}) {
  return (
    <div className="timer">
      <h1 className="timer__task-name">{taskName}</h1>
      <p className="timer__elapsed">{formatDuration(elapsedSeconds)}</p>
      <div className="timer__reference">
        <div>
          <span className="timer__reference-label">PB</span>
          <span>{personalBestSeconds === null ? '—' : formatDuration(personalBestSeconds)}</span>
        </div>
        {showEstimate && (
          <div>
            <span className="timer__reference-label">Estimated</span>
            <span>{formatDuration(estimatedSeconds)}</span>
          </div>
        )}
      </div>
      <button type="button" className="timer__finish" onClick={onFinish}>
        Finish
      </button>
    </div>
  )
}
