const MS_PER_DAY = 86_400_000
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function toUtcCalendarDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function diffInCalendarDays(a: Date, b: Date): number {
  return Math.round((toUtcCalendarDay(a) - toUtcCalendarDay(b)) / MS_PER_DAY)
}

export function formatFrequency(frequencyDays: number): string {
  return frequencyDays === 1 ? 'Every day' : `Every ${frequencyDays} days`
}

export function formatRelativeDate(iso: string, now: Date): string {
  const date = new Date(iso)
  const daysAgo = diffInCalendarDays(now, date)

  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  return `${date.getUTCDate()} ${SHORT_MONTHS[date.getUTCMonth()]}`
}
