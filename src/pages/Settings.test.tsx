import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Settings } from './Settings'
import { StorageProvider } from '../storage/StorageProvider'
import { SettingsProvider } from '../storage/SettingsProvider'
import { createFakeStorage } from '../test/fakeStorage'
import { DEFAULT_SETTINGS } from '../storage/storage'
import * as notifications from '../notifications/notifications'

vi.mock('../notifications/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../notifications/notifications')>()
  return { ...actual, requestNotificationPermission: vi.fn() }
})

function renderSettings(storage = createFakeStorage()) {
  render(
    <StorageProvider storage={storage}>
      <SettingsProvider>
        <Settings />
      </SettingsProvider>
    </StorageProvider>,
  )
  return storage
}

describe('Settings page', () => {
  it('shows the current settings once loaded', async () => {
    renderSettings(createFakeStorage({ settings: { ...DEFAULT_SETTINGS, morningNotificationTime: '08:30' } }))

    expect(await screen.findByRole('checkbox', { name: /morning reminder/i })).toBeChecked()
    expect(screen.getByLabelText(/time/i)).toHaveValue('08:30')
    expect(screen.getByLabelText(/super overdue threshold/i)).toHaveValue(15)
  })

  it('requests browser notification permission when morning reminder is turned on', async () => {
    vi.mocked(notifications.requestNotificationPermission).mockResolvedValue('granted')
    const user = userEvent.setup()
    const storage = renderSettings(
      createFakeStorage({ settings: { ...DEFAULT_SETTINGS, morningNotificationEnabled: false } }),
    )
    await screen.findByRole('checkbox', { name: /morning reminder/i })

    await user.click(screen.getByRole('checkbox', { name: /morning reminder/i }))

    expect(notifications.requestNotificationPermission).toHaveBeenCalled()
    const saved = await storage.getSettings()
    expect(saved.morningNotificationEnabled).toBe(true)
  })

  it('does not request permission when turning morning reminder off', async () => {
    const user = userEvent.setup()
    const storage = renderSettings(
      createFakeStorage({ settings: { ...DEFAULT_SETTINGS, morningNotificationEnabled: true } }),
    )
    await screen.findByRole('checkbox', { name: /morning reminder/i })

    await user.click(screen.getByRole('checkbox', { name: /morning reminder/i }))

    expect(notifications.requestNotificationPermission).not.toHaveBeenCalled()
    const saved = await storage.getSettings()
    expect(saved.morningNotificationEnabled).toBe(false)
  })

  it('saves a changed reminder time', async () => {
    const user = userEvent.setup()
    const storage = renderSettings()
    await screen.findByLabelText(/time/i)

    await user.clear(screen.getByLabelText(/time/i))
    await user.type(screen.getByLabelText(/time/i), '09:15')

    const saved = await storage.getSettings()
    expect(saved.morningNotificationTime).toBe('09:15')
  })

  it('saves a changed super-overdue threshold', async () => {
    const user = userEvent.setup()
    const storage = renderSettings()
    await screen.findByLabelText(/super overdue threshold/i)

    await user.clear(screen.getByLabelText(/super overdue threshold/i))
    await user.type(screen.getByLabelText(/super overdue threshold/i), '10')

    const saved = await storage.getSettings()
    expect(saved.superOverdueDays).toBe(10)
  })
})
