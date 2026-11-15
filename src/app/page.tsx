"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sun, Moon, ArrowLeft, ArrowDown, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFiveOClock } from "@/hooks/useFiveOClock";
import { getAccentForHour, getTextColorForAccent } from "@/utils/accentColor";
import ClockDisplay, { ClockTagline, getPhrasesForHoursUntilFive, getConfettiConfig } from "@/components/ClockDisplay";
import WorldMap from "@/components/WorldMap";
import TimezoneTicker from "@/components/TimezoneTicker";
import RecipeTile from "@/components/RecipeTile";
import { drinks } from "@/data/drinks";
import ErrorBoundary from "@/components/ErrorBoundary";
import Confetti, { type ConfettiMessage } from "@/components/Confetti";
import LoadingClock from "@/components/LoadingClock";

function formatUtcOffset(offset: number): string {
  const sign = offset < 0 ? "−" : "+";
  const abs = Math.abs(offset);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function formatCoord(value: number, pos: string, neg: string): string {
  return `${Math.abs(value).toFixed(2)}°${value >= 0 ? pos : neg}`;
}

function Wordmark() {
  return (
    <span className="inline-flex items-baseline gap-[3px] text-[17px] font-semibold tracking-[-0.02em] leading-none">
      Five
      <span aria-hidden="true" className="block w-[6px] h-[6px] rounded-full bg-[var(--accent)] transition-colors duration-500" />
    </span>
  );
}

/**
 * Shared icon-control spec: 36px solid tonal disc, 16px icon at a true 1.75px
 * stroke (absoluteStrokeWidth keeps the weight constant at any icon size).
 */
const ICON_SIZE = 16;
const ICON_STROKE = 1.75;
const controlSurface =
  "bg-[var(--foreground)]/[0.07] hover:bg-[var(--foreground)]/[0.13] active:bg-[var(--foreground)]/[0.18] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`w-9 h-9 grid place-items-center rounded-full ${controlSurface} [&>svg]:block`}
    >
      {children}
    </button>
  );
}

/** Numbered hairline header shared by every section — the page's only ornament. */
function SectionRule({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 pt-3 border-t border-[var(--rule)]">
      <span className="label">
        <span className="text-[var(--foreground)]">{index}</span>&emsp;{title}
      </span>
      {children != null && <span className="label text-right">{children}</span>}
    </div>
  );
}

function HomeContent() {
  const [isDark, setIsDark] = useState(false);
  const [is24h, setIs24h] = useState(false);
  const [is24hReady, setIs24hReady] = useState(false);
  const [previewCity, setPreviewCity] = useState<string | null>(null);
  const [confettiMessage, setConfettiMessage] = useState<ConfettiMessage | null>(null);
  const [loadingDone, setLoadingDone] = useState(false);
  const prevActiveCityRef = useRef<string | null>(null);
  const prevIsFallbackRef = useRef(true);
  const { result } = useFiveOClock();
  const [recipeOpen, setRecipeOpen] = useState(false);
  const drinkSectionRef = useRef<HTMLElement>(null);
  const recipeToggleRef = useRef<HTMLButtonElement>(null);

  const pendingJumpRef = useRef(false);

  const scrollToDrink = useCallback(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    drinkSectionRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, []);

  // Hero shortcut: open the recipe, glide down to it, and move focus there.
  // While the tile is collapsed the page may be too short to bring the section
  // to the top, so the glide is re-aimed once the tile has finished opening.
  const jumpToDrink = useCallback(() => {
    pendingJumpRef.current = !recipeOpen;
    setRecipeOpen(true);
    scrollToDrink();
    recipeToggleRef.current?.focus({ preventScroll: true });
  }, [recipeOpen, scrollToDrink]);

  const handleRecipeOpened = useCallback(() => {
    if (!pendingJumpRef.current) return;
    pendingJumpRef.current = false;
    scrollToDrink();
  }, [scrollToDrink]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("five-theme");
      if (
        stored === "dark" ||
        (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      }
      const storedClock = localStorage.getItem("five-clock-format");
      if (storedClock === "24h") {
        setIs24h(true);
      } else if (!storedClock) {
        // Detect system 24h preference from locale
        const hourFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hourCycle;
        if (hourFormat === "h23" || hourFormat === "h24") setIs24h(true);
      }
    } catch {
      // localStorage unavailable (private browsing)
    }
    setIs24hReady(true);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("five-theme", next ? "dark" : "light"); } catch {}
  }

  useEffect(() => {
    if (previewCity && result?.location.city === previewCity) {
      setPreviewCity(null);
    }
  }, [result?.location.city, previewCity]);

  // Fire confetti when the active city changes OR when a fallback city becomes the real 5 PM city
  useEffect(() => {
    const city = result?.location.city ?? null;
    const isFallback = result?.isFallback ?? true;
    if (prevActiveCityRef.current && city) {
      const cityChanged = city !== prevActiveCityRef.current;
      const becameReal = !isFallback && prevIsFallbackRef.current;
      if (cityChanged || becameReal) {
        setConfettiMessage({ type: "five", city });
      }
    }
    prevActiveCityRef.current = city;
    prevIsFallbackRef.current = isFallback;
  }, [result?.location.city, result?.isFallback]);

  const handleCityClick = useCallback((city: string) => {
    setPreviewCity((prev) => (prev === city ? null : city));
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setLoadingDone(true);
  }, []);

  const isLoading = !result || !loadingDone || !is24hReady;

  if (isLoading) {
    return (
      <AnimatePresence mode="wait">
        <LoadingClock key="loading" onComplete={handleLoadingComplete} />
      </AnimatePresence>
    );
  }

  const previewEntry = previewCity
    ? result.allLocations.find((lt) => lt.location.city === previewCity) ?? null
    : null;

  const displayEntry = previewEntry ?? result.allLocations[0];
  const displayLocation = previewEntry ? previewEntry.location : result.location;
  const displayHours = previewEntry ? previewEntry.hours : result.hours;
  const displayMinutes = previewEntry ? previewEntry.minutes : result.minutes;
  const displaySeconds = previewEntry ? previewEntry.seconds : result.seconds;
  const displayDrink = previewEntry
    ? (drinks[previewEntry.location.city] ?? result.drink)
    : result.drink;

  const displayIndex = previewEntry
    ? result.allLocations.findIndex((lt) => lt.location.city === previewCity)
    : 0;
  const spreadHour = 17 + (displayIndex / result.allLocations.length) * 24;
  const accent = getAccentForHour(spreadHour, isDark);
  const accentTextColor = getTextColorForAccent(accent);
  const hoursUntilFive = (17 - displayHours + 24) % 24;

  return (
    <motion.main
      key="main"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-dvh w-full bg-[var(--background)] transition-colors duration-300 lg:flex lg:flex-row"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <AnimatePresence>
        {confettiMessage && <Confetti message={confettiMessage} isDark={isDark} onComplete={() => setConfettiMessage(null)} />}
      </AnimatePresence>
      <a
        href="#clock"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-full focus:bg-[var(--foreground)] focus:text-[var(--background)] focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>
      {/* Main content — scrollable */}
      <div className="flex-1 min-h-dvh lg:h-dvh lg:overflow-y-auto">
        <div className="max-w-[1040px] mx-auto px-5 md:px-10 lg:px-14 pt-5 md:pt-8 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between h-10">
            {previewCity ? (
              <button
                onClick={() => setPreviewCity(null)}
                className="group flex items-center gap-3 -ml-1 pl-1 pr-2 h-10 rounded-full"
              >
                <ArrowLeft aria-hidden="true" size={ICON_SIZE} strokeWidth={ICON_STROKE} absoluteStrokeWidth className="block transition-transform group-hover:-translate-x-0.5" />
                <Wordmark />
                <span className="label hidden sm:inline">Back to live</span>
              </button>
            ) : (
              <h1><Wordmark /></h1>
            )}
            <div className="flex items-center gap-2">
              <div
                className="h-9 flex items-center rounded-full bg-[var(--foreground)]/[0.07] p-1"
                role="radiogroup"
                aria-label="Clock format"
              >
                {(["12h", "24h"] as const).map((fmt) => {
                  const checked = (fmt === "24h") === is24h;
                  return (
                    <button
                      key={fmt}
                      onClick={() => { setIs24h(fmt === "24h"); try { localStorage.setItem("five-clock-format", fmt); } catch {} }}
                      className={`h-7 min-w-[42px] px-2.5 grid place-items-center rounded-full font-mono text-[11px] font-medium leading-none uppercase tracking-[0.06em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/50 ${checked ? "bg-[var(--foreground)] text-[var(--background)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                      role="radio"
                      aria-checked={checked}
                    >
                      {/* Mono caps sit high in their line box; nudge down to optical center. */}
                      <span className="block translate-y-[0.5px]">{fmt}</span>
                    </button>
                  );
                })}
              </div>
              <IconButton
                label="Launch confetti"
                onClick={() => {
                  const config = getConfettiConfig(hoursUntilFive);
                  const phrases = getPhrasesForHoursUntilFive(hoursUntilFive);
                  const tagline = phrases[Math.floor(Math.random() * phrases.length)];
                  setConfettiMessage({ type: "tagline", tagline, city: displayLocation.city, config });
                }}
              >
                {/* The popper's mass sits bottom-left; shift up-right to look centered. */}
                <PartyPopper aria-hidden="true" size={ICON_SIZE} strokeWidth={ICON_STROKE} absoluteStrokeWidth className="translate-x-[0.75px] -translate-y-[0.75px]" />
              </IconButton>
              <IconButton label={isDark ? "Switch to light mode" : "Switch to dark mode"} onClick={toggleTheme}>
                {isDark ? (
                  <Sun aria-hidden="true" size={ICON_SIZE} strokeWidth={ICON_STROKE} absoluteStrokeWidth />
                ) : (
                  <Moon aria-hidden="true" size={ICON_SIZE} strokeWidth={ICON_STROKE} absoluteStrokeWidth />
                )}
              </IconButton>
            </div>
          </header>

          {/* 01 — Clock */}
          <section id="clock" aria-label="Local time" className="pt-[clamp(32px,8vh,88px)]">
            <SectionRule index="01" title={previewCity ? "Preview" : "Five o'clock"}>
              {formatUtcOffset(displayEntry.liveUtcOffset)}
            </SectionRule>

            <div className="overflow-hidden pt-[clamp(28px,5vh,56px)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayLocation.city}
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 16, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <ClockDisplay
                    hours={displayHours}
                    minutes={displayMinutes}
                    seconds={displaySeconds}
                    is24h={is24h}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Location left, drink shortcut right — the button's right edge lines up
                with the UTC label and the clock's seconds column above. Stacks on small screens. */}
            <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-x-10 gap-y-8">
              <div className="min-w-0">
                <p className="text-[15px] text-[var(--muted)]">
                  <ClockTagline key={displayLocation.city} hoursUntilFive={hoursUntilFive} />
                </p>
                <h2 className="mt-1 text-[clamp(36px,6vw,64px)] font-medium leading-[1] tracking-[-0.04em]">
                  {displayLocation.city}
                  <span className="text-[var(--muted)] font-light"> {displayLocation.country}</span>
                </h2>
              </div>

              {/* Jump to the drink — the page's one colored control, mirroring the recipe tile below. */}
              <button
                type="button"
                onClick={jumpToDrink}
                aria-label={`Show the ${displayDrink.name} recipe`}
                className="group self-start md:self-auto shrink-0 md:mb-[2px] inline-flex items-center gap-3 h-12 pl-5 pr-2 rounded-full transition-[background-color,transform] duration-500 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
                style={{ backgroundColor: accent, color: accentTextColor }}
              >
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] opacity-75 translate-y-[0.5px]">Pour</span>
                <span className="text-[16px] font-medium tracking-[-0.02em] whitespace-nowrap">{displayDrink.name}</span>
                {/* 32px disc inset 8px on every side, so it's concentric with the pill's end cap. */}
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-full grid place-items-center"
                  style={{ backgroundColor: accentTextColor === "#fff" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)" }}
                >
                  <ArrowDown size={ICON_SIZE} strokeWidth={ICON_STROKE} absoluteStrokeWidth className="block animate-[nudge_2.6s_ease-in-out_infinite] group-hover:[animation-play-state:paused]" />
                </span>
              </button>
            </div>
          </section>

          {/* 02 — Map */}
          <section aria-label="Time zone map" className="pt-[clamp(56px,11vh,112px)]">
            <SectionRule index="02" title="Time zone">
              {formatCoord(displayLocation.latitude, "N", "S")}&ensp;{formatCoord(displayLocation.longitude, "E", "W")}
            </SectionRule>
            <div className="pt-6 md:pt-8">
              <WorldMap
                allLocations={result.allLocations}
                activeCity={displayLocation.city}
                activeLongitude={displayLocation.longitude}
              />
            </div>
          </section>

          {/* 03 — Drink */}
          <section
            ref={drinkSectionRef}
            id="drink"
            aria-label="Signature drink"
            className="pt-[clamp(56px,11vh,112px)] scroll-mt-[-32px] md:scroll-mt-[-48px]"
          >
            <SectionRule index="03" title="Signature drink">
              {displayDrink.city}
            </SectionRule>
            <div className="pt-6 md:pt-8">
              <RecipeTile
                drink={displayDrink}
                accentColor={accent}
                accentTextColor={accentTextColor}
                isExpanded={recipeOpen}
                onExpandedChange={setRecipeOpen}
                toggleRef={recipeToggleRef}
                onOpened={handleRecipeOpened}
              />
            </div>
          </section>

          {/* 04 — All zones (mobile/tablet; desktop uses the sidebar) */}
          <section aria-label="All time zones" className="lg:hidden pt-[clamp(56px,11vh,112px)]">
            <SectionRule index="04" title="All zones">
              {result.allLocations.length}
            </SectionRule>
            {/* No fixed height on small screens: the list scrolls with the page rather than in a nested scroller. */}
            <div className="pt-4 flex flex-col">
              <TimezoneTicker
                allLocations={result.allLocations}
                activeCity={result.location.city}
                previewCity={previewCity}
                onCityClick={handleCityClick}
                is24h={is24h}
                isDark={isDark}
              />
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-[clamp(56px,11vh,112px)] mb-8 pt-3 border-t border-[var(--rule)] flex items-baseline justify-between">
            <span className="label">Five&ensp;v1.2.0</span>
            <a
              href="https://jessespencer.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="label hover:!text-[var(--foreground)] transition-colors"
            >
              jessespencer.dev ↗
            </a>
          </footer>
        </div>
      </div>

      {/* Side panel — locked timezone ticker (desktop only) */}
      <aside
        aria-label="All time zones"
        className="hidden lg:flex flex-col w-[260px] h-dvh shrink-0 sticky top-0 border-l border-[var(--rule)] bg-[var(--background)] px-5 pt-5 md:pt-8 transition-colors"
      >
        <div className="h-10 flex items-center">
          <span className="label">All zones</span>
        </div>
        <div className="flex-1 min-h-0 pt-[clamp(32px,8vh,88px)] flex flex-col">
          <TimezoneTicker
            allLocations={result.allLocations}
            activeCity={result.location.city}
            previewCity={previewCity}
            onCityClick={handleCityClick}
            is24h={is24h}
            isDark={isDark}
          />
        </div>
      </aside>

    </motion.main>
  );
}

export default function Home() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}
