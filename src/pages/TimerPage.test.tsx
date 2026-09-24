import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TimerPage } from './TimerPage'
import { StorageProvider } from '../storage/StorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import { TestSettingsProvider } from '../test/TestSettingsProvider'
import { DEFAULT_SETTINGS } from '../storage/storage'
import type { Task } from '../domain/tasks/task.types'

const task: Task = {
  id: 'clean-oven',
  name: 'Clean oven',
  roomId: 'kitchen',
  frequencyDays: 30,
  estimatedSeconds: 1500,
  personalBestSeconds: 342,
  lastCompletedAt: '2026-08-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  active: true,
  supplyIds: [],
}

function renderAt(taskId: string, storage = createFakeStorage({ tasks: [task] }), settings = DEFAULT_SETTINGS) {
  render(
    <MemoryRouter initialEntries={[`/tasks/${taskId}/timer`]}>
      <StorageProvider storage={storage}>
        <TestSettingsProvider settings={settings}>
          <Routes>
            <Route path="/tasks/:taskId/timer" element={<TimerPage />} />
          </Routes>
        </TestSettingsProvider>
      </StorageProvider>
    </MemoryRouter>,
  )
  return storage
}

// Flushes the microtask queue (Promise resolutions from our fake storage)
// without relying on the real-timer polling that findBy*/waitFor use.
// userEvent's own click() also relies on that real-timer polling under fake
// timers, so interactions here use fireEvent instead.
async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-22T09:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TimerPage', () => {
  it('starts a fresh timer at 00:00 when nothing was already running', async () => {
    const storage = renderAt('clean-oven')
    await flush()

    expect(screen.getByText('00:00')).toBeInTheDocument()
    const activeRun = await storage.getActiveRun()
    expect(activeRun).toEqual({ taskId: 'clean-oven', startedAt: '2026-09-22T09:00:00.000Z' })
  })

  it('ticks the elapsed time forward every second', async () => {
    renderAt('clean-oven')
    await flush()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(screen.getByText('00:05')).toBeInTheDocument()
  })

  it('shows a resume prompt instead of ticking when a run is already active for this task', async () => {
    const storage = createFakeStorage({
      tasks: [task],
      activeRun: { taskId: 'clean-oven', startedAt: '2026-09-22T08:53:00.000Z' },
    })
    renderAt('clean-oven', storage)
    await flush()

    expect(screen.getByText(/active run/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument()
    expect(screen.queryByText('00:00')).not.toBeInTheDocument()
  })

  it('resumes counting from the original start time when continued', async () => {
    const storage = createFakeStorage({
      tasks: [task],
      activeRun: { taskId: 'clean-oven', startedAt: '2026-09-22T08:53:00.000Z' }, // 7 minutes ago
    })
    renderAt('clean-oven', storage)
    await flush()

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByText('07:00')).toBeInTheDocument()
  })

  it('discards the old run and starts a fresh one at 00:00', async () => {
    const storage = createFakeStorage({
      tasks: [task],
      activeRun: { taskId: 'clean-oven', startedAt: '2026-09-22T08:53:00.000Z' },
    })
    renderAt('clean-oven', storage)
    await flush()

    fireEvent.click(screen.getByRole('button', { name: /discard/i }))

    expect(screen.getByText('00:00')).toBeInTheDocument()
    const activeRun = await storage.getActiveRun()
    expect(activeRun).toEqual({ taskId: 'clean-oven', startedAt: '2026-09-22T09:00:00.000Z' })
  })

  it('saves a run and updates the task when finished, then clears the active run', async () => {
    const storage = renderAt('clean-oven')
    await flush()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(331_000) // 5:31
    })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /finish/i }))
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(await storage.getActiveRun()).toBeNull()
    const [savedRun] = await storage.getRuns()
    expect(savedRun).toMatchObject({ taskId: 'clean-oven', durationSeconds: 331, isPersonalBest: true })
    const [savedTask] = await storage.getTasks()
    expect(savedTask.personalBestSeconds).toBe(331)
    expect(screen.getByText(/new personal best/i)).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown task id', async () => {
    renderAt('does-not-exist')
    await flush()

    expect(screen.getByText(/task not found/i)).toBeInTheDocument()
  })

  it('shows a Spotify player once the timer is running when a playlist is configured', async () => {
    renderAt('clean-oven', undefined, {
      ...DEFAULT_SETTINGS,
      spotifyPlaylistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    })
    await flush()

    expect(screen.getByTitle(/spotify player/i)).toBeInTheDocument()
  })

  it('shows no Spotify player when no playlist is configured', async () => {
    renderAt('clean-oven')
    await flush()

    expect(screen.queryByTitle(/spotify player/i)).not.toBeInTheDocument()
  })

  it('does not show the Spotify player during the resume prompt', async () => {
    const storage = createFakeStorage({
      tasks: [task],
      activeRun: { taskId: 'clean-oven', startedAt: '2026-09-22T08:53:00.000Z' },
    })
    renderAt('clean-oven', storage, {
      ...DEFAULT_SETTINGS,
      spotifyPlaylistUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    })
    await flush()

    expect(screen.getByText(/active run/i)).toBeInTheDocument()
    expect(screen.queryByTitle(/spotify player/i)).not.toBeInTheDocument()
  })
})
