import type { Room } from '../domain/tasks/task.types'

export function RoomFilter({
  rooms,
  selectedRoomId,
  onSelect,
}: {
  rooms: Room[]
  selectedRoomId: string | null
  onSelect: (roomId: string | null) => void
}) {
  return (
    <div className="filter-chips" role="group" aria-label="Filter by room">
      <button
        type="button"
        className="filter-chip"
        aria-pressed={selectedRoomId === null}
        onClick={() => onSelect(null)}
      >
        All rooms
      </button>
      {rooms.map((room) => (
        <button
          key={room.id}
          type="button"
          className="filter-chip"
          aria-pressed={selectedRoomId === room.id}
          onClick={() => onSelect(room.id)}
        >
          {room.icon} {room.name}
        </button>
      ))}
    </div>
  )
}
