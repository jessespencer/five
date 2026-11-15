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

function formatTimeParts(h: number, m: number, is24h: boolean): { time: string; meridiem: string } {
  const mm = m.toString().padStart(2, "0");
  if (is24h) return { time: `${h.toString().padStart(2, "0")}:${mm}`, meridiem: "" };
  return { time: `${h % 12 || 12}:${mm}`, meridiem: h >= 12 ? "PM" : "AM" };
}

function formatTime(h: number, m: number, is24h: boolean): string {
  const { time, meridiem } = formatTimeParts(h, m, is24h);
  return meridiem ? `${time} ${meridiem}` : time;
}

function GroupLabel({ children, first = false }: { children: React.ReactNode; first?: boolean }) {
  return (
    <span className={`label block pt-3 pb-2 border-t border-[var(--rule)] ${first ? "" : "mt-5"}`}>
      {children}
    </span>
  );
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
      className="overflow-y-auto flex-1 min-h-0 scrollbar-hide outline-none px-2 -mx-2 pb-8"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex flex-col">
        <AnimatePresence mode="popLayout" initial={false}>
          {allLocations.map(({ location, hours, minutes, isFiveOClock }, index) => {
            const isEffective = location.city === effectiveCity;
            const anyFive = allLocations.some((lt) => lt.isFiveOClock);
            const isFirstFive = isFiveOClock && allLocations.findIndex((lt) => lt.isFiveOClock) === index;
            const isHighlighted = isEffective || (!previewCity && (isFirstFive || (!anyFive && index === 0)));
            const isRealActive = isFiveOClock;
            const spreadHour = 17 + (index / allLocations.length) * 24;
            const cityAccent = getAccentForHour(spreadHour, isDark);
            const prevIsRealActive =
              index > 0 && allLocations[index - 1].isFiveOClock;
            const showUpNext = prevIsRealActive && !isFiveOClock;
            // During fallback (no city at 5 PM), show "Up Next" after the fallback city
            const showFallbackUpNext = !anyFive && index === 1;
            return (
              <div key={location.city}>
                {isRealActive && (index === 0 || !allLocations[index - 1].isFiveOClock) && (
                  <GroupLabel first={index === 0}>Now</GroupLabel>
                )}
                {!anyFive && index === 0 && <GroupLabel first>Almost five</GroupLabel>}
                {(showUpNext || showFallbackUpNext) && <GroupLabel>Up next</GroupLabel>}
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
                  group flex items-center justify-between gap-3 h-8 -mx-2 px-2 rounded-md transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[var(--foreground)]/40
                  ${isHighlighted ? "bg-[var(--foreground)]/[0.06] text-[var(--foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    aria-hidden="true"
                    className="block w-[5px] h-[5px] rounded-full shrink-0 transition-transform"
                    style={{ backgroundColor: cityAccent, transform: isHighlighted ? "scale(1.4)" : undefined }}
                  />
                  <span className={`text-[13px] tracking-[-0.005em] truncate ${isHighlighted ? "font-medium" : ""}`}>
                    {location.city}
                  </span>
                </div>
                <span className="font-mono text-[12px] tabular-nums whitespace-nowrap">
                  {(() => {
                    const { time, meridiem } = formatTimeParts(hours, minutes, is24h);
                    return (
                      <>
                        {time}
                        {meridiem && <span className="ml-1 text-[10px] opacity-70">{meridiem}</span>}
                      </>
                    );
                  })()}
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
