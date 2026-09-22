import { useEffect, useMemo, useState } from 'react'
import { TaskCard } from '../components/TaskCard'
import { RoomFilter } from '../components/RoomFilter'
import { getTaskStatus } from '../domain/tasks/task.status'
import { markTaskCompleted } from '../domain/tasks/task.service'
import type { Room, Task, TaskStatus } from '../domain/tasks/task.types'
import { useStorage } from '../storage/useStorage'
import { useSettings } from '../storage/useSettings'

type StatusFilter = 'all' | TaskStatus

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'due', label: 'Due' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'super_overdue', label: 'Super overdue' },
  { id: 'never_done', label: 'Not logged' },
]

export function Tasks({ now = new Date() }: { now?: Date } = {}) {
  const storage = useStorage()
  const { settings } = useSettings()
  const [tasks, setTasks] = useState<Task[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roomFilter, setRoomFilter] = useState<string | null>(null)

  useEffect(() => {
    storage.getTasks().then(setTasks)
    storage.getRooms().then(setRooms)
  }, [storage])

  const roomsById = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms])

  async function handleLogCompletion(task: Task) {
    const updated = markTaskCompleted(task, now)
    await storage.saveTask(updated)
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
  }

  const visibleTasks = tasks.filter((task) => {
    if (roomFilter !== null && task.roomId !== roomFilter) return false
    if (statusFilter === 'all') return true
    return getTaskStatus(task, now, settings.superOverdueDays) === statusFilter
  })

  return (
    <section>
      <h1>All tasks</h1>

      <div className="filter-chips" role="group" aria-label="Filter by status">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            className="filter-chip"
            aria-pressed={statusFilter === filter.id}
            onClick={() => setStatusFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <RoomFilter rooms={rooms} selectedRoomId={roomFilter} onSelect={setRoomFilter} />

      {visibleTasks.length === 0 ? (
        <p>No tasks match these filters.</p>
      ) : (
        <div className="task-list">
          {visibleTasks.map((task) => {
            const room = roomsById.get(task.roomId)
            return room ? (
              <TaskCard
                key={task.id}
                task={task}
                room={room}
                now={now}
                onLogCompletion={() => handleLogCompletion(task)}
              />
            ) : null
          })}
        </div>
      )}
    </section>
  )
}
