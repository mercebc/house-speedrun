import { describe, expect, it } from 'vitest'
import { formatDuration } from './duration'

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
