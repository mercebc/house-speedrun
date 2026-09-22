import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Timer } from '../components/Timer'
import { RunResult } from '../components/RunResult'
import { finishRun } from '../domain/runs/run.service'
import type { CleaningRun } from '../domain/runs/run.types'
import type { Task } from '../domain/tasks/task.types'
import { useStorage } from '../storage/useStorage'

type Phase = 'loading' | 'resume-prompt' | 'running' | 'finished'

export function TimerPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const storage = useStorage()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [resumeMinutesAgo, setResumeMinutesAgo] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [result, setResult] = useState<CleaningRun | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([storage.getTasks(), storage.getActiveRun()]).then(([loadedTasks, activeRun]) => {
      if (cancelled) return
      setTasks(loadedTasks)

      const task = loadedTasks.find((t) => t.id === taskId)
      if (task === undefined) return

      if (activeRun !== null && activeRun.taskId === task.id) {
        const startedAtDate = new Date(activeRun.startedAt)
        setStartedAt(startedAtDate)
        setResumeMinutesAgo(Math.round((Date.now() - startedAtDate.getTime()) / 60_000))
        setPhase('resume-prompt')
      } else {
        const now = new Date()
        storage.saveActiveRun({ taskId: task.id, startedAt: now.toISOString() })
        setStartedAt(now)
        setPhase('running')
      }
    })

    return () => {
      cancelled = true
    }
  }, [storage, taskId])

  useEffect(() => {
    if (phase !== 'running' || startedAt === null) return

    function tick() {
      setElapsedSeconds(Math.round((Date.now() - startedAt!.getTime()) / 1000))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [phase, startedAt])

  const task = tasks?.find((t) => t.id === taskId) ?? null

  function handleContinue() {
    setPhase('running')
  }

  function handleDiscard() {
    const now = new Date()
    storage.saveActiveRun({ taskId: task!.id, startedAt: now.toISOString() })
    setStartedAt(now)
    setElapsedSeconds(0)
    setPhase('running')
  }

  async function handleFinish() {
    const finishedAt = new Date()
    const { run, updatedTask } = finishRun(task!, startedAt!, finishedAt, crypto.randomUUID())

    await storage.saveRun(run)
    await storage.saveTask(updatedTask)
    await storage.saveActiveRun(null)

    setTasks((prev) => prev?.map((t) => (t.id === updatedTask.id ? updatedTask : t)) ?? null)
    setResult(run)
    setPhase('finished')
  }

  function handleDone() {
    navigate(`/tasks/${taskId}`)
  }

  if (tasks === null) {
    return (
      <section>
        <p>Loading…</p>
      </section>
    )
  }

  if (task === null) {
    return (
      <section>
        <h1>Task not found</h1>
        <p>This task may have been removed.</p>
      </section>
    )
  }

  if (phase === 'resume-prompt' && startedAt !== null) {
    return (
      <section className="timer-resume">
        <h1>You have an active run</h1>
        <p className="timer-resume__task-name">{task.name}</p>
        <p className="timer-resume__started">Started {resumeMinutesAgo}m ago</p>
        <div className="timer-resume__actions">
          <button type="button" onClick={handleContinue}>
            Continue
          </button>
          <button type="button" onClick={handleDiscard}>
            Discard
          </button>
        </div>
      </section>
    )
  }

  if (phase === 'finished' && result !== null) {
    return <RunResult taskName={task.name} run={result} onDone={handleDone} />
  }

  return (
    <Timer
      taskName={task.name}
      elapsedSeconds={elapsedSeconds}
      personalBestSeconds={task.personalBestSeconds}
      estimatedSeconds={task.estimatedSeconds}
      onFinish={handleFinish}
    />
  )
}
