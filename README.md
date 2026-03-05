# wXw 16 Carat Gold 2026

Mobile-first bracket tracker for the [wXw 16 Carat Gold 2026](https://www.wxw-wrestling.com) wrestling tournament — a 16-person single-elimination tournament held over 3 nights.

## How it works

The tournament unfolds in three phases, matching the real event structure:

1. **Night 1** — 8 first-round matches are played. The bracket structure is hidden; you simply record winners as matches happen.
2. **Night 2** — The organization reveals the Round 2 pairings. You manually assign the 8 winners into 4 matchups, which determines the left and right bracket sides. The full bracket is then revealed retroactively.
3. **Night 3** — Semifinals and the championship final play out through the standard bracket view.

All state is persisted to localStorage, so you can close the app and pick up where you left off.

## Stack

- Vite + React + TypeScript
- Vanilla CSS with CSS custom properties
- localStorage for persistence
- Vercel for deployment

## Development

```sh
nvm use
npm install
npm run dev
```

## Deployment

The app is deployed to Vercel via Git integration. Push to `main` to trigger a deploy.
