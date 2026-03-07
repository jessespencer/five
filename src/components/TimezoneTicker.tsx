"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LocationTime } from "@/utils/timezone";

interface TimezoneTickerProps {
  allLocations: LocationTime[];
  activeCity: string;
}

function formatTime(h: number, m: number): string {
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export default function TimezoneTicker({
  allLocations,
  activeCity,
}: TimezoneTickerProps) {
  return (
    <div
      className="overflow-y-auto h-full scrollbar-hide pr-2"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex flex-col gap-1 py-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {allLocations.map(({ location, hours, minutes }) => {
            const isActive = location.city === activeCity;
            return (
              <motion.div
                key={location.city}
                layout
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`
                  flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-colors
                  ${isActive ? "bg-[var(--foreground)]/10" : "hover:bg-[var(--foreground)]/5"}
                `}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isActive
                        ? "bg-[var(--foreground)]"
                        : "bg-[var(--foreground)]/20"
                    }`}
                  />
                  <span
                    className={`text-xs truncate ${
                      isActive ? "font-semibold" : "opacity-50"
                    }`}
                  >
                    {location.city}
                  </span>
                </div>
                <span
                  className={`text-xs tabular-nums whitespace-nowrap ${
                    isActive ? "font-bold" : "opacity-40"
                  }`}
                >
                  {formatTime(hours, minutes)}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
