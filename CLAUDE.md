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

**Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Framer Motion + canvas-confetti + Lucide icons. Static export deployed to GitHub Pages via `output: "export"` in `next.config.ts`.

**Core data flow:**
- `src/utils/timezone.ts` — `getFiveOClockData()` is the central function. Runs every second via the `useFiveOClock` hook. Uses `Intl.DateTimeFormat` to compute the current time in each timezone, finds the one at 5 PM (or closest), and sorts all locations in continuous westward progression from the active city.
- `src/hooks/useFiveOClock.ts` — Client-side hook that polls `getFiveOClockData()` at 1-second intervals.
- `src/data/locations.ts` — Static array of ~31 locations (one per UTC offset, including half/quarter offsets like UTC+5:45 Kathmandu). Each has coordinates for map placement.
- `src/data/drinks.ts` — `Record<string, Drink>` keyed by city name. Each drink has a full recipe. A fallback "Local Brew" drink exists in `timezone.ts` for cities without an entry.

**Accent color system:**
- `src/utils/accentColor.ts` — `getAccentForHour(hour, isDark)` returns a hex color using a pure HSL hue rotation. Starting at amber/orange (25°), the hue cycles through the full rainbow across 24 hours. A sine-curve blends saturation/lightness: vibrant near the hero color, muted pastels in the middle. Light and dark mode share the same hue arc but use different saturation and lightness values.
- The sidebar ticker and recipe tile use index-based coloring (mapping list position to hours starting at 17) for smooth visual progression.
- `getTextColorForAccent(hex)` returns `"#000"` or `"#fff"` based on luminance contrast.
- Saturation values: hero (t=0) is 0.75 dark / 0.70 light; mid-range fades via sine curve.

**Confetti system:**
- `src/components/Confetti.tsx` — Uses `canvas-confetti` library with custom SVG path shapes (heart, tree, pint) via `shapeFromPath()`. Renders a fullscreen `<canvas>` + dimmed background + animated text overlay.
- Two trigger modes via `ConfettiMessage` type:
  - `{ type: "five", city }` — fired on 5 PM city transitions. Shows "It's **Five** in {city}".
  - `{ type: "tagline", tagline, city }` — fired by party popper button. Shows a random tagline (from `PHRASES` in ClockDisplay) above the bold city name.
- Fireworks pattern: 3-second duration, dual bursts from left/right every 250ms, tapering particle count.
- Colors are sampled dynamically from `getAccentForHour()` to match the sidebar ticker palette.
- `disableForReducedMotion: true` respects the user's motion preferences.
- `ClockDisplay.tsx` exports `PHRASES` array for reuse by the confetti tagline mode.

**Components (all client-side):**
- `ClockDisplay` — Large time display supporting 12h/24h format, `aria-live` for screen readers. Exports `PHRASES` array of taglines.
- `WorldMap` — SVG equirectangular map with continent paths, animated timezone line, city dots. Uses `useId()` for unique SVG pattern IDs.
- `TimezoneTicker` — Locked sidebar panel (`role="listbox"`) listing all timezones in westward order. Clickable for city preview, full keyboard navigation (Arrow keys move focus, Enter/Space select, Escape deselect).
- `RecipeTile` — Expandable accent-colored card (`role="button"`, `aria-expanded`) showing drink name, ingredients, method, with copy/share buttons. Keyboard accessible.
- `Confetti` — Canvas-based confetti overlay with text; see "Confetti system" above.
- `ErrorBoundary` — Class component wrapping the app; shows recovery UI with `role="alert"` on crash.

**City preview:** Clicking a city in the sidebar sets `previewCity` state, which swaps the clock, map, recipe, and accent color to that city. The header changes to "← Back to five" to return to live mode. Preview auto-clears when the previewed city becomes the active 5 PM city.

**User preferences (localStorage):**
- `five-theme` — `"dark"` or `"light"` for theme toggle
- `five-clock-format` — `"12h"` or `"24h"` for clock format toggle

**Styling:** Uses CSS custom properties (`--background`, `--foreground`, `--sheet-bg`) defined in `globals.css` with `.dark` class variants. Container border radius is `rounded-3xl`.

**Deployment:** GitHub Pages via `.github/workflows/deploy.yml`. `basePath` is `/five` in production. Images are unoptimized (required for static export).

**Accessibility:**
- Skip navigation link, `prefers-reduced-motion` media query in `globals.css`
- All decorative Lucide icons have `aria-hidden="true"`
- `localStorage` calls wrapped in try/catch for private browsing compatibility
- WCAG 2.1 AA targeted

## Conventions

- All components are `"use client"` — this is a fully client-rendered app
- Font: Instrument Sans loaded via `next/font/google`
- Drink entries are keyed by city name and must match `locations.ts` city names exactly
- Version displayed in footer, tracked in `package.json`
- 3 pre-existing lint warnings (`setState-in-effect`) for localStorage hydration and interval polling — these are intentional patterns
