import { describe, expect, it } from 'vitest'
import { buildMorningNotificationContent, shouldShowMorningNotification } from './notifications'
import { DEFAULT_SETTINGS, type Settings } from '../storage/storage'
import type { Task } from '../domain/tasks/task.types'

const now = new Date('2026-08-24T08:00:00.000Z')

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
    ...overrides,
  }
}

describe('buildMorningNotificationContent', () => {
  it('has the House Speedrun title', () => {
    const content = buildMorningNotificationContent([], now, 15)

    expect(content.title).toBe('House Speedrun')
  })

  it('celebrates when nothing is super-overdue', () => {
    const notOverdue = buildTask({ lastCompletedAt: '2026-08-20T00:00:00.000Z', frequencyDays: 7 })

    const content = buildMorningNotificationContent([notOverdue], now, 15)

    expect(content.body).toBe('Nothing is more than 15 days overdue. 🎉')
  })

  it('lists each super-overdue job with its days overdue and PB', () => {
    const superOverdue = buildTask({
      name: 'Bathroom full clean',
      lastCompletedAt: '2026-08-01T00:00:00.000Z', // due 8 Aug -> 16 days overdue on 24 Aug
      frequencyDays: 7,
      personalBestSeconds: 1062, // 17:42
    })

    const content = buildMorningNotificationContent([superOverdue], now, 15)

    expect(content.body).toContain('You have 1 super-overdue job:')
    expect(content.body).toContain('🔴 Bathroom full clean')
    expect(content.body).toContain('16 days overdue')
    expect(content.body).toContain('PB 17:42')
  })

  it('pluralizes for more than one super-overdue job', () => {
    const a = buildTask({ id: 'a', lastCompletedAt: '2026-08-01T00:00:00.000Z', frequencyDays: 7 })
    const b = buildTask({ id: 'b', lastCompletedAt: '2026-07-01T00:00:00.000Z', frequencyDays: 7 })

    const content = buildMorningNotificationContent([a, b], now, 15)

    expect(content.body).toContain('You have 2 super-overdue jobs:')
  })

  it('shows a placeholder PB when the job has never been timed', () => {
    const superOverdue = buildTask({
      lastCompletedAt: '2026-08-01T00:00:00.000Z',
      frequencyDays: 7,
      personalBestSeconds: null,
    })

    const content = buildMorningNotificationContent([superOverdue], now, 15)

    expect(content.body).toContain('PB —')
  })
})

describe('shouldShowMorningNotification', () => {
  function buildSettings(overrides: Partial<Settings> = {}): Settings {
    return { ...DEFAULT_SETTINGS, morningNotificationEnabled: true, morningNotificationTime: '08:30', ...overrides }
  }

  it('is false when morning reminders are disabled', () => {
    const result = shouldShowMorningNotification({
      settings: buildSettings({ morningNotificationEnabled: false }),
      now: new Date('2026-08-24T09:00:00.000Z'),
      lastShownDate: null,
      permissionGranted: true,
    })

    expect(result).toBe(false)
  })

  it('is false without notification permission', () => {
    const result = shouldShowMorningNotification({
      settings: buildSettings(),
      now: new Date('2026-08-24T09:00:00.000Z'),
      lastShownDate: null,
      permissionGranted: false,
    })

    expect(result).toBe(false)
  })

  it('is false before the configured time', () => {
    const result = shouldShowMorningNotification({
      settings: buildSettings({ morningNotificationTime: '08:30' }),
      now: new Date('2026-08-24T08:00:00.000Z'),
      lastShownDate: null,
      permissionGranted: true,
    })

    expect(result).toBe(false)
  })

  it('is true at or after the configured time, when not already shown today', () => {
    const result = shouldShowMorningNotification({
      settings: buildSettings({ morningNotificationTime: '08:30' }),
      now: new Date('2026-08-24T08:30:00.000Z'),
      lastShownDate: null,
      permissionGranted: true,
    })

    expect(result).toBe(true)
  })

  it('is false when already shown today', () => {
    const result = shouldShowMorningNotification({
      settings: buildSettings(),
      now: new Date('2026-08-24T09:00:00.000Z'),
      lastShownDate: '2026-08-24',
      permissionGranted: true,
    })

    expect(result).toBe(false)
  })

  it('is true again the next day', () => {
    const result = shouldShowMorningNotification({
      settings: buildSettings(),
      now: new Date('2026-08-25T09:00:00.000Z'),
      lastShownDate: '2026-08-24',
      permissionGranted: true,
    })

    expect(result).toBe(true)
  })
})
