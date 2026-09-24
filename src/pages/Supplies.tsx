import { useEffect, useState } from 'react'
import { ItemPhoto } from '../components/ItemPhoto'
import type { Task } from '../domain/tasks/task.types'
import type { Supply } from '../domain/supplies/supply.types'
import { useStorage } from '../storage/useStorage'
import { SUPPLY_DEFAULT_PHOTOS } from '../data/supplyDefaultPhotos'

// Only consumable/chemical products are worth swapping for your own brand.
// Reusable tools (utensils) always just show their default photo.
const UPLOADABLE_SUPPLY_IDS = new Set([
  'spray-bottle',
  'glass-cleaner',
  'disinfectant-spray',
  'degreaser',
  'oven-cleaner',
])

function DefaultPhoto({ supply }: { supply: Supply }) {
  const src = SUPPLY_DEFAULT_PHOTOS[supply.id]
  if (src === undefined) return null
  return <img src={src} alt={supply.name} className="supply-card__default-photo" />
}

function SupplyCard({
  supply,
  tasks,
  onToggleTask,
}: {
  supply: Supply
  tasks: Task[]
  onToggleTask: (task: Task) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const isUploadable = UPLOADABLE_SUPPLY_IDS.has(supply.id)

  return (
    <div className="supply-card" role="group" aria-label={supply.name}>
      {isUploadable ? (
        <ItemPhoto itemId={supply.id} itemName={supply.name} defaultIcon={<DefaultPhoto supply={supply} />} />
      ) : (
        <span className="supply-card__icon">
          <DefaultPhoto supply={supply} />
        </span>
      )}
      <h3 className="supply-card__name">{supply.name}</h3>
      <button type="button" className="supply-card__toggle" onClick={() => setIsOpen((open) => !open)}>
        Used for {isOpen ? '▲' : '▼'}
      </button>
      {isOpen && (
        <ul className="supply-card__tasks">
          {tasks.map((task) => (
            <li key={task.id}>
              <label>
                <input
                  type="checkbox"
                  checked={task.supplyIds.includes(supply.id)}
                  onChange={() => onToggleTask(task)}
                />
                {task.name}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Supplies() {
  const storage = useStorage()
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    storage.getSupplies().then(setSupplies)
    storage.getTasks().then(setTasks)
  }, [storage])

  async function handleToggleTask(task: Task, supplyId: string) {
    const hasSupply = task.supplyIds.includes(supplyId)
    const updated: Task = {
      ...task,
      supplyIds: hasSupply ? task.supplyIds.filter((id) => id !== supplyId) : [...task.supplyIds, supplyId],
    }
    await storage.saveTask(updated)
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
  }

  return (
    <section>
      <h1>Cleaning supplies</h1>
      <p className="supplies-page__hint">
        Add a photo for each product or tool, and tell it which tasks it's used for. Those photos show up as a
        collage on the task list and in missions.
      </p>

      {supplies.length === 0 ? (
        <p>No supplies in your catalogue yet.</p>
      ) : (
        <div className="supplies-page__list">
          {supplies.map((supply) => (
            <SupplyCard
              key={supply.id}
              supply={supply}
              tasks={tasks}
              onToggleTask={(task) => handleToggleTask(task, supply.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
