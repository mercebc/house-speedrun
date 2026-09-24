import type { Task } from '../domain/tasks/task.types'

function seedTask(
  id: string,
  name: string,
  roomId: string,
  frequencyDays: number,
  estimatedMinutes: number,
  supplyIds: string[],
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
    supplyIds,
  }
}

// Deliberately excludes daily upkeep (dishes, counters, tidying) that
// happens anyway — this catalogue is only the deeper, easy-to-forget
// cleaning jobs worth tracking and gamifying.
export const seedTasks: Task[] = [
  // Whole house
  seedTask('windows-mirrors', 'Windows & mirrors', 'wholehouse', 14, 20, ['glass-cleaner', 'microfiber-cloth']),
  seedTask('mop-floors', 'Mop floors', 'wholehouse', 7, 25, ['mop', 'bucket']),
  seedTask('whole-house-vacuum', 'Vacuum whole house', 'wholehouse', 7, 25, ['vacuum']),
  seedTask('under-stairs-storage-reset', 'Under-stairs storage reset', 'wholehouse', 30, 15, [
    'trash-bag',
    'microfiber-cloth',
  ]),

  // Kitchen
  seedTask('clean-oven', 'Clean oven', 'kitchen', 30, 25, [
    'oven-cleaner',
    'rubber-gloves',
    'scrub-brush',
    'microfiber-cloth',
  ]),
  seedTask('clean-fridge', 'Clean fridge (inside)', 'kitchen', 21, 15, ['spray-bottle', 'microfiber-cloth', 'sponge']),
  seedTask('wipe-kitchen-cabinets', 'Wipe kitchen cabinets', 'kitchen', 21, 15, ['spray-bottle', 'microfiber-cloth']),
  seedTask('hob-deep-clean', 'Hob deep clean', 'kitchen', 14, 10, ['degreaser', 'scrub-brush', 'microfiber-cloth']),

  // Pantry
  seedTask('pantry-tidy', 'Pantry tidy', 'pantry', 14, 10, ['microfiber-cloth', 'trash-bag']),

  // Living
  seedTask('dust-living-room', 'Dust living room', 'living', 7, 12, ['duster', 'microfiber-cloth']),
  seedTask('vacuum-living-rug', 'Vacuum living rug', 'living', 7, 7, ['vacuum']),

  // Playroom
  seedTask('vacuum-playroom-rug', 'Vacuum playroom rug', 'playroom', 7, 7, ['vacuum']),

  // Utility
  seedTask('utility-sink-surfaces', 'Utility sink + surfaces', 'utility', 14, 7, [
    'spray-bottle',
    'sponge',
    'microfiber-cloth',
  ]),
  seedTask('utility-floor', 'Utility floor', 'utility', 14, 6, ['mop', 'bucket']),

  // Bathroom / WC
  seedTask('bathroom-full-clean', 'Bathroom full clean', 'bathroom', 7, 18, [
    'spray-bottle',
    'scrub-brush',
    'microfiber-cloth',
    'rubber-gloves',
  ]),
  seedTask('wc-deep-clean', 'WC deep clean', 'bathroom', 7, 8, ['toilet-brush', 'disinfectant-spray', 'rubber-gloves']),

  // Bedrooms
  seedTask('change-main-bed', 'Change main bed', 'bedrooms', 7, 10, ['fresh-sheets']),
  seedTask('kids-beds-change-sheets', 'Kids beds: change sheets', 'bedrooms', 7, 12, ['fresh-sheets']),

  // Hall / Stairs
  seedTask('hall-stairs-vacuum', 'Hall + stairs vacuum', 'hall', 7, 10, ['vacuum']),

  // Entrance / Porch
  seedTask('porch-tidy-sweep', 'Porch tidy + sweep', 'entrance', 14, 6, ['broom-dustpan']),
]
