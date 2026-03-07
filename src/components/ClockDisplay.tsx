"use client";

import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <motion.div
      className="flex flex-col"
      animate={{ opacity: isTransitioning ? 0 : 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <p className="text-sm tracking-wider opacity-50 mb-2">it&apos;s currently</p>

      <div className="flex items-baseline gap-1">
        <span className="text-[96px] xl:text-[120px] leading-none font-thin tracking-tighter tabular-nums">
          {hh}:{mm}
        </span>
        <span className="text-[48px] xl:text-[60px] leading-none font-thin tracking-tighter tabular-nums opacity-40">
          {ss}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <MapPin size={16} strokeWidth={1.5} className="opacity-40" />
        <span className="text-xl font-bold tracking-tight leading-none">in {city}</span>
        <span className="text-sm opacity-30 leading-none">{country}</span>
      </div>
    </motion.div>
  );
}
