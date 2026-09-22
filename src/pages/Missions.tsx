import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TimeSelector } from '../components/TimeSelector'
import { MissionCard } from '../components/MissionCard'
import { buildMission } from '../domain/missions/mission.builder'
import type { Task } from '../domain/tasks/task.types'
import { useStorage } from '../storage/useStorage'

export function Missions({ now = new Date() }: { now?: Date } = {}) {
  const storage = useStorage()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null)

  useEffect(() => {
    storage.getTasks().then(setTasks)
  }, [storage])

  const mission = selectedMinutes === null ? null : buildMission(tasks, selectedMinutes * 60, now)

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
        <MissionCard mission={mission} minutes={selectedMinutes} onStart={handleStart} />
      )}
    </section>
  )
}
