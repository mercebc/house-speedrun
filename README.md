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
- Photos are stored separately in IndexedDB (via a `PhotoStorageService`),
  since they're too large for `localStorage`'s quota
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

Phase 1 (Foundation) and Phase 2 (Tasks) of the MVP build order in
SPEC.md are done: project setup, routing, responsive layout, seed data,
local persistence, task status/due-date calculation, and the Tasks and
Task detail screens with status/room filters and per-task photos.
Timer, missions, stats, and notifications are not yet implemented.

### Deviations from SPEC.md

- The seed task catalogue (`src/data/seedTasks.ts`) intentionally skips
  daily/obvious upkeep (dishes, wiping counters, tidying) that happens
  anyway, and only tracks infrequent, easy-to-forget deep-cleans (oven,
  fridge, cabinets, windows/mirrors, mopping, etc.), all at a 7+ day
  frequency — the app is meant to feel like a fun occasional prompt, not
  a nagging daily checklist.
- Each task supports an optional user-uploaded photo (resized client-side,
  stored as a `Blob` in IndexedDB, keyed by task id) for a personalized
  feel. This wasn't in the original spec's data model.
