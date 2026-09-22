# House Speedrun — Product & Technical Specification

## 1. Product title

House Speedrun

### Tagline

Clean smarter. Beat your time.

### Core idea

A mobile-first cleaning tracker for the home that turns cleaning into a lightweight speedrun game.

The app should answer three questions:

- What should I clean?
- What can I realistically do with the time I have?
- Can I beat my previous time?

The app tracks individual cleaning jobs, actual completion times, personal bests, overdue status and history.

## 2. Product goals

### Primary goals

- Make it obvious what cleaning is worth doing right now.
- Make short periods of free time useful.
- Turn repetitive cleaning into a game.
- Build personal records based on actual user performance, rather than generic estimates.
- Surface jobs that have been neglected for a long time.
- Keep interaction extremely fast — starting a cleaning job should take seconds.

### Non-goals

The first version does not need:

- social features
- leaderboards
- accounts
- AI
- shopping lists
- cleaning-product management
- complicated recurring calendars
- household member permissions
- smart-home integrations

These can come later.

## 3. Platform

### MVP

Mobile-first Progressive Web App (PWA).

It should work well on:

- iPhone Safari
- Android Chrome
- desktop browser

The app should be installable to the home screen.

### Recommended stack

- React
- TypeScript
- Vite
- CSS / Tailwind
- localStorage or IndexedDB
- PWA / service worker

For the first version, do not build a backend.

The data belongs to the user and can live locally.

Later:

```
React + TypeScript
        ↓
API
        ↓
PostgreSQL
```

can be introduced for sync/accounts.

## 4. Design principles

### 4.1 Speed

The user should never have to navigate through several screens to start cleaning.

Target:

```
Open app → choose task → START
```

### 4.2 Time awareness

The user often thinks:

> "I've got 20 minutes."

The app should therefore treat available time as a first-class concept.

### 4.3 Game, but not childish

Visual language should feel more like:

- Strava
- Duolingo
- a fitness tracker
- a speedrun timer

and less like:

- a children's game
- a generic household chore app.

### 4.4 Personal records

The user's actual history becomes increasingly important.

Example:

```
Kitchen counters

PB       5:42
Previous 6:18
Today    5:31

🏆 NEW PERSONAL BEST
```

### 4.5 Estimates are temporary

Initial task durations are estimates.

Once the user has completed a task several times, the app should increasingly rely on their actual data.

## 5. Information architecture

Main navigation:

- HOME
- MISSIONS
- TASKS
- HISTORY
- STATS
- SETTINGS

On mobile, recommended bottom navigation:

- 🏠 Home
- ⚡ Missions
- ✓ Tasks
- 📊 Stats

Settings can live behind the profile/settings icon.

## 6. Home screen

### Title

What are we doing?

Top of screen:

```
GOOD MORNING, MERCE

You have:

🔴 3 super overdue
🟠 5 due today
```

Then:

Time selector

```
HOW MUCH TIME DO YOU HAVE?

[ 10 min ]
[ 20 min ]
[ 30 min ]
[ 45 min ]
[ 60 min ]
```

When the user chooses 20 minutes:

```
YOUR 20-MINUTE MISSION

Kitchen counters       7 min
Bathroom quick clean   8 min
Playroom tidy           5 min

TOTAL                  20 min

[ START MISSION ]
```

## 7. Mission Builder

This is one of the most important features.

### Input

```
availableSeconds: number
```

Example:

```
1200 seconds
```

### Candidate tasks

The algorithm considers:

- Super overdue
- Overdue
- Due today
- Due soon
- Never completed
- User-selected priorities

It should also consider:

- estimated duration
- room
- whether the task was recently completed
- whether the task is already part of another mission

## 8. Mission algorithm

### Version 1

Use a simple greedy algorithm.

Example:

Available:

```
20 minutes
```

Tasks:

```
Kitchen counters       7
Bathroom quick clean   8
Playroom tidy           8
Coffee table            6
Kitchen sink            5
```

Find a combination closest to 20 without exceeding it.

Possible:

```
8 + 7 + 5 = 20
```

Return:

- Bathroom quick clean
- Kitchen counters
- Kitchen sink

### Important rule

Prioritise overdue tasks.

For example:

- Task A: 20m, 20 days overdue
- Task B: 5m, due today
- Task C: 6m, not due

The algorithm should favour A/B over C.

## 9. Room-switching optimisation

Optional second-stage optimisation.

Avoid:

```
Kitchen
Bathroom
Kitchen
Playroom
Kitchen
```

Prefer:

```
Kitchen
Kitchen
Kitchen
Bathroom
```

if the cleaning value is similar.

This makes the mission more efficient in real life.

## 10. Actual house task catalogue

Seed the app with these tasks.

### Kitchen / Dining / Living

| Task | Frequency | Initial estimate |
|---|---|---|
| Kitchen counters | 1 day | 7 min |
| Kitchen sink | 2 days | 5 min |
| Hob | 3 days | 6 min |
| Kitchen table | 1 day | 4 min |
| Dining table + chairs | 7 days | 6 min |
| Quick kitchen reset | 1 day | 10 min |
| Vacuum open-plan floor | 3 days | 12 min |
| Mop kitchen floor | 7 days | 12 min |
| Dust living room | 7 days | 12 min |
| Vacuum living rug | 7 days | 7 min |
| Coffee table + TV console | 3 days | 6 min |

### Playroom

| Task | Frequency | Estimate |
|---|---|---|
| Playroom tidy | 1 day | 8 min |
| Vacuum playroom rug | 3 days | 7 min |
| Wipe kids table + chairs | 3 days | 5 min |

### Utility

| Task | Frequency | Estimate |
|---|---|---|
| Utility sink + surfaces | 7 days | 7 min |
| Utility floor | 7 days | 6 min |
| Fold + put away laundry | 3 days | 15 min |

### Bathroom / WC

| Task | Frequency | Estimate |
|---|---|---|
| Bathroom/WC quick clean | 3 days | 8 min |
| Bathroom full clean | 7 days | 18 min |
| WC deep clean | 7 days | 8 min |

### Bedrooms

| Task | Frequency | Estimate |
|---|---|---|
| Main bedroom reset | 1 day | 8 min |
| Change main bed | 7 days | 10 min |
| Kids beds: change sheets | 7 days | 12 min |

### Hall / Stairs

| Task | Frequency | Estimate |
|---|---|---|
| Hall + stairs vacuum | 3 days | 10 min |
| Under-stairs storage reset | 30 days | 15 min |

### Entrance / Porch

| Task | Frequency | Estimate |
|---|---|---|
| Porch tidy + sweep | 7 days | 6 min |

### Pantry

| Task | Frequency | Estimate |
|---|---|---|
| Pantry tidy | 14 days | 10 min |

### Whole house

| Task | Frequency | Estimate |
|---|---|---|
| Whole-house quick reset | 1 day | 20 min |
| Whole-house vacuum | 3 days | 25 min |
| Whole-house mop | 7 days | 25 min |

These should be seed data, not hard-coded UI data.

## 11. Task model

```ts
interface Task {
  id: string;

  name: string;

  roomId: string;

  frequencyDays: number;

  estimatedSeconds: number;

  personalBestSeconds: number | null;

  lastCompletedAt: string | null;

  createdAt: string;

  active: boolean;
}
```

## 12. Room model

```ts
interface Room {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}
```

Example:

```json
{
  "id": "kitchen",
  "name": "Kitchen",
  "icon": "🍳",
  "sortOrder": 1
}
```

## 13. Cleaning run model

Every time the user presses START, create a run.

```ts
interface CleaningRun {
  id: string;

  taskId: string;

  startedAt: string;

  finishedAt: string;

  durationSeconds: number;

  previousPersonalBestSeconds: number | null;

  isPersonalBest: boolean;
}
```

Do not overwrite previous times.

History is important.

## 14. Timer

The timer screen should be extremely simple.

```
KITCHEN COUNTERS

07:24

PB
05:42

Estimated
07:00


[ FINISH ]
```

While running:

```
05:31
```

If the user beats their PB:

```
🏆

NEW PERSONAL BEST

05:31

Previous
05:42

You saved
11 seconds
```

## 15. Personal Best logic

When a run finishes:

```ts
if (
  task.personalBestSeconds === null ||
  run.durationSeconds < task.personalBestSeconds
) {
  isPersonalBest = true;
  task.personalBestSeconds = run.durationSeconds;
}
```

Important:

Lower time = better time, assuming the task was completed properly.

The app should not encourage unsafe rushing. The objective is to improve efficiency, not simply move faster.

## 16. Task status

Every task should have a calculated status.

```ts
type TaskStatus =
  | "never_done"
  | "not_due"
  | "due"
  | "overdue"
  | "super_overdue";
```

Calculation:

```
nextDue =
lastCompletedAt + frequencyDays
```

Then:

```
today < nextDue
→ NOT DUE

today >= nextDue
→ DUE / OVERDUE
```

For the app's main "super overdue" rule:

```
daysOverdue > 15
→ SUPER OVERDUE
```

Example:

Task:

```
Bathroom full clean
Frequency: 7 days
Last completed: 1 August
```

Due:

```
8 August
```

Today:

```
22 August
```

Overdue:

```
14 days
```

Therefore:

```
OVERDUE
```

At 24 August:

```
16 days overdue
→ SUPER OVERDUE
```

## 17. Super-overdue notification

The morning notification should say something like:

```
HOUSE SPEEDRUN

You have 3 super-overdue jobs:

🔴 Bathroom full clean
16 days overdue
PB 17:42

🔴 Pantry tidy
22 days overdue
PB 08:51

🔴 Under-stairs storage reset
31 days overdue
PB 13:18
```

If none:

```
HOUSE SPEEDRUN

Nothing is more than 15 days overdue. 🎉
```

## 18. Notifications

### MVP

Use browser notifications where supported.

Future backend:

```
Scheduled job
      ↓
Check overdue tasks
      ↓
Push notification
```

Potential notification settings:

```
Morning reminder
[ ON ]

Time
08:30

Super overdue threshold
[ 15 days ]

Notify about due today
[ OFF ]

Notify about PBs
[ ON ]
```

## 19. Tasks screen

Title:

```
All tasks
```

Filters:

- All
- Due
- Overdue
- Super overdue
- Never done

Then room filters:

- Kitchen
- Living
- Playroom
- Bathroom
- Bedrooms
- Utility
- Hall
- Whole house

Each task card:

```
Kitchen counters

Kitchen

Every day

PB 05:42

Last done
Yesterday

● Due today

[ START ]
```

## 20. Task detail

Clicking a task opens:

```
KITCHEN COUNTERS

Personal best
05:42

Average
06:21

Estimate
07:00

Last completed
Yesterday

Frequency
Every day

History:

TODAY       05:31 🏆
18 SEP      05:42
16 SEP      06:18
15 SEP      06:24
```

Button:

```
[ START TIMER ]
```

## 21. History screen

Title:

```
Your runs
```

Example:

```
TODAY

Kitchen counters          05:31 🏆
Bathroom quick clean      07:48
Playroom tidy              06:51

YESTERDAY

Kitchen sink               04:52
Vacuum living rug          06:43
```

Filters:

- Today
- 7 days
- 30 days
- All time

## 22. Stats screen

Keep it simple initially.

```
Total cleaning time
THIS WEEK

2h 14m
```

```
Runs
23
```

```
Personal bests
7 🏆
```

```
Current streak
4 days
```

```
Most neglected room
```

Could be calculated later.

```
Most improved task
Kitchen counters

Old PB     07:14
Current PB 05:31

Improvement
1:43
```

## 23. Gamification

Use lightweight achievements.

Examples:

- First run — ⚡ FIRST RUN — You completed your first speedrun.
- Record breaker — 🏆 RECORD BREAKER — You beat a personal best.
- 10 runs — 🔥 GETTING STARTED — 10 cleaning runs completed.
- 50 runs — 💪 CLEANING MACHINE — 50 runs completed.
- Super overdue rescue — 🚨 RESCUE MISSION — You completed a job that was >15 days overdue.

Avoid points that make the app unnecessarily complicated.

## 24. Mission screen

The mission should feel different from the normal task list.

Example:

```
⚡ 20 MINUTE MISSION

You have 20 minutes.

1
Kitchen counters
07:00

2
Kitchen sink
05:00

3
Kitchen table
04:00

4
Coffee table + TV console
04:00


TOTAL
20:00

[ START MISSION ]
```

## 25. Mission execution

When starting a mission:

```
MISSION
1 / 4

KITCHEN COUNTERS

05:31

PB 05:42

[ FINISH ]
```

After finishing:

```
🏆 NEW PB

05:31

Next:

KITCHEN SINK

[ START NEXT ]
```

At the end:

```
MISSION COMPLETE 🎉

20:00 planned
18:42 actual

3 personal bests

[ DONE ]
```

## 26. Data persistence

### MVP

Use:

```
localStorage
```

or preferably:

```
IndexedDB
```

because history can grow.

Recommended abstraction:

```ts
interface StorageService {
  getTasks(): Promise<Task[]>;
  saveTask(task: Task): Promise<void>;

  getRuns(): Promise<CleaningRun[]>;
  saveRun(run: CleaningRun): Promise<void>;

  getRooms(): Promise<Room[]>;
  saveSettings(settings: Settings): Promise<void>;
}
```

This means a backend can later replace the local implementation without rewriting the UI.

## 27. Settings model

```ts
interface Settings {
  superOverdueDays: number;

  morningNotificationEnabled: boolean;

  morningNotificationTime: string;

  showEstimates: boolean;

  vibrationEnabled: boolean;

  soundEnabled: boolean;
}
```

Default:

```json
{
  "superOverdueDays": 15,
  "morningNotificationEnabled": true,
  "morningNotificationTime": "08:30",
  "showEstimates": true,
  "vibrationEnabled": true,
  "soundEnabled": false
}
```

## 28. PWA requirements

The app should have:

- manifest.json
- service-worker
- offline support
- app icon
- standalone display

Manifest:

```json
{
  "name": "House Speedrun",
  "short_name": "Speedrun",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "...",
  "background_color": "..."
}
```

The core app should work without internet.

## 29. Component structure

Recommended React structure:

```
src/
  app/
    App.tsx
    routes.tsx

  components/
    TaskCard.tsx
    Timer.tsx
    MissionCard.tsx
    RoomFilter.tsx
    StatusBadge.tsx
    PBDisplay.tsx
    TimeSelector.tsx

  pages/
    Home.tsx
    Missions.tsx
    Tasks.tsx
    TaskDetail.tsx
    History.tsx
    Stats.tsx
    Settings.tsx

  domain/
    tasks/
      task.types.ts
      task.service.ts
      task.status.ts

    missions/
      mission.types.ts
      mission.builder.ts

    runs/
      run.types.ts
      run.service.ts

    stats/
      stats.service.ts

  data/
    seedTasks.ts
    seedRooms.ts

  storage/
    storage.ts
    localStorage.ts
    indexedDb.ts

  notifications/
    notifications.ts

  utils/
    dates.ts
    duration.ts
```

## 30. Important separation

Keep business logic out of React components.

Bad:

```tsx
<TaskCard>
  // 100 lines calculating overdue state
</TaskCard>
```

Better:

```ts
const status = getTaskStatus(task, now);
```

and:

```ts
const mission = buildMission(tasks, {
  availableSeconds: 1200
});
```

This makes the app much easier to extend.

## 31. Core functions

These should exist as pure functions.

- `getTaskStatus(task, now)`
- `getDaysOverdue(task, now)`
- `getNextDueDate(task)`
- `calculatePersonalBest(runs)`
- `buildMission(tasks, availableSeconds)`
- `getSuperOverdueTasks(tasks, now, thresholdDays)`
- `getTaskAverage(runs)`
- `getTaskImprovement(runs)`

## 32. Mission scoring / selection

Don't simply sort by overdue days.

Give each candidate a priority score.

Conceptually:

```
priority =
    overdueWeight
  + dueWeight
  + neverDoneWeight
  + roomEfficiencyWeight
```

But duration fit is mandatory.

The mission must fit:

```
sum(task.duration) <= availableTime
```

And aim to maximise:

```
useful cleaning value
```

while minimising unused time.

## 33. Important edge cases

The code needs tests for:

### Never completed task

```
lastCompletedAt = null
```

Should display:

```
NEVER DONE
```

rather than pretending it is 100 days overdue.

### Task completed exactly on due date

Should not be considered overdue.

### Task completed 15 days overdue

Not super-overdue if the rule is strictly:

```
> 15
```

### Task completed 16 days overdue

Super-overdue.

### Mission with no tasks

```
No suitable jobs found.
```

### Available time smaller than every task

Offer:

```
Nothing fits.

Try 10 more minutes
```

or allow the user to select a task manually.

### Timer closed accidentally

Persist active run state.

On reopening:

```
You have an active run:

Kitchen counters
Started 7m ago

[ CONTINUE ]
[ DISCARD ]
```

## 34. Accessibility

Minimum:

- large START button
- high contrast
- don't rely solely on colour
- readable typography
- touch targets ≥44px
- keyboard navigation on desktop
- screen-reader labels
- timer should remain readable from a distance

## 35. Visual design

### Overall aesthetic

Minimal Nordic + subtle game UI.

Not:

```
🌈 🧹 ✨ CLEAN YOUR HOUSE!!! 🎉
```

Instead:

```
HOUSE SPEEDRUN

20 MINUTES AVAILABLE

Kitchen counters
07:00

Bathroom
08:00
```

Use:

- off-white background
- dark text
- one accent colour
- rounded cards
- subtle borders
- lots of whitespace
- large typography for times

## 36. Desktop layout

Desktop:

```
┌───────────────────────────────────────────────┐
│ HOUSE SPEEDRUN                         ⚙     │
├────────────┬──────────────────────────────────┤
│            │                                  │
│ Home       │  GOOD MORNING                   │
│ Missions   │                                  │
│ Tasks      │  3 SUPER OVERDUE                │
│ History    │                                  │
│ Stats      │  HOW MUCH TIME?                 │
│            │                                  │
│            │  [10] [20] [30] [45] [60]       │
│            │                                  │
│            │  YOUR MISSION                   │
│            │                                  │
│            │  Kitchen counters       07:00   │
│            │  Kitchen sink             05:00  │
│            │  Kitchen table            04:00  │
│            │                                  │
│            │  [ START MISSION ]              │
└────────────┴──────────────────────────────────┘
```

Mobile becomes a single-column interface.

## 37. Database — future version

When persistence across devices is wanted:

- Users — `users`
- Rooms — `rooms`
- Tasks — `tasks`
- Cleaning runs — `cleaning_runs`
- Settings — `user_settings`

Potential schema:

```sql
tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  room_id UUID NOT NULL,
  name TEXT NOT NULL,
  frequency_days INTEGER NOT NULL,
  estimated_seconds INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL
);
```

```sql
cleaning_runs (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL,
  started_at TIMESTAMP NOT NULL,
  finished_at TIMESTAMP NOT NULL,
  duration_seconds INTEGER NOT NULL
);
```

PB should ideally be derived from runs, rather than being the only source of truth.

## 38. API — future

```
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

GET    /api/runs
POST   /api/runs

GET    /api/missions

GET    /api/stats

GET    /api/settings
PATCH  /api/settings
```

## 39. Future features

Do not build these initially, but design so they can be added.

### Household accounts

Seán could have his own profile.

```
Shared house
Merce
Seán
```

Tasks could be assigned.

### Cleaning history

Calendar view.

### Smarter missions

Learn:

```
user usually takes 5:42
```

rather than relying on:

```
estimate = 7:00
```

### AI mission planning

Eventually:

> "I've got 25 minutes and haven't cleaned upstairs today."

The system can build the mission.

### NFC

This could become particularly useful later.

Example:

NFC sticker on bathroom mirror:

```
TAP → Bathroom quick clean
```

NFC sticker beside washing machine:

```
TAP → Laundry
```

That would fit very nicely with the NFC routines already in use.

## 40. MVP development order

Build in this order.

### Phase 1 — Foundation

- React/Vite
- TypeScript
- PWA
- routing
- responsive layout
- seed data
- local persistence

### Phase 2 — Tasks

- task list
- room filters
- task details
- frequency
- due calculation
- overdue states

### Phase 3 — Timer

- START
- live timer
- FINISH
- run persistence
- PB calculation
- PB celebration

### Phase 4 — Missions

- 10/20/30/45/60 minute selector
- mission algorithm
- task combination
- mission execution
- mission completion

### Phase 5 — Stats

- history
- averages
- PBs
- improvement
- cleaning time
- streak

### Phase 6 — Notifications

- super-overdue calculation
- notification settings
- morning reminder

### Phase 7 — Polish

- animations
- sounds/haptics
- empty states
- accessibility
- installability
- offline behaviour

## 41. MVP definition of done

The first usable version is finished when the user can:

1. Open the app.
2. See overdue cleaning.
3. Select 20 minutes.
4. Receive a sensible mission.
5. Start the mission.
6. Start each individual timer.
7. Finish each task.
8. See the actual duration.
9. Beat a personal best.
10. See the result in history.
11. Come back tomorrow and see updated due dates.
12. See tasks >15 days overdue.
13. Install the app on an iPhone home screen.
14. Use the core app without internet.

## 42. First screen copy

Use this as the initial UX copy:

```
HOUSE SPEEDRUN

What are we doing?

SUPER OVERDUE
3 jobs

HOW MUCH TIME DO YOU HAVE?

10 min
20 min
30 min
45 min
60 min

YOUR MISSION

We'll pick the most useful jobs
that fit your time.

[ START MISSION ]
```

## 43. Coding brief

If you're giving this to a coding agent, the top-level instruction should be:

> Build House Speedrun as a mobile-first React + TypeScript PWA.
>
> This is a personal household cleaning tracker designed around short cleaning sessions and personal-best times. Implement the MVP described in this specification. Use local persistence initially, keep domain logic separate from UI, seed the application with the provided rooms and tasks, and make the app fully usable offline. Prioritise an extremely fast START → TIMER → FINISH flow. Do not introduce a backend, authentication, AI, social features, or unnecessary complexity in the MVP.

### First coding milestone

The first implementation should produce:

```
Home
  ↓
Choose 20 min
  ↓
Mission generated
  ↓
Start
  ↓
Timer
  ↓
Finish
  ↓
PB result
  ↓
Next task
  ↓
Mission complete
  ↓
History
```

That is the core loop. Everything else supports that loop.
</content>
