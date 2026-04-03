"use client";

import { useState } from "react";

const PHRASES = [
  "They're pouring in...",
  "Cheers from...",
  "Happy hour has hit in...",
  "Last call's still far away in...",
  "It's past five in...",
  "Glasses up in...",
  "Drinks are flowing in...",
  "Clocked out in...",
];

export function ClockTagline() {
  const [phrase] = useState(
    () => PHRASES[Math.floor(Math.random() * PHRASES.length)]
  );
  return <span className="text-xs tracking-wide opacity-50">{phrase}</span>;
}

interface ClockDisplayProps {
  hours: number;
  minutes: number;
  seconds: number;
  is24h: boolean;
}

export default function ClockDisplay({
  hours,
  minutes,
  seconds,
  is24h,
}: ClockDisplayProps) {
  const displayHours = is24h ? hours : hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const hh = displayHours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  return (
    <div className="flex items-baseline gap-1" aria-live="polite" aria-atomic="true" role="timer">
      <span className="text-[96px] xl:text-[120px] leading-none font-thin tracking-tighter tabular-nums">
        {hh}:{mm}
      </span>
      <span className="text-[48px] xl:text-[60px] leading-none font-thin tracking-tighter tabular-nums opacity-40">
        :{ss}
      </span>
      {!is24h && (
        <span className="text-[24px] xl:text-[30px] leading-none font-light tracking-tight opacity-40 ml-2">
          {ampm}
        </span>
      )}
    </div>
  );
}
