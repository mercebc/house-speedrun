import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Tasks } from './Tasks'
import { StorageProvider } from '../storage/StorageProvider'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'
import type { Room, Task } from '../domain/tasks/task.types'

const now = new Date('2026-09-22T12:00:00.000Z')

const kitchen: Room = { id: 'kitchen', name: 'Kitchen', icon: '🍳', sortOrder: 1 }
const bathroom: Room = { id: 'bathroom', name: 'Bathroom', icon: '🛁', sortOrder: 2 }

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-id',
    name: 'Task name',
    roomId: 'kitchen',
    frequencyDays: 1,
    estimatedSeconds: 300,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    ...overrides,
  }
}

const superOverdueTask = buildTask({
  id: 'super-overdue',
  name: 'Under-stairs storage reset',
  roomId: 'kitchen',
  frequencyDays: 30,
  lastCompletedAt: '2026-07-01T00:00:00.000Z', // due 31 Jul, ~53 days overdue by 22 Sep
})
const neverDoneTask = buildTask({
  id: 'never-done',
  name: 'Pantry tidy',
  roomId: 'bathroom',
  frequencyDays: 14,
  lastCompletedAt: null,
})
const notDueTask = buildTask({
  id: 'not-due',
  name: 'Kitchen sink',
  roomId: 'kitchen',
  frequencyDays: 7,
  lastCompletedAt: '2026-09-21T00:00:00.000Z', // due 28 Sep, not due yet
})

function renderTasksPage(tasks: Task[]) {
  const storage = createFakeStorage({ tasks, rooms: [kitchen, bathroom] })
  render(
    <MemoryRouter>
      <StorageProvider storage={storage}>
        <PhotoStorageProvider storage={createFakePhotoStorage()}>
          <Tasks now={now} />
        </PhotoStorageProvider>
      </StorageProvider>
    </MemoryRouter>,
  )
  return storage
}

describe('Tasks page', () => {
  it('shows every task loaded from storage', async () => {
    renderTasksPage([superOverdueTask, neverDoneTask, notDueTask])

    expect(await screen.findByText('Under-stairs storage reset')).toBeInTheDocument()
    expect(screen.getByText('Pantry tidy')).toBeInTheDocument()
    expect(screen.getByText('Kitchen sink')).toBeInTheDocument()
  })

  it('shows an empty state when there are no tasks', async () => {
    renderTasksPage([])

    expect(await screen.findByText(/no tasks match/i)).toBeInTheDocument()
  })

  it('filters to only super-overdue tasks', async () => {
    const user = userEvent.setup()
    renderTasksPage([superOverdueTask, neverDoneTask, notDueTask])
    await screen.findByText('Under-stairs storage reset')

    await user.click(screen.getByRole('button', { name: /^super overdue$/i }))

    expect(screen.getByText('Under-stairs storage reset')).toBeInTheDocument()
    expect(screen.queryByText('Pantry tidy')).not.toBeInTheDocument()
    expect(screen.queryByText('Kitchen sink')).not.toBeInTheDocument()
  })

  it('filters to only never-done tasks', async () => {
    const user = userEvent.setup()
    renderTasksPage([superOverdueTask, neverDoneTask, notDueTask])
    await screen.findByText('Under-stairs storage reset')

    await user.click(screen.getByRole('button', { name: /never done/i }))

    expect(screen.getByText('Pantry tidy')).toBeInTheDocument()
    expect(screen.queryByText('Under-stairs storage reset')).not.toBeInTheDocument()
    expect(screen.queryByText('Kitchen sink')).not.toBeInTheDocument()
  })

  it('filters by room', async () => {
    const user = userEvent.setup()
    renderTasksPage([superOverdueTask, neverDoneTask, notDueTask])
    await screen.findByText('Under-stairs storage reset')

    await user.click(screen.getByRole('button', { name: /bathroom/i }))

    expect(screen.getByText('Pantry tidy')).toBeInTheDocument()
    expect(screen.queryByText('Under-stairs storage reset')).not.toBeInTheDocument()
    expect(screen.queryByText('Kitchen sink')).not.toBeInTheDocument()
  })

  it('combines the never-done filter with an empty result and shows the empty state', async () => {
    const user = userEvent.setup()
    renderTasksPage([notDueTask])
    await waitFor(() => expect(screen.getByRole('button', { name: /never done/i })).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /never done/i }))

    expect(await screen.findByText(/no tasks match/i)).toBeInTheDocument()
  })
})
