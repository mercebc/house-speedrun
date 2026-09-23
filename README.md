# House Speedrun

Clean smarter. Beat your time.

A mobile-first cleaning tracker that turns household chores into a lightweight
speedrun game: pick how much time you have, get a mission built from what's
overdue, and try to beat your personal best on every job.

See [SPEC.md](./SPEC.md) for the full product and technical specification.

## Stack

- React + TypeScript + Vite
- React Router
- PWA (installable, offline-capable) via `vite-plugin-pwa`
- Local persistence (`localStorage`) behind a `StorageService` abstraction,
  so a backend can replace it later without touching the UI
- Supply-catalogue photos are stored separately in IndexedDB (via a
  `PhotoStorageService`, keyed by supply id), since they're too large
  for `localStorage`'s quota
- Vitest + Testing Library

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test        # run once
npm run test:watch
```

## Build

```bash
npm run build
```

## Project structure

Domain logic (task status, mission building, run/PB calculation) lives under
`src/domain`, independent of React. Pages and components stay presentational
and call into domain functions rather than recalculating state themselves.

```
src/
  app/        # App shell wiring + routes
  components/ # Presentational UI components
  pages/      # Route-level screens
  domain/     # Pure business logic (tasks, missions, runs, stats)
  data/       # Seed rooms and tasks
  storage/    # StorageService abstraction + localStorage implementation
  notifications/
  utils/
```

## Status

All 7 phases of the MVP build order in SPEC.md are done: project
setup, routing, responsive layout, seed data, local persistence, task
status/due-date calculation, the Tasks and Task detail screens
(status/room filters, per-task photos, logging a completion without
the timer), the full Start → Timer → Finish → PB result loop
(including resuming or discarding a run left active after an
accidental close), Missions (pick how much time you have, get a
time-fit mission built from what's overdue, run through it task by
task to a final summary), History/Stats (runs grouped by day with date
filters; total time/runs/PBs this week, current streak, and the
most-improved task), Notifications (the Home screen's overdue banner,
a Settings screen for the morning reminder/time/threshold, and a
once-per-day browser notification summarising super-overdue jobs), and
Phase 7 Polish:

- Haptic/sound feedback on finishing a task (stronger for a personal
  best), both togglable in Settings, plus a `showEstimates` toggle that
  hides estimated durations on the timer and task detail when off.
- Empty-state wording audited across every screen — in particular,
  History's "no runs" message is now filter-aware instead of always
  claiming there's no history at all.
- Accessibility audit: fixed two real contrast failures (light-mode
  warning-status text, dark-mode button text), brought two touch
  targets up to the 44px minimum used elsewhere, gave the icon-only
  Settings link a proper hit area, and added a visible focus-visible
  ring (there wasn't one).
- Light entrance/celebration animations (timer start, run result,
  mission step result, trophy pop on a PB, card entrances, button press
  feedback), all collapsing under `prefers-reduced-motion`.
- Installability: replaced leftover scaffold icons with a real app icon
  and correct manifest entries.
- Offline behaviour verified end-to-end in a real browser: with the
  server killed outright, deep-linked routes still load from the
  service worker's cache (confirmed via `deliveryType: "cache-storage"`,
  zero bytes transferred), and a full start-timer → finish → PB flow
  works entirely offline against `localStorage`.

The one item from SPEC.md's "MVP definition of done" that's inherently
a manual, on-device check rather than something verifiable in this
repo: actually adding the app to an iPhone home screen via Safari.

### Deviations from SPEC.md

- The seed task catalogue (`src/data/seedTasks.ts`) intentionally skips
  daily/obvious upkeep (dishes, wiping counters, tidying) that happens
  anyway, and only tracks infrequent, easy-to-forget deep-cleans (oven,
  fridge, cabinets, windows/mirrors, mopping, etc.), all at a 7+ day
  frequency — the app is meant to feel like a fun occasional prompt, not
  a nagging daily checklist.
- Instead of one uploaded "room photo" per task, each task shows a
  collage of the actual cleaning products/tools it needs (a `Supply`
  catalogue — `src/data/seedSupplies.ts`), and missions show the
  combined "Gather" list across all their tasks. Photos are uploaded
  once per product on a dedicated Supplies catalogue page (linked from
  Settings), not per task — see `src/pages/Supplies.tsx`. This wasn't
  in the original spec's data model.
- Wording never implies a task "was never done" just because it has no
  logged completion — "Not logged yet" instead of "Never done" — and a
  task can be marked done (with a backdatable date) without running the
  timer, via `markTaskCompleted`. See `src/domain/tasks/task.service.ts`.
- "Most neglected room" on the Stats screen isn't implemented — SPEC.md
  itself defers it ("Could be calculated later").
- Settings only exposes the fields that exist in SPEC.md section 27's
  actual `Settings` model (morning reminder on/off, its time, and the
  super-overdue threshold). Section 18's "Potential notification
  settings" mockup also shows "Notify about due today" and "Notify
  about PBs" toggles, but there's no field for either in the canonical
  model, so they were left out rather than inventing new settings data.
- The morning notification is a "check on app open" (once per day,
  past the configured time), not a true scheduled background push —
  SPEC.md itself frames real scheduled push notifications as needing a
  backend ("Future backend: Scheduled job → Check overdue tasks → Push
  notification"), which is out of scope for this local-only MVP.
