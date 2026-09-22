import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeSelector } from './TimeSelector'

describe('TimeSelector', () => {
  it('offers the standard set of durations', () => {
    render(<TimeSelector selectedMinutes={null} onSelect={() => {}} />)

    for (const minutes of [10, 20, 30, 45, 60]) {
      expect(screen.getByRole('button', { name: `${minutes} min` })).toBeInTheDocument()
    }
  })

  it('marks the selected duration as pressed', () => {
    render(<TimeSelector selectedMinutes={20} onSelect={() => {}} />)

    expect(screen.getByRole('button', { name: '20 min' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '10 min' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onSelect with the number of minutes chosen', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<TimeSelector selectedMinutes={null} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: '45 min' }))

    expect(onSelect).toHaveBeenCalledWith(45)
  })
})
