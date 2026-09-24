import { describe, expect, it } from 'vitest'
import { diffInCalendarDays, formatFrequency, formatRelativeDate } from './dates'

describe('diffInCalendarDays', () => {
  it('returns 0 for the same calendar day', () => {
    expect(diffInCalendarDays(new Date('2026-08-22T18:00:00.000Z'), new Date('2026-08-22T02:00:00.000Z'))).toBe(0)
  })

  it('returns a positive count when the first date is later', () => {
    expect(diffInCalendarDays(new Date('2026-08-22T00:00:00.000Z'), new Date('2026-08-08T00:00:00.000Z'))).toBe(14)
  })

  it('returns a negative count when the first date is earlier', () => {
    expect(diffInCalendarDays(new Date('2026-08-01T00:00:00.000Z'), new Date('2026-08-08T00:00:00.000Z'))).toBe(-7)
  })

  it('matches the spec example: 24 August is 16 days after 8 August', () => {
    expect(diffInCalendarDays(new Date('2026-08-24T00:00:00.000Z'), new Date('2026-08-08T00:00:00.000Z'))).toBe(16)
  })
})

describe('formatRelativeDate', () => {
  const now = new Date('2026-09-22T12:00:00.000Z')

  it('formats today as "Today"', () => {
    expect(formatRelativeDate('2026-09-22T08:00:00.000Z', now)).toBe('Today')
  })

  it('formats yesterday as "Yesterday"', () => {
    expect(formatRelativeDate('2026-09-21T08:00:00.000Z', now)).toBe('Yesterday')
  })

  it('formats older dates as day + short month', () => {
    expect(formatRelativeDate('2026-09-18T08:00:00.000Z', now)).toBe('18 Sep')
  })

  it('formats future dates as day + short month', () => {
    expect(formatRelativeDate('2026-09-25T08:00:00.000Z', now)).toBe('25 Sep')
  })
})

describe('formatFrequency', () => {
  it('formats a 1-day frequency as "Every day"', () => {
    expect(formatFrequency(1)).toBe('Every day')
  })

  it('formats a multi-day frequency as "Every N days"', () => {
    expect(formatFrequency(7)).toBe('Every 7 days')
  })
})
