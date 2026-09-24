import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timer } from '../components/Timer'
import { MissionStepResult } from '../components/MissionStepResult'
import { SpotifyPlayer } from '../components/SpotifyPlayer'
import { finishRun } from '../domain/runs/run.service'
import type { ActiveMission } from '../domain/missions/mission.types'
import type { Task } from '../domain/tasks/task.types'
import { formatDuration } from '../utils/duration'
import { triggerFinishFeedback } from '../utils/feedback'
import { useElapsedSeconds } from '../utils/useElapsedSeconds'
import { useStorage } from '../storage/useStorage'
import { useSettings } from '../storage/useSettings'

type Phase = 'loading' | 'no-mission' | 'running' | 'step-result' | 'complete'

interface MissionSummary {
  plannedSeconds: number
  actualSeconds: number
  personalBests: number
}

export function MissionRunner() {
  const storage = useStorage()
  const { settings } = useSettings()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [activeMission, setActiveMission] = useState<ActiveMission | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [lastRun, setLastRun] = useState<{ isPersonalBest: boolean; durationSeconds: number } | null>(null)
  const [completedRuns, setCompletedRuns] = useState<{ isPersonalBest: boolean; durationSeconds: number }[]>([])
  const [summary, setSummary] = useState<MissionSummary | null>(null)

  const elapsedSeconds = useElapsedSeconds(phase === 'running', startedAt)

  useEffect(() => {
    let cancelled = false

    Promise.all([storage.getTasks(), storage.getActiveMission()]).then(([loadedTasks, mission]) => {
      if (cancelled) return
      setTasks(loadedTasks)

      if (mission === null) {
        setPhase('no-mission')
        return
      }

      setActiveMission(mission)
      setStartedAt(new Date())
      setPhase('running')
    })

    return () => {
      cancelled = true
    }
  }, [storage])

  const currentTask =
    tasks !== null && activeMission !== null
      ? (tasks.find((t) => t.id === activeMission.taskIds[activeMission.currentIndex]) ?? null)
      : null

  async function handleFinish() {
    if (currentTask === null || activeMission === null || startedAt === null) return

    const finishedAt = new Date()
    const { run, updatedTask } = finishRun(currentTask, startedAt, finishedAt, crypto.randomUUID())
    triggerFinishFeedback(settings, run.isPersonalBest)

    await storage.saveRun(run)
    await storage.saveTask(updatedTask)

    setTasks((prev) => prev?.map((t) => (t.id === updatedTask.id ? updatedTask : t)) ?? null)
    const nextCompletedRuns = [...completedRuns, run]
    setCompletedRuns(nextCompletedRuns)
    setLastRun(run)

    const nextIndex = activeMission.currentIndex + 1
    if (nextIndex < activeMission.taskIds.length) {
      const updatedMission = { ...activeMission, currentIndex: nextIndex }
      await storage.saveActiveMission(updatedMission)
      setActiveMission(updatedMission)
      setPhase('step-result')
    } else {
      await storage.saveActiveMission(null)
      setSummary({
        plannedSeconds: activeMission.availableSeconds,
        actualSeconds: nextCompletedRuns.reduce((sum, r) => sum + r.durationSeconds, 0),
        personalBests: nextCompletedRuns.filter((r) => r.isPersonalBest).length,
      })
      setPhase('complete')
    }
  }

  function handleStartNext() {
    setStartedAt(new Date())
    setPhase('running')
  }

  function handleDone() {
    navigate('/tasks')
  }

  if (phase === 'loading' || tasks === null) {
    return (
      <section>
        <p>Loading…</p>
      </section>
    )
  }

  if (phase === 'no-mission' || activeMission === null) {
    return (
      <section>
        <h1>No active mission</h1>
        <p>Head back to Missions to build one.</p>
      </section>
    )
  }

  if (phase === 'step-result' && lastRun !== null) {
    const nextTask = tasks.find((t) => t.id === activeMission.taskIds[activeMission.currentIndex])
    return <MissionStepResult run={lastRun} nextTaskName={nextTask?.name ?? ''} onNext={handleStartNext} />
  }

  if (phase === 'complete' && summary !== null) {
    return (
      <section className="mission-complete">
        <h1>Mission complete 🎉</h1>
        <p className="mission-complete__row">
          <span>Planned</span>
          <span>{formatDuration(summary.plannedSeconds)}</span>
        </p>
        <p className="mission-complete__row">
          <span>Actual</span>
          <span>{formatDuration(summary.actualSeconds)}</span>
        </p>
        <p className="mission-complete__pbs">
          {summary.personalBests} personal best{summary.personalBests === 1 ? '' : 's'}
        </p>
        <button type="button" className="mission-complete__done" onClick={handleDone}>
          Done
        </button>
      </section>
    )
  }

  if (currentTask === null) {
    return (
      <section>
        <h1>Task not found</h1>
      </section>
    )
  }

  return (
    <section className="mission-runner">
      <p className="mission-runner__progress">
        Mission {activeMission.currentIndex + 1} / {activeMission.taskIds.length}
      </p>
      <Timer
        taskName={currentTask.name}
        elapsedSeconds={elapsedSeconds}
        personalBestSeconds={currentTask.personalBestSeconds}
        estimatedSeconds={currentTask.estimatedSeconds}
        showEstimate={settings.showEstimates}
        onFinish={handleFinish}
      />
      <SpotifyPlayer playlistUrl={settings.spotifyPlaylistUrl} />
    </section>
  )
}
