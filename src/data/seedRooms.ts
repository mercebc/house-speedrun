import type { Room } from '../domain/tasks/task.types'

export const seedRooms: Room[] = [
  { id: 'kitchen', name: 'Kitchen', icon: '🍳', sortOrder: 1 },
  { id: 'living', name: 'Living', icon: '🛋️', sortOrder: 2 },
  { id: 'playroom', name: 'Playroom', icon: '🧸', sortOrder: 3 },
  { id: 'bathroom', name: 'Bathroom', icon: '🛁', sortOrder: 4 },
  { id: 'bedrooms', name: 'Bedrooms', icon: '🛏️', sortOrder: 5 },
  { id: 'utility', name: 'Utility', icon: '🧺', sortOrder: 6 },
  { id: 'hall', name: 'Hall', icon: '🚪', sortOrder: 7 },
  { id: 'entrance', name: 'Entrance', icon: '🧹', sortOrder: 8 },
  { id: 'pantry', name: 'Pantry', icon: '🥫', sortOrder: 9 },
  { id: 'wholehouse', name: 'Whole house', icon: '🏠', sortOrder: 10 },
]
