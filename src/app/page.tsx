"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Sun, Moon, MapPin, ArrowLeft, PartyPopper } from "lucide-react";
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

function HomeContent() {
  const [isDark, setIsDark] = useState(false);
  const [is24h, setIs24h] = useState(false);
  const [previewCity, setPreviewCity] = useState<string | null>(null);
  const [confettiMessage, setConfettiMessage] = useState<ConfettiMessage | null>(null);
  const [loadingDone, setLoadingDone] = useState(false);
  const prevActiveCityRef = useRef<string | null>(null);
  const prevIsFallbackRef = useRef(true);
  const { result } = useFiveOClock();

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

  const isLoading = !result || !loadingDone;

  if (isLoading) {
    return (
      <AnimatePresence mode="wait">
        <LoadingClock key="loading" is24h={is24h} onComplete={handleLoadingComplete} />
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
      <div className="flex-1 min-h-dvh lg:overflow-y-auto">
        <div className="max-w-[1100px] mx-auto flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-5">
          {/* Header */}
          <header className="flex items-center justify-between shrink-0">
            {previewCity ? (
              <button
                onClick={() => setPreviewCity(null)}
                className="flex items-center gap-1.5 text-2xl font-light tracking-tight opacity-40 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft aria-hidden="true" size={24} strokeWidth={1.5} /> Back to <span className="font-black">Five</span>
              </button>
            ) : (
              <h1 className="text-2xl font-black tracking-tight">Five</h1>
            )}
            <div className="flex items-center gap-2">
              <div
                className="h-9 flex items-center rounded-full bg-[var(--foreground)]/5 p-1 gap-0.5"
                role="radiogroup"
                aria-label="Clock format"
              >
                <button
                  onClick={() => { setIs24h(false); try { localStorage.setItem("five-clock-format", "12h"); } catch {} }}
                  className={`h-7 px-2.5 rounded-full text-xs font-semibold tabular-nums transition-colors ${!is24h ? "bg-[var(--foreground)]/10" : "opacity-40 hover:opacity-70"}`}
                  role="radio"
                  aria-checked={!is24h}
                >
                  12h
                </button>
                <button
                  onClick={() => { setIs24h(true); try { localStorage.setItem("five-clock-format", "24h"); } catch {} }}
                  className={`h-7 px-2.5 rounded-full text-xs font-semibold tabular-nums transition-colors ${is24h ? "bg-[var(--foreground)]/10" : "opacity-40 hover:opacity-70"}`}
                  role="radio"
                  aria-checked={is24h}
                >
                  24h
                </button>
              </div>
              <button
                onClick={() => {
                  const config = getConfettiConfig(hoursUntilFive);
                  const phrases = getPhrasesForHoursUntilFive(hoursUntilFive);
                  const tagline = phrases[Math.floor(Math.random() * phrases.length)];
                  setConfettiMessage({ type: "tagline", tagline, city: displayLocation.city, config });
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-colors"
                aria-label="Launch confetti"
              >
                <PartyPopper aria-hidden="true" size={16} strokeWidth={1.5} />
              </button>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun aria-hidden="true" size={16} strokeWidth={1.5} />
                ) : (
                  <Moon aria-hidden="true" size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </header>

          {/* Clock */}
          <div id="clock" className="shrink-0 flex flex-col gap-8">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayLocation.city}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
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

            <div className="flex items-center gap-4 pl-4">
              <MapPin aria-hidden="true" size={24} strokeWidth={1.5} className="opacity-40 shrink-0" />
              <div className="flex flex-col">
                <ClockTagline key={displayLocation.city} hoursUntilFive={hoursUntilFive} />
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight">{displayLocation.city}</span>
                  <span className="text-lg font-light opacity-40 -ml-0.5">{displayLocation.country}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map + Recipe */}
          <div className="flex flex-col gap-4 md:gap-5">
            {/* World Map */}
            <div className="bg-[var(--sheet-bg)] rounded-3xl p-4 md:p-5 shrink-0 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-widest uppercase opacity-40">
                  Time Zone
                </span>
                <span className="text-xs opacity-40 tabular-nums">
                  UTC {displayEntry.liveUtcOffset >= 0 ? "+" : ""}
                  {displayEntry.liveUtcOffset}
                </span>
              </div>
              <WorldMap
                allLocations={result.allLocations}
                activeCity={displayLocation.city}
                activeLongitude={displayLocation.longitude}
              />
            </div>

            {/* Recipe Tile */}
            <div className="shrink-0">
              <RecipeTile
                drink={displayDrink}
                accentColor={accent}
                accentTextColor={accentTextColor}
              />
            </div>
          </div>

          {/* Footer */}
          <footer className="py-6 text-center">
            <span className="text-xs opacity-40">
              Built by{" "}
              <a
                href="https://www.jessedestroys.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-60 transition-opacity"
              >
                jessedestroys.com
              </a>
              {" "}
              <span className="opacity-40">v1.2.0</span>
            </span>
          </footer>
        </div>
      </div>

      {/* Side panel — locked timezone ticker (desktop only) */}
      <aside className="hidden lg:flex flex-col w-[260px] shrink-0 h-dvh sticky top-0 border-l border-[var(--foreground)]/5 bg-[var(--background)] p-4 pt-8 transition-colors">
        <TimezoneTicker
          allLocations={result.allLocations}
          activeCity={result.location.city}
          previewCity={previewCity}
          onCityClick={handleCityClick}
          is24h={is24h}
          isDark={isDark}
        />
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
