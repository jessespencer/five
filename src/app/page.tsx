"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useFiveOClock } from "@/hooks/useFiveOClock";
import ClockDisplay from "@/components/ClockDisplay";
import WorldMap from "@/components/WorldMap";
import TimezoneTicker from "@/components/TimezoneTicker";
import RecipeTile from "@/components/RecipeTile";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const { result, isTransitioning } = useFiveOClock();

  useEffect(() => {
    const stored = localStorage.getItem("five-theme");
    if (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("five-theme", next ? "dark" : "light");
  }

  if (!result) return null;

  return (
    <main className="min-h-dvh w-full bg-[var(--background)] transition-colors duration-300">
      <div className="min-h-dvh max-w-[1400px] mx-auto flex flex-col p-4 md:p-6 lg:p-8 gap-4 md:gap-5">
        {/* Header */}
        <header className="flex items-center justify-between shrink-0">
          <h1 className="text-2xl font-black tracking-tight">Five</h1>
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
        </header>

        {/* Clock */}
        <div className="shrink-0">
          <ClockDisplay
            hours={result.hours}
            minutes={result.minutes}
            seconds={result.seconds}
            city={result.location.city}
            country={result.location.country}
            isTransitioning={isTransitioning}
          />
        </div>

        {/* Tiles + Sidebar */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 md:gap-5">
          {/* Left column — map + recipe */}
          <div className="flex flex-col gap-4 md:gap-5">
            {/* World Map */}
            <div className="bg-[var(--sheet-bg)] rounded-2xl p-4 md:p-5 shrink-0 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-widest uppercase opacity-30">
                  Time Zone
                </span>
                <span className="text-xs opacity-30 tabular-nums">
                  UTC {result.location.utcOffset >= 0 ? "+" : ""}
                  {result.location.utcOffset}
                </span>
              </div>
              <WorldMap
                allLocations={result.allLocations}
                activeCity={result.location.city}
                activeLongitude={result.location.longitude}
              />
            </div>

            {/* Recipe Tile */}
            <div className="shrink-0">
              <RecipeTile drink={result.drink} isTransitioning={isTransitioning} />
            </div>
          </div>

          {/* Right column — timezone ticker (desktop only) */}
          <div className="hidden lg:flex flex-col bg-[var(--sheet-bg)] rounded-2xl p-4 md:p-5 transition-colors overflow-hidden">
            <TimezoneTicker
              allLocations={result.allLocations}
              activeCity={result.location.city}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
