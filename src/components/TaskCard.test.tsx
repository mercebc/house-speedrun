import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TaskCard } from './TaskCard'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'
import type { Room, Task } from '../domain/tasks/task.types'

const kitchen: Room = { id: 'kitchen', name: 'Kitchen', icon: '🍳', sortOrder: 1 }

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'kitchen-counters',
    name: 'Kitchen counters',
    roomId: 'kitchen',
    frequencyDays: 1,
    estimatedSeconds: 420,
    personalBestSeconds: 342,
    lastCompletedAt: '2026-09-21T08:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    ...overrides,
  }
}

function renderCard(
  task: Task,
  now = new Date('2026-09-22T12:00:00.000Z'),
  onLogCompletion: () => void = () => {},
) {
  render(
    <MemoryRouter>
      <PhotoStorageProvider storage={createFakePhotoStorage()}>
        <TaskCard task={task} room={kitchen} now={now} onLogCompletion={onLogCompletion} />
      </PhotoStorageProvider>
    </MemoryRouter>,
  )
}

describe('TaskCard', () => {
  it('shows the task name, room, and frequency', () => {
    renderCard(buildTask())

    expect(screen.getByText('Kitchen counters')).toBeInTheDocument()
    expect(screen.getByText('Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Every day')).toBeInTheDocument()
  })

  it('shows the formatted personal best', () => {
    renderCard(buildTask({ personalBestSeconds: 342 }))

    expect(screen.getByText('PB 05:42')).toBeInTheDocument()
  })

  it('shows a placeholder when there is no personal best yet', () => {
    renderCard(buildTask({ personalBestSeconds: null }))

    expect(screen.getByText('PB —')).toBeInTheDocument()
  })

  it('shows when the task was last done', () => {
    renderCard(buildTask({ lastCompletedAt: '2026-09-21T08:00:00.000Z' }))

    expect(screen.getByText('Yesterday')).toBeInTheDocument()
  })

  it('shows "Not logged" (not a claim it was never done) when there is no completion history', () => {
    renderCard(buildTask({ lastCompletedAt: null }))

    expect(screen.getByText('Not logged')).toBeInTheDocument()
  })

  it('offers a quick way to log a completion that wasn\'t recorded through the app', async () => {
    const onLogCompletion = vi.fn()
    const user = userEvent.setup()
    renderCard(buildTask(), undefined, onLogCompletion)

    await user.click(screen.getByRole('button', { name: /log it/i }))

    expect(onLogCompletion).toHaveBeenCalled()
  })

  it('shows the computed status badge', () => {
    renderCard(buildTask({ lastCompletedAt: '2026-09-20T08:00:00.000Z', frequencyDays: 1 }))

    expect(screen.getByText('Overdue 1d')).toBeInTheDocument()
  })

  it('links to the task detail / start screen', () => {
    renderCard(buildTask({ id: 'kitchen-counters' }))

    expect(screen.getByRole('link', { name: /start/i })).toHaveAttribute('href', '/tasks/kitchen-counters')
  })
})
