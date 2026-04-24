# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server (LAN-accessible via --host)
npm run build        # tsc -b && vite build (type-check + bundle)
npm run lint         # eslint .
npm run test         # vitest run (single-pass CI mode)
npm run test:watch   # vitest watch mode
npm run preview      # preview production build
```

Node version is pinned to 23 via `.nvmrc`. The pre-push hook runs `npm run build` then `npx vitest run` — both must pass before a push is accepted.

To run a single test file: `npx vitest run src/bracket.test.ts`

## Architecture

A mobile-first PWA bracket tracker for the wXw 16 Carat Gold wrestling tournament — 16-person single-elimination played over 3 nights.

**Stack:** React 19 + TypeScript + Vite 7, Vitest for tests, vite-plugin-pwa (Workbox), vanilla CSS with custom properties, localStorage for persistence, deployed on Vercel.

### State & Data Flow

`useTournament` (hook) owns all state. It initialises from `localStorage` (key: `wxw-tournament`) or falls back to `RESULTS_DEFAULT` from the active edition file. All mutations go through pure functions in `tournament.ts` and `bracket.ts` that return a new deep-cloned `TournamentState` — never mutate state in place. Changes persist synchronously via `useEffect`.

`App.tsx` routes view components purely based on `state.phase`:
- `round1` → `SetupView` + `MatchCard` grid
- `pairing` → `PairingView` (QF draw)
- `sfPairing` → `PairingView` (SF draw)
- `bracket` → `BracketView`

### Key Modules

| File | Role |
|---|---|
| `types.ts` | Core domain types: `Match`, `Bracket`, `TournamentState`, `PairingSlot` |
| `tournament.ts` | Pure state-transition functions (the domain logic) |
| `bracket.ts` | Bracket construction and mutation (pure functions) |
| `edition-YYYY.ts` | Seed matchups, historical results, dates for a given year |
| `i18n.ts` | Locale detection + string table (en/de/es) |
| `hooks/useTournament.ts` | Main hook: state management + localStorage I/O |

### Adding a New Edition Year

1. Create `edition-YYYY.ts` with seed matchups and `RESULTS_DEFAULT`.
2. Create `edition-YYYY-theme.css` with CSS custom properties.
3. Update imports in `main.tsx`, `vite.config.ts`, and `hooks/useTournament.ts` to point to the new edition.

`edition-2027.ts` already exists as a stub.

### TypeScript Strictness

`tsconfig.app.json` enables `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, and `noUncheckedSideEffectImports`. The `tsc -b` step in `npm run build` must pass cleanly.
