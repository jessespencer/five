"use client";

import { useState, useEffect, useRef } from "react";

const DURATION_MS = 2000;
const TARGET_TOTAL_MINUTES = 300; // 5 hours × 60 minutes

// easeOutExpo — same feel as countUp.js
function easeOutExpo(t: number, b: number, c: number, d: number): number {
  return t === d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024 / 1023 + b;
}

interface LoadingClockProps {
  is24h: boolean;
  onComplete: () => void;
}

export default function LoadingClock({ is24h, onComplete }: LoadingClockProps) {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    function tick(timestamp: number) {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const value = easeOutExpo(
        Math.min(elapsed, DURATION_MS),
        0,
        TARGET_TOTAL_MINUTES,
        DURATION_MS
      );

      setTotalMinutes(Math.round(value));

      if (elapsed < DURATION_MS) {
        requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setTotalMinutes(TARGET_TOTAL_MINUTES);
        setTimeout(onComplete, 500);
      }
    }

    requestAnimationFrame(tick);
  }, [onComplete]);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const displayHours = is24h ? hours + 12 : hours || 12;
  const hh = displayHours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");

  return (
    <div lang="en" className="min-h-dvh w-full bg-[var(--background)] flex items-center justify-center transition-colors duration-300">
      <div className="flex items-baseline gap-1">
        <span className="text-[96px] xl:text-[120px] leading-none font-thin tracking-tighter tabular-nums">
          {hh}:{mm}
        </span>
        {!is24h && (
          <span className="text-[24px] xl:text-[30px] leading-none font-light tracking-tight opacity-40 ml-2">
            PM
          </span>
        )}
      </div>
    </div>
  );
}
