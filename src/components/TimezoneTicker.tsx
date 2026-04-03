"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LocationTime } from "@/utils/timezone";
import { getAccentForHour } from "@/utils/accentColor";

interface TimezoneTickerProps {
  allLocations: LocationTime[];
  activeCity: string;
  previewCity?: string | null;
  onCityClick?: (city: string) => void;
  is24h?: boolean;
}

function formatTime(h: number, m: number, is24h: boolean): string {
  if (is24h) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }
  const displayH = h % 12 || 12;
  const ampm = h >= 12 ? "p" : "a";
  return `${displayH}:${m.toString().padStart(2, "0")}${ampm}`;
}

export default function TimezoneTicker({
  allLocations,
  activeCity,
  previewCity,
  onCityClick,
  is24h = false,
}: TimezoneTickerProps) {
  const effectiveCity = previewCity ?? activeCity;
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const effectiveIndex = allLocations.findIndex(
    (lt) => lt.location.city === effectiveCity
  );

  const navigateTo = useCallback(
    (index: number) => {
      const city = allLocations[index]?.location.city;
      if (city) {
        onCityClick?.(city);
        rowRefs.current.get(city)?.scrollIntoView({ block: "nearest" });
      }
    },
    [allLocations, onCityClick]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(effectiveIndex + 1, allLocations.length - 1);
        navigateTo(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(effectiveIndex - 1, 0);
        navigateTo(prev);
      } else if (e.key === "Escape") {
        // Deselect preview by clicking the current effective city again
        onCityClick?.(effectiveCity);
      }
    }

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [effectiveIndex, allLocations, effectiveCity, navigateTo, onCityClick]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className="overflow-y-auto h-full scrollbar-hide outline-none"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex flex-col gap-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {allLocations.map(({ location, hours, minutes, seconds }, index) => {
            const isEffective = location.city === effectiveCity;
            const isRealActive = location.city === activeCity;
            const cityAccent = getAccentForHour(hours + minutes / 60 + seconds / 3600);
            const prevIsRealActive =
              index > 0 && allLocations[index - 1].location.city === activeCity;
            const showUpNext = prevIsRealActive && hours < 17;
            return (
              <div
                key={location.city}
                ref={(el) => {
                  if (el) rowRefs.current.set(location.city, el);
                  else rowRefs.current.delete(location.city);
                }}
              >
                {isRealActive && (
                  <span className="text-xs font-semibold tracking-widest uppercase opacity-30 block mb-3">
                    Now
                  </span>
                )}
                {showUpNext && (
                  <span className="text-xs font-semibold tracking-widest uppercase opacity-30 block mt-4 mb-3">
                    Up Next
                  </span>
                )}
                <motion.div
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                onClick={() => onCityClick?.(location.city)}
                className={`
                  flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-colors -mx-1 cursor-pointer
                  ${isEffective ? "bg-[var(--foreground)]/10" : "hover:bg-[var(--foreground)]/5"}
                `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: cityAccent, opacity: isEffective ? 1 : 0.5 }}
                  />
                  <span
                    className={`text-xs truncate ${
                      isEffective ? "font-semibold" : "opacity-50"
                    }`}
                  >
                    {location.city}
                  </span>
                </div>
                <span
                  className={`text-xs tabular-nums whitespace-nowrap ${
                    isEffective ? "font-bold" : "opacity-40"
                  }`}
                >
                  {formatTime(hours, minutes, is24h)}
                </span>
              </motion.div>
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
