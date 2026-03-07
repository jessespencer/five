"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getFiveOClockData, type FiveOClockResult } from "@/utils/timezone";

export function useFiveOClock() {
  const [result, setResult] = useState<FiveOClockResult | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevCityRef = useRef<string | null>(null);

  const update = useCallback(() => {
    const data = getFiveOClockData();

    if (prevCityRef.current && prevCityRef.current !== data.location.city) {
      setIsTransitioning(true);
      setTimeout(() => {
        setResult(data);
        prevCityRef.current = data.location.city;
        setIsTransitioning(false);
      }, 300);
    } else {
      setResult(data);
      prevCityRef.current = data.location.city;
    }
  }, []);

  useEffect(() => {
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [update]);

  return { result, isTransitioning };
}
