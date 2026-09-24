import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManageTasks } from './ManageTasks'
import { StorageProvider } from '../storage/StorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import type { Task, Room } from '../domain/tasks/task.types'

const kitchen: Room = { id: 'kitchen', name: 'Kitchen', icon: '🍳', sortOrder: 1 }
const living: Room = { id: 'living', name: 'Living', icon: '🛋️', sortOrder: 2 }

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'clean-oven',
    name: 'Clean oven',
    roomId: 'kitchen',
    frequencyDays: 30,
    estimatedSeconds: 1500,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    supplyIds: [],
    ...overrides,
  }
}

function renderPage(tasks: Task[], rooms: Room[] = [kitchen, living]) {
  const storage = createFakeStorage({ tasks, rooms })
  render(
    <StorageProvider storage={storage}>
      <ManageTasks />
    </StorageProvider>,
  )
  return storage
}

describe('ManageTasks page', () => {
  it('shows an empty state when there are no tasks', async () => {
    renderPage([])

    expect(await screen.findByText(/no tasks yet/i)).toBeInTheDocument()
  })

  it('lists every task with an editable name', async () => {
    renderPage([buildTask({ id: 'clean-oven', name: 'Clean oven' }), buildTask({ id: 'mop-floors', name: 'Mop floors' })])

    expect(await screen.findByDisplayValue('Clean oven')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Mop floors')).toBeInTheDocument()
  })

  it('renames a task', async () => {
    const user = userEvent.setup()
    const storage = renderPage([buildTask()])
    const input = await screen.findByDisplayValue('Clean oven')

    await user.clear(input)
    await user.type(input, 'Deep clean oven')
    input.blur()

    const [savedTask] = await storage.getTasks()
    expect(savedTask.name).toBe('Deep clean oven')
  })

  it('deletes a task', async () => {
    const user = userEvent.setup()
    const storage = renderPage([
      buildTask({ id: 'clean-oven', name: 'Clean oven' }),
      buildTask({ id: 'mop-floors', name: 'Mop floors' }),
    ])
    await screen.findByDisplayValue('Clean oven')

    const ovenRow = screen.getByDisplayValue('Clean oven').closest('li')!
    await user.click(within(ovenRow).getByRole('button', { name: /delete/i }))

    expect(screen.queryByDisplayValue('Clean oven')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue('Mop floors')).toBeInTheDocument()
    const tasks = await storage.getTasks()
    expect(tasks.find((t) => t.id === 'clean-oven')).toBeUndefined()
  })

  it('adds a new task', async () => {
    const user = userEvent.setup()
    const storage = renderPage([])
    await screen.findByText(/no tasks yet/i)

    await user.type(screen.getByLabelText(/task name/i), 'Clean fridge')
    await user.selectOptions(screen.getByLabelText(/^room$/i), 'living')
    await user.clear(screen.getByLabelText(/frequency/i))
    await user.type(screen.getByLabelText(/frequency/i), '21')
    await user.clear(screen.getByLabelText(/estimated minutes/i))
    await user.type(screen.getByLabelText(/estimated minutes/i), '10')
    await user.click(screen.getByRole('button', { name: /add task/i }))

    expect(await screen.findByDisplayValue('Clean fridge')).toBeInTheDocument()
    const [savedTask] = await storage.getTasks()
    expect(savedTask).toMatchObject({
      name: 'Clean fridge',
      roomId: 'living',
      frequencyDays: 21,
      estimatedSeconds: 600,
      active: true,
      personalBestSeconds: null,
      lastCompletedAt: null,
      supplyIds: [],
    })
  })
})
