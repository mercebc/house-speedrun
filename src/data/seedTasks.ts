import type { Task } from '../domain/tasks/task.types'

function seedTask(
  id: string,
  name: string,
  roomId: string,
  frequencyDays: number,
  estimatedMinutes: number,
): Task {
  return {
    id,
    name,
    roomId,
    frequencyDays,
    estimatedSeconds: estimatedMinutes * 60,
    personalBestSeconds: null,
    lastCompletedAt: null,
    createdAt: new Date().toISOString(),
    active: true,
  }
}

export const seedTasks: Task[] = [
  // Kitchen / Dining
  seedTask('kitchen-counters', 'Kitchen counters', 'kitchen', 1, 7),
  seedTask('kitchen-sink', 'Kitchen sink', 'kitchen', 2, 5),
  seedTask('hob', 'Hob', 'kitchen', 3, 6),
  seedTask('kitchen-table', 'Kitchen table', 'kitchen', 1, 4),
  seedTask('dining-table-chairs', 'Dining table + chairs', 'kitchen', 7, 6),
  seedTask('quick-kitchen-reset', 'Quick kitchen reset', 'kitchen', 1, 10),
  seedTask('vacuum-open-plan-floor', 'Vacuum open-plan floor', 'kitchen', 3, 12),
  seedTask('mop-kitchen-floor', 'Mop kitchen floor', 'kitchen', 7, 12),

  // Living
  seedTask('dust-living-room', 'Dust living room', 'living', 7, 12),
  seedTask('vacuum-living-rug', 'Vacuum living rug', 'living', 7, 7),
  seedTask('coffee-table-tv-console', 'Coffee table + TV console', 'living', 3, 6),

  // Playroom
  seedTask('playroom-tidy', 'Playroom tidy', 'playroom', 1, 8),
  seedTask('vacuum-playroom-rug', 'Vacuum playroom rug', 'playroom', 3, 7),
  seedTask('wipe-kids-table-chairs', 'Wipe kids table + chairs', 'playroom', 3, 5),

  // Utility
  seedTask('utility-sink-surfaces', 'Utility sink + surfaces', 'utility', 7, 7),
  seedTask('utility-floor', 'Utility floor', 'utility', 7, 6),
  seedTask('fold-put-away-laundry', 'Fold + put away laundry', 'utility', 3, 15),

  // Bathroom / WC
  seedTask('bathroom-wc-quick-clean', 'Bathroom/WC quick clean', 'bathroom', 3, 8),
  seedTask('bathroom-full-clean', 'Bathroom full clean', 'bathroom', 7, 18),
  seedTask('wc-deep-clean', 'WC deep clean', 'bathroom', 7, 8),

  // Bedrooms
  seedTask('main-bedroom-reset', 'Main bedroom reset', 'bedrooms', 1, 8),
  seedTask('change-main-bed', 'Change main bed', 'bedrooms', 7, 10),
  seedTask('kids-beds-change-sheets', 'Kids beds: change sheets', 'bedrooms', 7, 12),

  // Hall / Stairs
  seedTask('hall-stairs-vacuum', 'Hall + stairs vacuum', 'hall', 3, 10),
  seedTask('under-stairs-storage-reset', 'Under-stairs storage reset', 'hall', 30, 15),

  // Entrance / Porch
  seedTask('porch-tidy-sweep', 'Porch tidy + sweep', 'entrance', 7, 6),

  // Pantry
  seedTask('pantry-tidy', 'Pantry tidy', 'pantry', 14, 10),

  // Whole house
  seedTask('whole-house-quick-reset', 'Whole-house quick reset', 'wholehouse', 1, 20),
  seedTask('whole-house-vacuum', 'Whole-house vacuum', 'wholehouse', 3, 25),
  seedTask('whole-house-mop', 'Whole-house mop', 'wholehouse', 7, 25),
]
