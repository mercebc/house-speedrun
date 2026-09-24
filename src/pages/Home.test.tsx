import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Home } from './Home'
import { StorageProvider } from '../storage/StorageProvider'
import { SettingsProvider } from '../storage/SettingsProvider'
import { createFakeStorage } from '../test/fakeStorage'
import { DEFAULT_SETTINGS } from '../storage/storage'
import type { Task } from '../domain/tasks/task.types'
import * as notifications from '../notifications/notifications'

vi.mock('../notifications/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../notifications/notifications')>()
  return {
    ...actual,
    getNotificationPermission: vi.fn(() => 'granted' as NotificationPermission),
    showNotification: vi.fn(),
  }
})

const now = new Date('2026-08-24T09:00:00.000Z')

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task',
    name: 'Bathroom full clean',
    roomId: 'bathroom',
    frequencyDays: 7,
    estimatedSeconds: 1080,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
    supplyIds: [],
    ...overrides,
  }
}

function renderHome(storage = createFakeStorage()) {
  render(
    <StorageProvider storage={storage}>
      <SettingsProvider>
        <Home now={now} />
      </SettingsProvider>
    </StorageProvider>,
  )
  return storage
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('Home page', () => {
  it('shows how many tasks are super-overdue', async () => {
    const superOverdue = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 }) // 16 days overdue
    renderHome(createFakeStorage({ tasks: [superOverdue] }))

    expect(await screen.findByText(/1 super overdue/i)).toBeInTheDocument()
  })

  it('shows a celebratory message when nothing is super-overdue', async () => {
    const notOverdue = buildTask({ lastCompletedAt: '2026-08-20T00:00:00.000Z', frequencyDays: 7 })
    renderHome(createFakeStorage({ tasks: [notOverdue] }))

    expect(await screen.findByText(/nothing is more than 15 days overdue/i)).toBeInTheDocument()
  })

  it('shows a morning notification once, when conditions are met, and records the date', async () => {
    const superOverdue = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })
    const storage = createFakeStorage({
      tasks: [superOverdue],
      settings: { ...DEFAULT_SETTINGS, morningNotificationEnabled: true, morningNotificationTime: '08:30' },
      lastMorningNotificationDate: null,
    })
    renderHome(storage)

    await screen.findByText(/1 super overdue/i)
    expect(notifications.showNotification).toHaveBeenCalledTimes(1)
    expect(await storage.getLastMorningNotificationDate()).toBe('2026-08-24')
  })

  it('does not show a notification twice in the same day', async () => {
    const superOverdue = buildTask({ lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })
    const storage = createFakeStorage({
      tasks: [superOverdue],
      settings: { ...DEFAULT_SETTINGS, morningNotificationEnabled: true, morningNotificationTime: '08:30' },
      lastMorningNotificationDate: '2026-08-24',
    })
    renderHome(storage)

    await screen.findByText(/1 super overdue/i)
    expect(notifications.showNotification).not.toHaveBeenCalled()
  })

  it('does not show a notification when morning reminders are disabled', async () => {
    const storage = createFakeStorage({
      tasks: [],
      settings: { ...DEFAULT_SETTINGS, morningNotificationEnabled: false },
    })
    renderHome(storage)

    await screen.findByText(/nothing is more than/i)
    expect(notifications.showNotification).not.toHaveBeenCalled()
  })
})
