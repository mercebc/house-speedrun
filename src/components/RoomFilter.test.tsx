import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoomFilter } from './RoomFilter'
import type { Room } from '../domain/tasks/task.types'

const rooms: Room[] = [
  { id: 'kitchen', name: 'Kitchen', icon: '🍳', sortOrder: 1 },
  { id: 'living', name: 'Living', icon: '🛋️', sortOrder: 2 },
]

describe('RoomFilter', () => {
  it('shows an "All rooms" option alongside each room', () => {
    render(<RoomFilter rooms={rooms} selectedRoomId={null} onSelect={() => {}} />)

    expect(screen.getByRole('button', { name: /all rooms/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /kitchen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /living/i })).toBeInTheDocument()
  })

  it('marks the selected room as pressed', () => {
    render(<RoomFilter rooms={rooms} selectedRoomId="kitchen" onSelect={() => {}} />)

    expect(screen.getByRole('button', { name: /kitchen/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /living/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /all rooms/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('marks "All rooms" as pressed when nothing is selected', () => {
    render(<RoomFilter rooms={rooms} selectedRoomId={null} onSelect={() => {}} />)

    expect(screen.getByRole('button', { name: /all rooms/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onSelect with the room id when a room is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<RoomFilter rooms={rooms} selectedRoomId={null} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /living/i }))

    expect(onSelect).toHaveBeenCalledWith('living')
  })

  it('calls onSelect with null when "All rooms" is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<RoomFilter rooms={rooms} selectedRoomId="kitchen" onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: /all rooms/i }))

    expect(onSelect).toHaveBeenCalledWith(null)
  })
})
