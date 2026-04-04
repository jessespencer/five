"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LocationTime } from "@/utils/timezone";
import { getAccentForHour } from "@/utils/accentColor";

interface TimezoneTickerProps {
  allLocations: LocationTime[];
  activeCity: string;
  previewCity?: string | null;
  onCityClick?: (city: string) => void;
  is24h?: boolean;
  isDark?: boolean;
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
  isDark = true,
}: TimezoneTickerProps) {
  const effectiveCity = previewCity ?? activeCity;
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const effectiveIndex = allLocations.findIndex(
    (lt) => lt.location.city === effectiveCity
  );

  const focusIndexRef = useRef(effectiveIndex);

  // Sync focus index when selection changes
  useEffect(() => {
    focusIndexRef.current = effectiveIndex;
  }, [effectiveIndex]);

  // Store mutable values in refs so the keydown listener doesn't need to reattach every second
  const stateRef = useRef({ allLocations, previewCity, onCityClick });
  useEffect(() => {
    stateRef.current = { allLocations, previewCity, onCityClick };
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleKeyDown(e: KeyboardEvent) {
      const { allLocations, previewCity, onCityClick } = stateRef.current;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = Math.min(focusIndexRef.current + 1, allLocations.length - 1);
        focusIndexRef.current = next;
        const city = allLocations[next]?.location.city;
        if (city) {
          onCityClick?.(city);
          const row = rowRefs.current.get(city);
          row?.focus();
          row?.scrollIntoView({ block: "nearest" });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = Math.max(focusIndexRef.current - 1, 0);
        focusIndexRef.current = prev;
        const city = allLocations[prev]?.location.city;
        if (city) {
          onCityClick?.(city);
          const row = rowRefs.current.get(city);
          row?.focus();
          row?.scrollIntoView({ block: "nearest" });
        }
      } else if (e.key === "Escape" && previewCity) {
        onCityClick?.(previewCity);
      }
    }

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="listbox"
      aria-label="Timezone list"
      className="overflow-y-auto h-full scrollbar-hide outline-none p-1 -m-1"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex flex-col gap-1">
        <AnimatePresence mode="popLayout" initial={false}>
          {allLocations.map(({ location, hours, minutes, isFiveOClock }, index) => {
            const isEffective = location.city === effectiveCity;
            const isHighlighted = isEffective || (!previewCity && isFiveOClock);
            const isRealActive = isFiveOClock;
            const spreadHour = 17 + (index / allLocations.length) * 24;
            const cityAccent = getAccentForHour(spreadHour, isDark);
            const prevIsRealActive =
              index > 0 && allLocations[index - 1].isFiveOClock;
            const showUpNext = prevIsRealActive && !isFiveOClock;
            return (
              <div key={location.city}>
                {isRealActive && (index === 0 || !allLocations[index - 1].isFiveOClock) && (
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
                ref={(el: HTMLDivElement | null) => {
                  if (el) rowRefs.current.set(location.city, el);
                  else rowRefs.current.delete(location.city);
                }}
                layout
                role="option"
                aria-selected={isEffective}
                aria-label={`${location.city}, ${formatTime(hours, minutes, is24h)}`}
                tabIndex={0}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                onClick={() => onCityClick?.(location.city)}
                onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !isEffective) { e.preventDefault(); onCityClick?.(location.city); } }}
                className={`
                  flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--foreground)]/30
                  ${isHighlighted ? "bg-[var(--foreground)]/10" : "hover:bg-[var(--foreground)]/5"}
                `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: cityAccent, opacity: isHighlighted ? 1 : 0.5 }}
                  />
                  <span
                    className={`text-xs truncate ${
                      isHighlighted ? "font-semibold" : "opacity-50"
                    }`}
                  >
                    {location.city}
                  </span>
                </div>
                <span
                  className={`text-xs tabular-nums whitespace-nowrap ${
                    isHighlighted ? "font-bold" : "opacity-40"
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
