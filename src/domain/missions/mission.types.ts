import type { Task } from '../tasks/task.types'

export interface Mission {
  items: Task[]
  availableSeconds: number
  totalSeconds: number
  // False when nothing in the task list was due/overdue/never-done at all —
  // distinct from "some jobs qualify but none fit the time you have".
  hadEligibleTasks: boolean
}

// A mission that's been started and is being run through task by task.
export interface ActiveMission {
  taskIds: string[]
  availableSeconds: number
  currentIndex: number
}
