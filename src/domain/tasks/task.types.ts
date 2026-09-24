export interface Room {
  id: string
  name: string
  icon: string
  sortOrder: number
}

export interface Task {
  id: string
  name: string
  roomId: string
  frequencyDays: number
  estimatedSeconds: number
  personalBestSeconds: number | null
  lastCompletedAt: string | null
  createdAt: string
  active: boolean
  // Cleaning products/tools this task needs — see src/data/seedSupplies.ts.
  supplyIds: string[]
}

export type TaskStatus =
  | 'never_done'
  | 'not_due'
  | 'due'
  | 'overdue'
  | 'super_overdue'
