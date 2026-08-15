# Entertainment OS

A personal entertainment intelligence system — not a Netflix or IMDb clone.
Dark, instrument-panel UI for tracking what you've watched, queuing what's
next, and (from Phase 2 onward) surfacing what to watch based on your own
history.

This is **Phase 1**: frontend foundation only, running on dummy in-memory
data. No backend, no TMDb calls yet.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4 (CSS-first `@theme` config — see `src/app/globals.css`)
- Framer Motion for motion, Lucide for icons
- React Three Fiber for the ambient particle background
- Hand-written, shadcn-style UI primitives in `src/components/ui`

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` — it redirects straight to `/dashboard`.

> **Note on fonts:** the layout uses `next/font/google` (Space Grotesk,
> Inter, JetBrains Mono), which fetches font files at build time. This
> requires normal internet access to `fonts.googleapis.com` — it will work
> automatically the first time you run `npm run dev` or `npm run build` on
> your machine or on Vercel.

## What's built (Phase 1)

- **Dashboard** — count-up stat panels (movies/series watched, watchlist
  count, total watch time), a live recent-activity feed, and a genre-signal
  panel — all derived from the in-memory library store.
- **Watched** — searchable, sortable, filterable table (title, type, IMDb
  rating, genre, year, watched date, favorite toggle). No detail pages, no
  rating input, per spec.
- **Watchlist** — searchable/filterable table with Add (modal form),
  Remove (with confirmation), and Mark as Watched, which moves the item into
  Watched, removes it from the queue, and logs both to the activity feed —
  live, no page reload.
- **Recommendations / Analytics / Notifications** — present as clearly
  labeled "Module offline · Phase 2" panels so the navigation is complete
  and honest about what's real vs. what's coming, rather than faking data
  these modules need a backend to generate correctly.
- **Settings** — fully functional where it can be, client-side only:
  Export/Import Library (JSON download/upload), a locally-stored TMDb API
  key field (unused until Phase 2 wires up the backend), recommendation
  preference toggles (saved now, applied once the engine ships), and a
  locked "dark theme only" indicator.

## Design system

Tokens live in `src/app/globals.css` under `@theme inline` — every color,
font, and animation is a CSS variable, so retheming means editing one file.

The signature visual motif is the **HUD corner bracket**
(`src/components/common/hud-corners.tsx`): four L-shaped reticle marks that
sit on every glass panel and glow on hover, reinforcing the
targeting/intelligence-system read of the brief rather than reading as
generic glassmorphism.

Posters are deterministic gradient + monogram placeholders
(`src/components/common/poster.tsx`) since no TMDb key is wired up yet —
real posters activate in Phase 2 the moment the backend syncs.

## Data layer (Phase 1)

`src/lib/store.tsx` is a React Context + `useState` store seeded from
`src/lib/dummy-data.ts`. It's in-memory only (resets on refresh) by design —
Phase 2 replaces this with real API calls to a FastAPI + SQLite backend
without changing any component's public interface (`useLibrary()`).

## Folder structure

```
src/
  app/                 # routes (App Router)
  components/
    layout/            # sidebar, top bar, mobile nav, global search, shell
    common/            # cross-page primitives (glass panel, HUD corners, poster, page header...)
    dashboard/         # dashboard-only widgets
    watched/           # watched table
    watchlist/         # watchlist table + add form
    settings/          # settings sections
    ui/                # shadcn-style primitives (button, input, select, badge, dialog, switch)
  hooks/               # useCountUp, useDebounce
  lib/                 # types, dummy data, store, utils
```

## Roadmap (not in this phase)

- **Phase 2 — Backend**: FastAPI + SQLAlchemy + SQLite, TMDb sync (real
  posters/ratings/season data), the recommendation engine, analytics
  charts, and season-release notifications.
