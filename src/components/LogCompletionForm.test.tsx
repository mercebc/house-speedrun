import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LogCompletionForm } from './LogCompletionForm'

const now = new Date('2026-09-22T15:30:00.000Z')

describe('LogCompletionForm', () => {
  it('defaults the date to today', () => {
    render(<LogCompletionForm now={now} onLog={() => {}} />)

    expect(screen.getByLabelText(/date/i)).toHaveValue('2026-09-22')
  })

  it('logs today\'s date when submitted unchanged', async () => {
    const onLog = vi.fn()
    const user = userEvent.setup()
    render(<LogCompletionForm now={now} onLog={onLog} />)

    await user.click(screen.getByRole('button', { name: /log it/i }))

    expect(onLog).toHaveBeenCalledWith(new Date('2026-09-22T00:00:00.000Z'))
  })

  it('logs a backdated date when the user picks an earlier day', async () => {
    const onLog = vi.fn()
    const user = userEvent.setup()
    render(<LogCompletionForm now={now} onLog={onLog} />)

    await user.clear(screen.getByLabelText(/date/i))
    await user.type(screen.getByLabelText(/date/i), '2026-09-18')
    await user.click(screen.getByRole('button', { name: /log it/i }))

    expect(onLog).toHaveBeenCalledWith(new Date('2026-09-18T00:00:00.000Z'))
  })
})
