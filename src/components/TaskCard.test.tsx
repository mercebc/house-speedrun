import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TaskCard } from './TaskCard'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'
import { TestSettingsProvider } from '../test/TestSettingsProvider'
import type { Room, Task } from '../domain/tasks/task.types'
import type { Supply } from '../domain/supplies/supply.types'

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
    supplyIds: [],
    ...overrides,
  }
}

function renderCard(
  task: Task,
  now = new Date('2026-09-22T12:00:00.000Z'),
  onLogCompletion: () => void = () => {},
  supplies: Supply[] = [],
) {
  render(
    <MemoryRouter>
      <TestSettingsProvider>
        <PhotoStorageProvider storage={createFakePhotoStorage()}>
          <TaskCard task={task} room={kitchen} supplies={supplies} now={now} onLogCompletion={onLogCompletion} />
        </PhotoStorageProvider>
      </TestSettingsProvider>
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

  it('links the Start button to the timer', () => {
    renderCard(buildTask({ id: 'kitchen-counters' }))

    expect(screen.getByRole('link', { name: /start/i })).toHaveAttribute('href', '/tasks/kitchen-counters/timer')
  })

  it('links the task name to its detail page', () => {
    renderCard(buildTask({ id: 'kitchen-counters', name: 'Kitchen counters' }))

    expect(screen.getByRole('link', { name: 'Kitchen counters' })).toHaveAttribute(
      'href',
      '/tasks/kitchen-counters',
    )
  })

  it('shows the supplies collage for this task', async () => {
    renderCard(buildTask({ supplyIds: ['mop', 'bucket'] }), undefined, undefined, [
      { id: 'mop', name: 'Mop' },
      { id: 'bucket', name: 'Bucket' },
    ])

    expect(await screen.findByText('Mop')).toBeInTheDocument()
    expect(screen.getByText('Bucket')).toBeInTheDocument()
  })

  it('does not show a supplies section when the task needs none', () => {
    renderCard(buildTask({ supplyIds: [] }), undefined, undefined, [])

    expect(screen.queryByText(/no supplies/i)).not.toBeInTheDocument()
  })
})
