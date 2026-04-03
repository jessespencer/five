# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

"Five" is a single-page Next.js app that answers "where is it 5 o'clock right now?" It shows a real-time clock for the timezone currently at 5 PM, a world map highlighting that timezone, a sidebar ticker of all timezones with a smooth color gradient, and a signature drink recipe for the active city. Users can click any city to preview it.

## Commands

- `npm run dev` — start dev server (Next.js, hot reload)
- `npm run build` — production build (static export to `out/`)
- `npm run lint` — ESLint
- No test framework is configured yet

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Framer Motion + Lucide icons. Static export deployed to GitHub Pages via `output: "export"` in `next.config.ts`.

**Core data flow:**
- `src/utils/timezone.ts` — `getFiveOClockData()` is the central function. Runs every second via the `useFiveOClock` hook. Uses `Intl.DateTimeFormat` to compute the current time in each timezone, finds the one at 5 PM (or closest), and sorts all locations in continuous westward progression from the active city.
- `src/hooks/useFiveOClock.ts` — Client-side hook that polls `getFiveOClockData()` at 1-second intervals.
- `src/data/locations.ts` — Static array of ~31 locations (one per UTC offset, including half/quarter offsets like UTC+5:45 Kathmandu). Each has coordinates for map placement.
- `src/data/drinks.ts` — `Record<string, Drink>` keyed by city name. Each drink has a full recipe. A fallback "Local Brew" drink exists in `timezone.ts` for cities without an entry.

**Accent color system:**
- `src/utils/accentColor.ts` — `getAccentForHour(hour)` returns a hex color from a warm-to-dark-to-warm palette. The sidebar ticker and recipe tile use index-based coloring (mapping list position to 0–24h starting at hour 17) for smooth visual progression. The palette stays in warm brown/amber tones, darkening through the middle of the list and ramping back to the hero burnt orange.
- `getTextColorForAccent(hex)` returns `"#000"` or `"#fff"` based on luminance contrast.

**Components (all client-side):**
- `ClockDisplay` — Large time display supporting 12h/24h format
- `WorldMap` — SVG equirectangular map with continent paths, animated timezone line, city dots
- `TimezoneTicker` — Locked sidebar panel listing all timezones in westward order, clickable for city preview, keyboard navigable (arrow keys, escape)
- `RecipeTile` — Expandable accent-colored card showing drink name, ingredients, method, with copy/share buttons

**City preview:** Clicking a city in the sidebar sets `previewCity` state, which swaps the clock, map, recipe, and accent color to that city. The header changes to "← Back to five" to return to live mode. Preview auto-clears when the previewed city becomes the active 5 PM city.

**User preferences (localStorage):**
- `five-theme` — `"dark"` or `"light"` for theme toggle
- `five-clock-format` — `"12h"` or `"24h"` for clock format toggle

**Styling:** Uses CSS custom properties (`--background`, `--foreground`, `--sheet-bg`) defined in `globals.css` with `.dark` class variants. Container border radius is `rounded-3xl`.

**Deployment:** GitHub Pages via `.github/workflows/deploy.yml`. `basePath` is `/five` in production. Images are unoptimized (required for static export).

## Conventions

- All components are `"use client"` — this is a fully client-rendered app
- Font: Instrument Sans loaded via `next/font/google`
- Drink entries are keyed by city name and must match `locations.ts` city names exactly
- Version displayed in footer, tracked in `package.json`
