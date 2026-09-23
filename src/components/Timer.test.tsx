import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timer } from './Timer'

describe('Timer', () => {
  it('shows the task name', () => {
    render(
      <Timer taskName="Clean oven" elapsedSeconds={0} personalBestSeconds={null} estimatedSeconds={1500} onFinish={() => {}} />,
    )

    expect(screen.getByRole('heading', { name: 'Clean oven' })).toBeInTheDocument()
  })

  it('shows the elapsed time, formatted', () => {
    render(
      <Timer taskName="Clean oven" elapsedSeconds={331} personalBestSeconds={null} estimatedSeconds={1500} onFinish={() => {}} />,
    )

    expect(screen.getByText('05:31')).toBeInTheDocument()
  })

  it('shows the personal best when one exists', () => {
    render(
      <Timer taskName="Clean oven" elapsedSeconds={0} personalBestSeconds={342} estimatedSeconds={1500} onFinish={() => {}} />,
    )

    expect(screen.getByText('05:42')).toBeInTheDocument()
  })

  it('shows a placeholder when there is no personal best yet', () => {
    render(
      <Timer taskName="Clean oven" elapsedSeconds={0} personalBestSeconds={null} estimatedSeconds={1500} onFinish={() => {}} />,
    )

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows the estimate', () => {
    render(
      <Timer taskName="Clean oven" elapsedSeconds={0} personalBestSeconds={null} estimatedSeconds={1500} onFinish={() => {}} />,
    )

    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('hides the estimate when showEstimate is false', () => {
    render(
      <Timer
        taskName="Clean oven"
        elapsedSeconds={0}
        personalBestSeconds={null}
        estimatedSeconds={1500}
        showEstimate={false}
        onFinish={() => {}}
      />,
    )

    expect(screen.queryByText('25:00')).not.toBeInTheDocument()
    expect(screen.queryByText('Estimated')).not.toBeInTheDocument()
  })

  it('calls onFinish when the FINISH button is pressed', async () => {
    const onFinish = vi.fn()
    const user = userEvent.setup()
    render(
      <Timer taskName="Clean oven" elapsedSeconds={0} personalBestSeconds={null} estimatedSeconds={1500} onFinish={onFinish} />,
    )

    await user.click(screen.getByRole('button', { name: /finish/i }))

    expect(onFinish).toHaveBeenCalled()
  })
})
