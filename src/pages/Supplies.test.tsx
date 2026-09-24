import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Supplies } from './Supplies'
import { StorageProvider } from '../storage/StorageProvider'
import { PhotoStorageProvider } from '../storage/PhotoStorageProvider'
import { createFakeStorage } from '../test/fakeStorage'
import { createFakePhotoStorage } from '../test/fakePhotoStorage'
import type { Task } from '../domain/tasks/task.types'
import type { Supply } from '../domain/supplies/supply.types'

const mop: Supply = { id: 'mop', name: 'Mop' }
const bucket: Supply = { id: 'bucket', name: 'Bucket' }
const sprayBottle: Supply = { id: 'spray-bottle', name: 'All-purpose spray' }

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'mop-floors',
    name: 'Mop floors',
    roomId: 'wholehouse',
    frequencyDays: 7,
    estimatedSeconds: 900,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    supplyIds: ['mop'],
    ...overrides,
  }
}

function renderSupplies(tasks: Task[], supplies: Supply[]) {
  const storage = createFakeStorage({ tasks, supplies })
  render(
    <StorageProvider storage={storage}>
      <PhotoStorageProvider storage={createFakePhotoStorage()}>
        <Supplies />
      </PhotoStorageProvider>
    </StorageProvider>,
  )
  return storage
}

describe('Supplies page', () => {
  it('shows an empty state when the catalogue has no supplies', async () => {
    renderSupplies([], [])

    expect(await screen.findByText(/no supplies in your catalogue yet/i)).toBeInTheDocument()
  })

  it('lists every supply, each with a default photo', async () => {
    renderSupplies([buildTask()], [mop, bucket, sprayBottle])

    expect(await screen.findByText('Mop')).toBeInTheDocument()
    expect(screen.getByText('Bucket')).toBeInTheDocument()
    expect(screen.getByText('All-purpose spray')).toBeInTheDocument()
    expect(screen.getByAltText('Mop')).toHaveAttribute('src', '/supplies/defaults/mop.png')
    expect(screen.getByAltText('Bucket')).toHaveAttribute('src', '/supplies/defaults/bucket.png')
    expect(screen.getByAltText('All-purpose spray')).toHaveAttribute('src', '/supplies/defaults/spray-bottle.png')
  })

  it('offers a change-photo control only for product supplies, not utensils', async () => {
    renderSupplies([buildTask()], [mop, sprayBottle])
    await screen.findByText('Mop')

    const mopCard = screen.getByRole('group', { name: 'Mop' })
    const sprayCard = screen.getByRole('group', { name: 'All-purpose spray' })

    expect(within(sprayCard).getByRole('button', { name: /change/i })).toBeInTheDocument()
    expect(within(mopCard).queryByRole('button', { name: /add a photo|change/i })).not.toBeInTheDocument()
  })

  it('checks the tasks a supply is already assigned to', async () => {
    renderSupplies([buildTask({ id: 'mop-floors', name: 'Mop floors', supplyIds: ['mop'] })], [mop])
    await screen.findByText('Mop')

    const mopCard = screen.getByRole('group', { name: 'Mop' })
    await userEvent.setup().click(within(mopCard).getByRole('button', { name: /used for/i }))

    expect(within(mopCard).getByRole('checkbox', { name: 'Mop floors' })).toBeChecked()
  })

  it('assigns a supply to a task when its checkbox is checked', async () => {
    const user = userEvent.setup()
    const storage = renderSupplies(
      [buildTask({ id: 'mop-floors', name: 'Mop floors', supplyIds: [] })],
      [mop],
    )
    await screen.findByText('Mop')

    const mopCard = screen.getByRole('group', { name: 'Mop' })
    await user.click(within(mopCard).getByRole('button', { name: /used for/i }))
    await user.click(within(mopCard).getByRole('checkbox', { name: 'Mop floors' }))

    const [savedTask] = await storage.getTasks()
    expect(savedTask.supplyIds).toEqual(['mop'])
  })

  it('unassigns a supply from a task when its checkbox is unchecked', async () => {
    const user = userEvent.setup()
    const storage = renderSupplies(
      [buildTask({ id: 'mop-floors', name: 'Mop floors', supplyIds: ['mop', 'bucket'] })],
      [mop],
    )
    await screen.findByText('Mop')

    const mopCard = screen.getByRole('group', { name: 'Mop' })
    await user.click(within(mopCard).getByRole('button', { name: /used for/i }))
    await user.click(within(mopCard).getByRole('checkbox', { name: 'Mop floors' }))

    const [savedTask] = await storage.getTasks()
    expect(savedTask.supplyIds).toEqual(['bucket'])
  })
})
