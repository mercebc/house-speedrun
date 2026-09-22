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
- Local persistence (`localStorage` for now) behind a `StorageService`
  abstraction, so a backend can replace it later without touching the UI
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

Phase 1 (Foundation) of the MVP build order in SPEC.md: project setup,
routing, responsive layout, seed data, and local persistence. Task list,
timer, missions, stats, and notifications are not yet implemented.
