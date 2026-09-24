import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useElapsedSeconds } from './useElapsedSeconds'

function ElapsedProbe({ active, startedAt }: { active: boolean; startedAt: Date | null }) {
  const elapsedSeconds = useElapsedSeconds(active, startedAt)
  return <p>{elapsedSeconds}</p>
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-22T09:00:00.000Z'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useElapsedSeconds', () => {
  it('reports 0 immediately when a run starts now', () => {
    render(<ElapsedProbe active={true} startedAt={new Date('2026-09-22T09:00:00.000Z')} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('ticks forward every second while active', async () => {
    render(<ElapsedProbe active={true} startedAt={new Date('2026-09-22T09:00:00.000Z')} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not tick while inactive', async () => {
    render(<ElapsedProbe active={false} startedAt={new Date('2026-09-22T09:00:00.000Z')} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('recomputes from a new start time when it changes', () => {
    const { rerender } = render(<ElapsedProbe active={true} startedAt={new Date('2026-09-22T08:53:00.000Z')} />)
    expect(screen.getByText('420')).toBeInTheDocument()

    rerender(<ElapsedProbe active={true} startedAt={new Date('2026-09-22T09:00:00.000Z')} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
