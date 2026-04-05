"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const DURATION_MS = 2000;
const START_MINUTES = 60; // 1:00 PM
const TARGET_TOTAL_MINUTES = 300; // 5:00 PM

// easeOutExpo — same feel as countUp.js
function easeOutExpo(t: number, b: number, c: number, d: number): number {
  return t === d ? b + c : c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024 / 1023 + b;
}

interface LoadingClockProps {
  is24h: boolean;
  onComplete: () => void;
}

export default function LoadingClock({ is24h, onComplete }: LoadingClockProps) {
  const [totalMinutes, setTotalMinutes] = useState(START_MINUTES);
  const startRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const [counted, setCounted] = useState(false);

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
        setCounted(true);
        setTimeout(onComplete, 1100);
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
    <motion.div
      lang="en"
      className="min-h-dvh w-full bg-[var(--background)] flex flex-col items-center justify-center transition-colors duration-300"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
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
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-2xl font-light tracking-tight mt-4"
      >
        It&apos;s <span className="font-black">Five</span> o&apos;clock somewhere
      </motion.p>
    </motion.div>
  );
}
