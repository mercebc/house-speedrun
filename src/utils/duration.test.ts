import { describe, expect, it } from 'vitest'
import { formatDuration, formatHoursMinutes } from './duration'

describe('formatDuration', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [65, '01:05'],
    [342, '05:42'],
    [3600, '60:00'],
    [3725, '62:05'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected)
  })
})

describe('formatHoursMinutes', () => {
  it.each([
    [0, '0m'],
    [59, '0m'],
    [60, '1m'],
    [2700, '45m'],
    [3600, '1h 0m'],
    [8040, '2h 14m'],
    [7200, '2h 0m'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatHoursMinutes(seconds)).toBe(expected)
  })
})
