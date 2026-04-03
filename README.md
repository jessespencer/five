# Five

Where is it 5 o'clock right now?

A real-time web app that tracks which timezone is at 5 PM and serves up a signature cocktail recipe for that city.

## Features

- Real-time clock showing the current 5 o'clock city
- Interactive world map highlighting the active timezone
- Sidebar ticker of all 31 timezones with smooth index-based color gradient
- Signature drink recipe for each city with copy/share support
- Click any city in the sidebar to preview its time, drink, and map position
- 12h/24h clock format toggle (persisted)
- Dark/light theme toggle (persisted)
- Fully client-rendered, static export — no server required

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · Lucide icons

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build (static export to `out/`) |
| `npm run lint` | Run ESLint |

## Deployment

Static export to GitHub Pages via `.github/workflows/deploy.yml`. The `basePath` is `/five` in production.

## License

MIT
