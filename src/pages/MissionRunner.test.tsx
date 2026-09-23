import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MissionRunner } from './MissionRunner'
import { StorageProvider } from '../storage/StorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import type { Task } from '../domain/tasks/task.types'
import type { ActiveMission } from '../domain/missions/mission.types'

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task',
    name: 'Task',
    roomId: 'kitchen',
    frequencyDays: 7,
    estimatedSeconds: 300,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    supplyIds: [],
    ...overrides,
  }
}

const kitchenCounters = buildTask({ id: 'kitchen-counters', name: 'Kitchen counters', estimatedSeconds: 420 })
const kitchenSink = buildTask({ id: 'kitchen-sink', name: 'Kitchen sink', estimatedSeconds: 300 })

function renderRunner(tasks: Task[], activeMission: ActiveMission | null) {
  const storage = createFakeStorage({ tasks, activeMission })
  render(
    <MemoryRouter initialEntries={['/missions/run']}>
      <StorageProvider storage={storage}>
        <Routes>
          <Route path="/missions/run" element={<MissionRunner />} />
          <Route path="/tasks" element={<p>tasks page</p>} />
        </Routes>
      </StorageProvider>
    </MemoryRouter>,
  )
  return storage
}

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

describe('MissionRunner', () => {
  it('starts the first task of the mission', async () => {
    renderRunner([kitchenCounters, kitchenSink], {
      taskIds: ['kitchen-counters', 'kitchen-sink'],
      availableSeconds: 1200,
      currentIndex: 0,
    })
    await flush()

    expect(screen.getByText(/1 \s*\/\s*2/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Kitchen counters' })).toBeInTheDocument()
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('shows a friendly message when there is no active mission', async () => {
    renderRunner([kitchenCounters], null)
    await flush()

    expect(screen.getByText(/no active mission/i)).toBeInTheDocument()
  })

  it('moves to the step result, then to the next task, when a step finishes', async () => {
    const storage = renderRunner([kitchenCounters, kitchenSink], {
      taskIds: ['kitchen-counters', 'kitchen-sink'],
      availableSeconds: 1200,
      currentIndex: 0,
    })
    await flush()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /finish/i }))
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText('Kitchen sink')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start next/i })).toBeInTheDocument()
    const activeMission = await storage.getActiveMission()
    expect(activeMission?.currentIndex).toBe(1)

    fireEvent.click(screen.getByRole('button', { name: /start next/i }))
    await flush()

    expect(screen.getByText(/2\s*\/\s*2/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Kitchen sink' })).toBeInTheDocument()
    expect(screen.getByText('00:00')).toBeInTheDocument()
  })

  it('shows the mission-complete summary after the last task, and clears the active mission', async () => {
    const storage = renderRunner([kitchenCounters], {
      taskIds: ['kitchen-counters'],
      availableSeconds: 420,
      currentIndex: 0,
    })
    await flush()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400_000) // 6:40 actual, vs 7:00 planned
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /finish/i }))
      await vi.advanceTimersByTimeAsync(0)
    })

    expect(screen.getByText(/mission complete/i)).toBeInTheDocument()
    expect(screen.getByText('07:00')).toBeInTheDocument() // planned
    expect(screen.getByText('06:40')).toBeInTheDocument() // actual
    expect(screen.getByText(/1 personal best/i)).toBeInTheDocument()
    expect(await storage.getActiveMission()).toBeNull()
  })

  it('navigates away when the mission-complete Done button is pressed', async () => {
    renderRunner([kitchenCounters], {
      taskIds: ['kitchen-counters'],
      availableSeconds: 420,
      currentIndex: 0,
    })
    await flush()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /finish/i }))
      await vi.advanceTimersByTimeAsync(0)
    })
    fireEvent.click(screen.getByRole('button', { name: /done/i }))

    expect(screen.getByText('tasks page')).toBeInTheDocument()
  })
})
