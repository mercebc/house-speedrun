import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MissionCard } from './MissionCard'
import type { Mission } from '../domain/missions/mission.types'
import type { Task } from '../domain/tasks/task.types'

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    name: 'Kitchen counters',
    roomId: 'kitchen',
    frequencyDays: 1,
    estimatedSeconds: 420,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    ...overrides,
  }
}

describe('MissionCard', () => {
  it('shows the mission heading with the available minutes', () => {
    const mission: Mission = {
      items: [buildTask()],
      availableSeconds: 1200,
      totalSeconds: 420,
      hadEligibleTasks: true,
    }
    render(<MissionCard mission={mission} minutes={20} onStart={() => {}} />)

    expect(screen.getByText(/20 minute mission/i)).toBeInTheDocument()
    expect(screen.getByText(/you have 20 minutes/i)).toBeInTheDocument()
  })

  it('lists each mission item with its duration', () => {
    const mission: Mission = {
      items: [
        buildTask({ id: 'a', name: 'Kitchen counters', estimatedSeconds: 420 }),
        buildTask({ id: 'b', name: 'Kitchen sink', estimatedSeconds: 300 }),
      ],
      availableSeconds: 1200,
      totalSeconds: 720,
      hadEligibleTasks: true,
    }
    render(<MissionCard mission={mission} minutes={20} onStart={() => {}} />)

    expect(screen.getByText('Kitchen counters')).toBeInTheDocument()
    expect(screen.getByText('07:00')).toBeInTheDocument()
    expect(screen.getByText('Kitchen sink')).toBeInTheDocument()
    expect(screen.getByText('05:00')).toBeInTheDocument()
  })

  it('shows the total time, distinct from any single item duration', () => {
    const mission: Mission = {
      items: [buildTask({ id: 'a', estimatedSeconds: 420 }), buildTask({ id: 'b', estimatedSeconds: 300 })],
      availableSeconds: 1200,
      totalSeconds: 720,
      hadEligibleTasks: true,
    }
    render(<MissionCard mission={mission} minutes={20} onStart={() => {}} />)

    expect(screen.getByText('12:00')).toBeInTheDocument()
  })

  it('calls onStart when the START MISSION button is pressed', async () => {
    const onStart = vi.fn()
    const user = userEvent.setup()
    const mission: Mission = {
      items: [buildTask()],
      availableSeconds: 1200,
      totalSeconds: 420,
      hadEligibleTasks: true,
    }
    render(<MissionCard mission={mission} minutes={20} onStart={onStart} />)

    await user.click(screen.getByRole('button', { name: /start mission/i }))

    expect(onStart).toHaveBeenCalled()
  })

  it('shows "No suitable jobs found" when nothing is due, with no start button', () => {
    const mission: Mission = { items: [], availableSeconds: 1200, totalSeconds: 0, hadEligibleTasks: false }
    render(<MissionCard mission={mission} minutes={20} onStart={() => {}} />)

    expect(screen.getByText(/no suitable jobs found/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /start mission/i })).not.toBeInTheDocument()
  })

  it('shows "Nothing fits" when eligible jobs exist but none fit the time, with no start button', () => {
    const mission: Mission = { items: [], availableSeconds: 60, totalSeconds: 0, hadEligibleTasks: true }
    render(<MissionCard mission={mission} minutes={1} onStart={() => {}} />)

    expect(screen.getByText(/nothing fits/i)).toBeInTheDocument()
    expect(screen.getByText(/try 10 more minutes/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /start mission/i })).not.toBeInTheDocument()
  })
})
