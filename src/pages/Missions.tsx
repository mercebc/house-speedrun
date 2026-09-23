import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TimeSelector } from '../components/TimeSelector'
import { MissionCard } from '../components/MissionCard'
import { buildMission, getCombinedSupplyIds } from '../domain/missions/mission.builder'
import type { Task } from '../domain/tasks/task.types'
import type { Supply } from '../domain/supplies/supply.types'
import { useStorage } from '../storage/useStorage'
import { useSettings } from '../storage/useSettings'

export function Missions({ now = new Date() }: { now?: Date } = {}) {
  const storage = useStorage()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null)

  useEffect(() => {
    storage.getTasks().then(setTasks)
    storage.getSupplies().then(setSupplies)
  }, [storage])

  const mission =
    selectedMinutes === null ? null : buildMission(tasks, selectedMinutes * 60, now, settings.superOverdueDays)

  const suppliesById = useMemo(() => new Map(supplies.map((supply) => [supply.id, supply])), [supplies])
  const missionSupplies = useMemo(() => {
    if (mission === null) return []
    return getCombinedSupplyIds(mission.items)
      .map((id) => suppliesById.get(id))
      .filter((supply): supply is Supply => supply !== undefined)
  }, [mission, suppliesById])

  async function handleStart() {
    if (mission === null || mission.items.length === 0) return
    await storage.saveActiveMission({
      taskIds: mission.items.map((task) => task.id),
      availableSeconds: mission.availableSeconds,
      currentIndex: 0,
    })
    navigate('/missions/run')
  }

  return (
    <section>
      <h1>What are we doing?</h1>

      <h2>How much time do you have?</h2>
      <TimeSelector selectedMinutes={selectedMinutes} onSelect={setSelectedMinutes} />

      {mission !== null && selectedMinutes !== null && (
        <MissionCard
          mission={mission}
          minutes={selectedMinutes}
          supplies={missionSupplies}
          onStart={handleStart}
        />
      )}
    </section>
  )
}
