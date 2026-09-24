import { useEffect, useId, useState } from 'react'
import { createTask } from '../domain/tasks/task.service'
import type { Room, Task } from '../domain/tasks/task.types'
import { useStorage } from '../storage/useStorage'

function TaskRow({
  task,
  rooms,
  onRename,
  onDelete,
}: {
  task: Task
  rooms: Room[]
  onRename: (name: string) => void
  onDelete: () => void
}) {
  const [name, setName] = useState(task.name)
  const inputId = useId()
  const room = rooms.find((r) => r.id === task.roomId)

  return (
    <li className="manage-tasks__row">
      <label htmlFor={inputId} className="manage-tasks__row-label">
        Rename {task.name}
      </label>
      <input
        id={inputId}
        type="text"
        className="manage-tasks__name-input"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => {
          if (name.trim() !== '' && name !== task.name) onRename(name)
        }}
      />
      <span className="manage-tasks__room">{room?.name ?? 'Unknown room'}</span>
      <button type="button" className="manage-tasks__delete" onClick={onDelete}>
        Delete
      </button>
    </li>
  )
}

export function ManageTasks() {
  const storage = useStorage()
  const [tasks, setTasks] = useState<Task[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  const [nameInput, setNameInput] = useState('')
  const [roomInput, setRoomInput] = useState('')
  const [frequencyInput, setFrequencyInput] = useState('7')
  const [minutesInput, setMinutesInput] = useState('10')

  useEffect(() => {
    storage.getTasks().then(setTasks)
    storage.getRooms().then((loadedRooms) => {
      setRooms(loadedRooms)
      setRoomInput((current) => current || (loadedRooms[0]?.id ?? ''))
    })
  }, [storage])

  async function handleRename(task: Task, name: string) {
    const updated = { ...task, name }
    await storage.saveTask(updated)
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
  }

  async function handleDelete(taskId: string) {
    await storage.deleteTask(taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  async function handleAddTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const frequencyDays = Number.parseInt(frequencyInput, 10)
    const minutes = Number.parseInt(minutesInput, 10)
    if (nameInput.trim() === '' || roomInput === '' || Number.isNaN(frequencyDays) || Number.isNaN(minutes)) return

    const task = createTask(
      { name: nameInput.trim(), roomId: roomInput, frequencyDays, estimatedSeconds: minutes * 60 },
      new Date(),
      crypto.randomUUID(),
    )
    await storage.saveTask(task)
    setTasks((prev) => [...prev, task])
    setNameInput('')
    setFrequencyInput('7')
    setMinutesInput('10')
  }

  return (
    <section>
      <h1>Manage tasks</h1>
      <p className="manage-tasks__hint">Rename, add, or remove tasks from your cleaning catalogue.</p>

      {tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul className="manage-tasks__list">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              rooms={rooms}
              onRename={(name) => handleRename(task, name)}
              onDelete={() => handleDelete(task.id)}
            />
          ))}
        </ul>
      )}

      <form className="manage-tasks__add" onSubmit={handleAddTask}>
        <h2>Add a task</h2>
        <div className="settings__field">
          <label htmlFor="new-task-name">Task name</label>
          <input
            id="new-task-name"
            type="text"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
          />
        </div>
        <div className="settings__field">
          <label htmlFor="new-task-room">Room</label>
          <select id="new-task-room" value={roomInput} onChange={(event) => setRoomInput(event.target.value)}>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
        <div className="settings__field">
          <label htmlFor="new-task-frequency">Frequency (days)</label>
          <input
            id="new-task-frequency"
            type="number"
            min={1}
            value={frequencyInput}
            onChange={(event) => setFrequencyInput(event.target.value)}
          />
        </div>
        <div className="settings__field">
          <label htmlFor="new-task-minutes">Estimated minutes</label>
          <input
            id="new-task-minutes"
            type="number"
            min={1}
            value={minutesInput}
            onChange={(event) => setMinutesInput(event.target.value)}
          />
        </div>
        <button type="submit" className="manage-tasks__add-button">
          Add task
        </button>
      </form>
    </section>
  )
}
