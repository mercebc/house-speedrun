import { getDaysOverdue, getTaskStatus } from '../tasks/task.status'
import type { Task } from '../tasks/task.types'
import type { Mission } from './mission.types'

const ELIGIBLE_STATUSES = new Set(['super_overdue', 'overdue', 'due', 'never_done'])

function priorityScore(task: Task, now: Date): number {
  const status = getTaskStatus(task, now)
  const daysOverdue = getDaysOverdue(task, now)

  switch (status) {
    case 'super_overdue':
      return 300 + daysOverdue
    case 'overdue':
      return 200 + daysOverdue
    case 'due':
      return 150
    case 'never_done':
      return 100
    case 'not_due':
      return 0
  }
}

function orderByPriority(tasks: Task[], now: Date): Task[] {
  return [...tasks].sort((a, b) => priorityScore(b, now) - priorityScore(a, now))
}

// Second-stage optimisation (spec section 9): cluster same-room tasks
// together instead of bouncing between rooms, without changing which
// tasks were selected or their overall priority ordering.
function clusterByRoom(tasks: Task[]): Task[] {
  const groups = new Map<string, Task[]>()
  for (const task of tasks) {
    const group = groups.get(task.roomId)
    if (group === undefined) {
      groups.set(task.roomId, [task])
    } else {
      group.push(task)
    }
  }
  return [...groups.values()].flat()
}

// 0/1 knapsack: maximise total priority value within the time budget.
// A tiny duration-based term breaks ties in favour of using more of the
// available time, matching the spec's "closest to available without
// exceeding it" example.
function selectBestFit(candidates: Task[], capacitySeconds: number, now: Date): Task[] {
  const capacity = Math.max(0, Math.floor(capacitySeconds))
  const n = candidates.length
  const values = candidates.map((task) => priorityScore(task, now) + task.estimatedSeconds / 1_000_000)

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(capacity + 1).fill(0))

  for (let i = 1; i <= n; i++) {
    const weight = candidates[i - 1].estimatedSeconds
    const value = values[i - 1]
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]
      if (weight <= w) {
        const withItem = dp[i - 1][w - weight] + value
        if (withItem > dp[i][w]) dp[i][w] = withItem
      }
    }
  }

  const selected: Task[] = []
  let w = capacity
  for (let i = n; i >= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(candidates[i - 1])
      w -= candidates[i - 1].estimatedSeconds
    }
  }

  return selected
}

export function buildMission(tasks: Task[], availableSeconds: number, now: Date): Mission {
  const candidates = tasks.filter((task) => task.active && ELIGIBLE_STATUSES.has(getTaskStatus(task, now)))

  if (candidates.length === 0) {
    return { items: [], availableSeconds, totalSeconds: 0, hadEligibleTasks: false }
  }

  const selected = selectBestFit(candidates, availableSeconds, now)

  if (selected.length === 0) {
    return { items: [], availableSeconds, totalSeconds: 0, hadEligibleTasks: true }
  }

  const items = clusterByRoom(orderByPriority(selected, now))
  const totalSeconds = items.reduce((sum, task) => sum + task.estimatedSeconds, 0)

  return { items, availableSeconds, totalSeconds, hadEligibleTasks: true }
}
