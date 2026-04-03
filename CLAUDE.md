# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

"Five" is a single-page Next.js app that answers "where is it 5 o'clock right now?" It shows a real-time clock for the timezone currently at 5 PM, a world map highlighting that timezone, a sidebar ticker of all timezones, and a signature drink recipe for the active city.

## Commands

- `npm run dev` — start dev server (Next.js, hot reload)
- `npm run build` — production build (static export to `out/`)
- `npm run lint` — ESLint
- No test framework is configured yet

## Architecture

**Stack:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Framer Motion + Lucide icons. Static export deployed to GitHub Pages via `output: "export"` in `next.config.ts`.

**Core data flow:**
- `src/utils/timezone.ts` — `getFiveOClockData()` is the central function. Runs every second via the `useFiveOClock` hook. Uses `Intl.DateTimeFormat` to compute the current time in each timezone, finds the one at 5 PM (or closest), picks a matching drink, deduplicates overlapping timezones, and sorts westward from the active city.
- `src/hooks/useFiveOClock.ts` — Client-side hook that polls `getFiveOClockData()` at 1-second intervals and manages transition state when the active city changes.
- `src/data/locations.ts` — Static array of ~31 locations (one per UTC offset, including half/quarter offsets like UTC+5:45 Kathmandu). Each has coordinates for map placement.
- `src/data/drinks.ts` — `Record<string, Drink>` keyed by city name. Each drink has a full recipe. A fallback "Local Brew" drink exists in `timezone.ts` for cities without an entry.

**Components (all client-side):**
- `ClockDisplay` — Large time display with city name and random tagline phrase
- `WorldMap` — SVG equirectangular map with hand-drawn continent paths, animated timezone line, city dots
- `TimezoneTicker` — Scrollable sidebar listing all timezones sorted by proximity to 5 PM
- `RecipeTile` — Expandable amber card showing drink name, ingredients, and method

**Styling:** Uses CSS custom properties (`--background`, `--foreground`, `--sheet-bg`) defined in `globals.css` with `.dark` class variants. Theme toggle stores preference in `localStorage` under `five-theme`.

**Deployment:** GitHub Pages via `.github/workflows/deploy.yml`. `basePath` is `/five` in production. Images are unoptimized (required for static export).

## Conventions

- All components are `"use client"` — this is a fully client-rendered app
- Font: Instrument Sans loaded via `next/font/google`
- Drink entries are keyed by city name and must match `locations.ts` city names exactly
