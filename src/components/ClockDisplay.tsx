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
  mode: "full" | "dual" | "single";
  duration: number;
};

export function getConfettiConfig(hoursUntil: number): ConfettiConfig {
  if (hoursUntil === 0) return { strength: 1.0, mode: "full", duration: 2.0 };
  if (hoursUntil <= 2) return { strength: 0.8, mode: "dual", duration: 0.8 };
  if (hoursUntil <= 5) return { strength: 0.4, mode: "single", duration: 0.5 };
  if (hoursUntil <= 12) return { strength: 0.1, mode: "single", duration: 0.4 };
  if (hoursUntil <= 15) return { strength: 0.15, mode: "single", duration: 0.4 };
  if (hoursUntil <= 17) return { strength: 0.4, mode: "single", duration: 0.5 };
  return { strength: 0.8, mode: "dual", duration: 0.8 };
}

export function ClockTagline({ hoursUntilFive = 0 }: { hoursUntilFive?: number }) {
  const phrases = getPhrasesForHoursUntilFive(hoursUntilFive);
  const [phrase] = useState(
    () => phrases[Math.floor(Math.random() * phrases.length)]
  );
  return <span>{phrase}</span>;
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
  // 24h keeps the leading zero (instrument convention); 12h drops it.
  const hh = is24h ? displayHours.toString().padStart(2, "0") : displayHours.toString();
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  return (
    // No aria-live here: the clock ticks every second, which would flood screen readers.
    <div role="timer" aria-label={`${hh}:${mm}:${ss}${is24h ? "" : ` ${ampm}`}`}>
      <div className="flex items-stretch" aria-hidden="true">
        <span className="font-extralight text-[clamp(104px,22vw,296px)] leading-[0.82] tracking-[-0.06em] tabular-nums -ml-[0.05em]">
          {hh}:{mm}
        </span>
        {/* Meridiem on top, seconds at the baseline — read like a dial's sub-register. */}
        <span className="flex flex-col justify-between ml-[clamp(10px,1.6vw,20px)] pt-[clamp(8px,1.4vw,18px)] pb-[clamp(2px,0.6vw,8px)]">
          <span className="label !text-[11px] !leading-none">{is24h ? "24H" : ampm}</span>
          <span className="font-mono font-light text-[clamp(22px,3.4vw,40px)] leading-none tabular-nums text-[var(--accent)]">
            {ss}
          </span>
        </span>
      </div>
      <SecondsRule seconds={seconds} />
    </div>
  );
}

/**
 * A 60-tick scale under the clock. Elapsed seconds are drawn in ink, the
 * current second in the accent — a nod to the colored second hand on Braun clocks.
 */
function SecondsRule({ seconds }: { seconds: number }) {
  return (
    <div className="mt-6 md:mt-8 flex items-end justify-between h-3" aria-hidden="true">
      {Array.from({ length: 60 }, (_, i) => {
        const isMajor = i % 5 === 0;
        const isNow = i === seconds;
        const isPast = i < seconds;
        return (
          <span
            key={i}
            className={`block w-px transition-colors duration-300 ${isNow ? "h-3 w-[2px]" : isMajor ? "h-2.5" : "h-1.5"}`}
            style={{
              backgroundColor: isNow
                ? "var(--accent)"
                : isPast
                  ? "var(--foreground)"
                  : "var(--rule)",
              opacity: isPast && !isMajor ? 0.45 : 1,
            }}
          />
        );
      })}
    </div>
  );
}
