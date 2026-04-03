"use client";

import { useState, useEffect, useCallback } from "react";
import { Sun, Moon, MapPin, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFiveOClock } from "@/hooks/useFiveOClock";
import { getAccentForHour, getTextColorForAccent } from "@/utils/accentColor";
import ClockDisplay, { ClockTagline } from "@/components/ClockDisplay";
import WorldMap from "@/components/WorldMap";
import TimezoneTicker from "@/components/TimezoneTicker";
import RecipeTile from "@/components/RecipeTile";
import { drinks } from "@/data/drinks";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [is24h, setIs24h] = useState(false);
  const [previewCity, setPreviewCity] = useState<string | null>(null);
  const { result } = useFiveOClock();

  useEffect(() => {
    const stored = localStorage.getItem("five-theme");
    if (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
    const storedClock = localStorage.getItem("five-clock-format");
    if (storedClock === "24h") setIs24h(true);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("five-theme", next ? "dark" : "light");
  }

  function toggleClockFormat() {
    const next = !is24h;
    setIs24h(next);
    localStorage.setItem("five-clock-format", next ? "24h" : "12h");
  }

  useEffect(() => {
    if (previewCity && result?.location.city === previewCity) {
      setPreviewCity(null);
    }
  }, [result?.location.city, previewCity]);

  const handleCityClick = useCallback((city: string) => {
    setPreviewCity((prev) => (prev === city ? null : city));
  }, []);

  if (!result) return null;

  const previewEntry = previewCity
    ? result.allLocations.find((lt) => lt.location.city === previewCity) ?? null
    : null;

  const displayLocation = previewEntry ? previewEntry.location : result.location;
  const displayHours = previewEntry ? previewEntry.hours : result.hours;
  const displayMinutes = previewEntry ? previewEntry.minutes : result.minutes;
  const displaySeconds = previewEntry ? previewEntry.seconds : result.seconds;
  const displayDrink = previewEntry
    ? (drinks[previewEntry.location.city] ?? result.drink)
    : result.drink;

  const decimalHour = displayHours + displayMinutes / 60 + displaySeconds / 3600;
  const accent = getAccentForHour(decimalHour);
  const accentTextColor = getTextColorForAccent(accent);

  return (
    <main
      className="min-h-dvh w-full bg-[var(--background)] transition-colors duration-300 lg:flex lg:flex-row"
      style={{ "--accent": accent } as React.CSSProperties}
    >
      {/* Main content — scrollable */}
      <div className="flex-1 min-h-dvh lg:overflow-y-auto">
        <div className="max-w-[1100px] mx-auto flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-5">
          {/* Header */}
          <header className="flex items-center justify-between shrink-0">
            {previewCity ? (
              <button
                onClick={() => setPreviewCity(null)}
                className="flex items-center gap-1.5 text-2xl font-black tracking-tight opacity-50 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft size={24} strokeWidth={1.5} /> Back to five
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
                  onClick={() => { setIs24h(false); localStorage.setItem("five-clock-format", "12h"); }}
                  className={`h-7 px-2.5 rounded-full text-xs font-semibold tabular-nums transition-colors ${!is24h ? "bg-[var(--foreground)]/10" : "opacity-40 hover:opacity-70"}`}
                  role="radio"
                  aria-checked={!is24h}
                >
                  12h
                </button>
                <button
                  onClick={() => { setIs24h(true); localStorage.setItem("five-clock-format", "24h"); }}
                  className={`h-7 px-2.5 rounded-full text-xs font-semibold tabular-nums transition-colors ${is24h ? "bg-[var(--foreground)]/10" : "opacity-40 hover:opacity-70"}`}
                  role="radio"
                  aria-checked={is24h}
                >
                  24h
                </button>
              </div>
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Sun size={16} strokeWidth={1.5} />
                ) : (
                  <Moon size={16} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </header>

          {/* Clock */}
          <div className="shrink-0 flex flex-col gap-8">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
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
              <MapPin size={24} strokeWidth={1.5} className="opacity-40 shrink-0" />
              <div className="flex flex-col gap-1">
                <ClockTagline />
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight">{displayLocation.city}</span>
                  <span className="text-xl font-light opacity-30 -ml-0.5">{displayLocation.country}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map + Recipe */}
          <div className="flex flex-col gap-4 md:gap-5">
            {/* World Map */}
            <div className="bg-[var(--sheet-bg)] rounded-3xl p-4 md:p-5 shrink-0 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-widest uppercase opacity-30">
                  Time Zone
                </span>
                <span className="text-xs opacity-30 tabular-nums">
                  UTC {displayLocation.utcOffset >= 0 ? "+" : ""}
                  {displayLocation.utcOffset}
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
            <span className="text-xs opacity-30">
              Built by{" "}
              <a
                href="https://www.jessedestroys.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-60 transition-opacity"
              >
                jessedestroys.com
              </a>
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
        />
      </aside>
    </main>
  );
}
