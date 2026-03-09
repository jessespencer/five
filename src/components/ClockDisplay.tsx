"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

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

function pickPhrase(): string {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

interface ClockDisplayProps {
  hours: number;
  minutes: number;
  seconds: number;
  city: string;
  country: string;
  isTransitioning: boolean;
}

export default function ClockDisplay({
  hours,
  minutes,
  seconds,
  city,
  country,
  isTransitioning,
}: ClockDisplayProps) {
  const hh = hours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");
  const ss = seconds.toString().padStart(2, "0");

  const [phrase] = useState(() => pickPhrase());

  return (
    <motion.div
      className="flex flex-col gap-8"
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-[96px] xl:text-[120px] leading-none font-thin tracking-tighter tabular-nums">
          {hh}:{mm}
        </span>
        <span className="text-[48px] xl:text-[60px] leading-none font-thin tracking-tighter tabular-nums opacity-40">
          :{ss}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm tracking-wider opacity-50">{phrase}</span>
        <div className="flex items-center gap-2">
          <MapPin size={16} strokeWidth={1.5} className="opacity-40" />
          <span className="text-xl font-bold tracking-tight">{city}</span>
          <span className="text-xl font-light opacity-30 -ml-1">{country}</span>
        </div>
      </div>
    </motion.div>
  );
}
