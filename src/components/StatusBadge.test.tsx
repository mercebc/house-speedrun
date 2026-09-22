import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('shows "Never done" for a task with no history', () => {
    render(<StatusBadge status="never_done" daysOverdue={0} />)

    expect(screen.getByText('Never done')).toBeInTheDocument()
  })

  it('shows "Not due" for a task that is not yet due', () => {
    render(<StatusBadge status="not_due" daysOverdue={-3} />)

    expect(screen.getByText('Not due')).toBeInTheDocument()
  })

  it('shows "Due today" for a task due today', () => {
    render(<StatusBadge status="due" daysOverdue={0} />)

    expect(screen.getByText('Due today')).toBeInTheDocument()
  })

  it('shows the day count for an overdue task', () => {
    render(<StatusBadge status="overdue" daysOverdue={3} />)

    expect(screen.getByText('Overdue 3d')).toBeInTheDocument()
  })

  it('shows the day count for a super-overdue task', () => {
    render(<StatusBadge status="super_overdue" daysOverdue={16} />)

    expect(screen.getByText('Super overdue 16d')).toBeInTheDocument()
  })
})
