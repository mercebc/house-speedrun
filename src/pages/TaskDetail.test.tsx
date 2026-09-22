import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { TaskDetail } from './TaskDetail'
import { StorageProvider } from '../storage/StorageProvider'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'
import type { Room, Task } from '../domain/tasks/task.types'

const now = new Date('2026-09-22T12:00:00.000Z')

const kitchen: Room = { id: 'kitchen', name: 'Kitchen', icon: '🍳', sortOrder: 1 }

const task: Task = {
  id: 'clean-oven',
  name: 'Clean oven',
  roomId: 'kitchen',
  frequencyDays: 30,
  estimatedSeconds: 1500,
  personalBestSeconds: 1230,
  lastCompletedAt: '2026-08-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  active: true,
}

function renderAt(taskId: string, tasks: Task[] = [task]) {
  const storage = createFakeStorage({ tasks, rooms: [kitchen] })
  render(
    <MemoryRouter initialEntries={[`/tasks/${taskId}`]}>
      <StorageProvider storage={storage}>
        <PhotoStorageProvider storage={createFakePhotoStorage()}>
          <Routes>
            <Route path="/tasks/:taskId" element={<TaskDetail now={now} />} />
          </Routes>
        </PhotoStorageProvider>
      </StorageProvider>
    </MemoryRouter>,
  )
}

describe('TaskDetail', () => {
  it('shows the task name as the heading', async () => {
    renderAt('clean-oven')

    expect(await screen.findByRole('heading', { name: 'Clean oven' })).toBeInTheDocument()
  })

  it('shows the room and frequency', async () => {
    renderAt('clean-oven')

    await screen.findByRole('heading', { name: 'Clean oven' })
    expect(screen.getByText('Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Every 30 days')).toBeInTheDocument()
  })

  it('shows the personal best and last completed date', async () => {
    renderAt('clean-oven')

    await screen.findByRole('heading', { name: 'Clean oven' })
    expect(screen.getByText('20:30')).toBeInTheDocument()
    expect(screen.getByText('1 Aug')).toBeInTheDocument()
  })

  it('shows the computed status', async () => {
    renderAt('clean-oven')

    expect(await screen.findByText(/overdue/i)).toBeInTheDocument()
  })

  it('offers a photo upload area', async () => {
    renderAt('clean-oven')

    expect(await screen.findByRole('button', { name: /add a photo/i })).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown task id', async () => {
    renderAt('does-not-exist')

    expect(await screen.findByText(/task not found/i)).toBeInTheDocument()
  })
})
