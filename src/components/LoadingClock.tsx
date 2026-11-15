"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const DURATION_MS = 1400;
const START_MINUTES = 60; // 1:00 PM
const TARGET_TOTAL_MINUTES = 300; // 5:00 PM

// easeOutExpo — same feel as countUp.js
function easeOutExpo(t: number, b: number, c: number, d: number): number {
  return t === d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024 / 1023 + b;
}

interface LoadingClockProps {
  onComplete: () => void;
}

export default function LoadingClock({ onComplete }: LoadingClockProps) {
  const [totalMinutes, setTotalMinutes] = useState(START_MINUTES);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    function tick(timestamp: number) {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const value = easeOutExpo(
        Math.min(elapsed, DURATION_MS),
        START_MINUTES,
        TARGET_TOTAL_MINUTES - START_MINUTES,
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

  const displayHours = hours || 12;
  const hh = displayHours.toString();
  const mm = minutes.toString().padStart(2, "0");

  return (
    <motion.div
      lang="en"
      className="min-h-dvh w-full bg-[var(--background)] flex flex-col items-center justify-center transition-colors duration-300"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex items-baseline justify-center">
        <span className="text-[clamp(104px,21vw,240px)] leading-[0.82] font-extralight tracking-[-0.06em] tabular-nums">
          {hh}:{mm}
        </span>
      </div>
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="label mt-8"
      >
        It&apos;s five o&apos;clock somewhere
      </motion.p>
    </motion.div>
  );
}
