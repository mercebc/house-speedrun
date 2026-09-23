import type { Mission } from '../domain/missions/mission.types'
import type { Supply } from '../domain/supplies/supply.types'
import { formatDuration } from '../utils/duration'
import { SuppliesCollage } from './SuppliesCollage'

export function MissionCard({
  mission,
  minutes,
  supplies,
  onStart,
}: {
  mission: Mission
  minutes: number
  supplies: Supply[]
  onStart: () => void
}) {
  if (mission.items.length === 0) {
    return (
      <div className="mission-card mission-card--empty">
        {mission.hadEligibleTasks ? (
          <>
            <p>Nothing fits.</p>
            <p>Try 10 more minutes.</p>
          </>
        ) : (
          <p>No suitable jobs found.</p>
        )}
      </div>
    )
  }

  return (
    <div className="mission-card">
      <h2 className="mission-card__heading">
        <span aria-hidden="true">⚡</span> {minutes} minute mission
      </h2>
      <p className="mission-card__subheading">You have {minutes} minutes.</p>

      <ol className="mission-card__list">
        {mission.items.map((task, index) => (
          <li key={task.id} className="mission-card__item">
            <span className="mission-card__item-number">{index + 1}</span>
            <span className="mission-card__item-name">{task.name}</span>
            <span className="mission-card__item-duration">{formatDuration(task.estimatedSeconds)}</span>
          </li>
        ))}
      </ol>

      {supplies.length > 0 && (
        <div className="mission-card__gather">
          <h3>Gather</h3>
          <SuppliesCollage supplies={supplies} />
        </div>
      )}

      <div className="mission-card__total">
        <span>Total</span>
        <span>{formatDuration(mission.totalSeconds)}</span>
      </div>

      <button type="button" className="mission-card__start" onClick={onStart}>
        Start mission
      </button>
    </div>
  )
}
