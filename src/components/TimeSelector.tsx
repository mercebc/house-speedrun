const DURATIONS_MINUTES = [10, 20, 30, 45, 60]

export function TimeSelector({
  selectedMinutes,
  onSelect,
}: {
  selectedMinutes: number | null
  onSelect: (minutes: number) => void
}) {
  return (
    <div className="time-selector" role="group" aria-label="How much time do you have?">
      {DURATIONS_MINUTES.map((minutes) => (
        <button
          key={minutes}
          type="button"
          className="time-selector__option"
          aria-pressed={selectedMinutes === minutes}
          onClick={() => onSelect(minutes)}
        >
          {minutes} min
        </button>
      ))}
    </div>
  )
}
