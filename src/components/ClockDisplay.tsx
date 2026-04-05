"use client";

import { useState } from "react";

export const PHRASES_NOW = [
  "They're pouring in...",
  "Cheers from...",
  "Happy hour has hit in...",
  "Last call's still far away in...",
  "It's past five in...",
  "Glasses up in...",
  "Drinks are flowing in...",
  "Clocked out in...",
];

export const PHRASES_CLOSE = [
  "Almost time in...",
  "Not long now in...",
  "The countdown is on in...",
  "Eyes on the clock in...",
];

export const PHRASES_AFTERNOON = [
  "Still on the clock in...",
  "A few more hours in...",
  "Not quite yet in...",
  "Keep an eye on the time in...",
  "The afternoon drags on in...",
];

export const PHRASES_MORNING = [
  "Coffee first in...",
  "Just woke up in...",
  "Still getting going in...",
  "Not even noon yet in...",
  "Long day ahead in...",
];

export const PHRASES_LATE_NIGHT = [
  "Last call's coming up in...",
  "One too many in...",
  "They're not done yet in...",
  "Closing time's approaching in...",
  "Probably should've stopped in...",
  "Still at the bar in...",
];

export const PHRASES_DEAD_NIGHT = [
  "Go to bed in...",
  "Might have a problem in...",
  "Still up?! It's late in...",
  "Someone call a cab in...",
  "This is a cry for help in...",
  "Sleep it off in...",
];

export const PHRASES_EVENING = [
  "They started without you in...",
  "Second round's up in...",
  "The party's ramping up in...",
  "Already a few rounds deep in...",
  "You're late to the party in...",
  "They're just getting started in...",
];

export function getPhrasesForHoursUntilFive(hoursUntil: number): string[] {
  if (hoursUntil <= 0) return PHRASES_NOW;
  if (hoursUntil <= 2) return PHRASES_CLOSE;
  if (hoursUntil <= 6) return PHRASES_AFTERNOON;
  if (hoursUntil <= 11) return PHRASES_MORNING;
  if (hoursUntil <= 14) return PHRASES_DEAD_NIGHT;   // 3-5 AM
  if (hoursUntil <= 18) return PHRASES_LATE_NIGHT;    // 11 PM - 2 AM
  return PHRASES_EVENING;                              // 6-10 PM
}

export type ConfettiConfig = {
  strength: number;
  mode: "full" | "dual" | "single" | "pop";
  duration: number;
};

export function getConfettiConfig(hoursUntil: number): ConfettiConfig {
  if (hoursUntil === 0) return { strength: 1.0, mode: "full", duration: 2.0 };
  if (hoursUntil <= 2) return { strength: 0.6, mode: "single", duration: 0.7 };
  if (hoursUntil <= 5) return { strength: 0.3, mode: "single", duration: 0.5 };
  if (hoursUntil <= 14) return { strength: 0.05, mode: "pop", duration: 0 };
  if (hoursUntil <= 18) return { strength: 0.5, mode: "dual", duration: 0.8 };
  return { strength: 0.6, mode: "dual", duration: 0.9 };
}

export function ClockTagline({ hoursUntilFive = 0 }: { hoursUntilFive?: number }) {
  const phrases = getPhrasesForHoursUntilFive(hoursUntilFive);
  const [phrase] = useState(
    () => phrases[Math.floor(Math.random() * phrases.length)]
  );
  return <span className="text-xs tracking-wide opacity-40">{phrase}</span>;
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
