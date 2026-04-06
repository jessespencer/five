"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { getAccentForHour } from "@/utils/accentColor";

// Sample 8 evenly-spaced colors from the accent hue rotation
function getConfettiColors(isDark: boolean): string[] {
  return Array.from({ length: 8 }, (_, i) => {
    const hour = 17 + (i / 8) * 24;
    return getAccentForHour(hour, isDark);
  });
}

// Drink-themed SVG paths for shapeFromPath()

// Cocktail / martini glass
const COCKTAIL_PATH =
  "M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z";
const COCKTAIL_MATRIX: [number, number, number, number, number, number] = [
  0.03333333333333333, 0, 0, 0.03333333333333333, -5.566666666666666,
  -5.533333333333333,
];

// Star burst
const STAR_PATH =
  "M120 240c-41,14 -91,18 -120,1 29,-10 57,-22 81,-40 -18,2 -37,3 -55,-3 25,-14 48,-30 66,-51 -11,5 -26,8 -45,7 20,-14 40,-30 57,-49 -13,1 -26,2 -38,-1 18,-11 35,-25 51,-43 -13,3 -24,5 -35,6 21,-19 40,-41 53,-67 14,26 32,48 54,67 -11,-1 -23,-3 -35,-6 15,18 32,32 51,43 -13,3 -26,2 -38,1 17,19 36,35 56,49 -19,1 -33,-2 -45,-7 19,21 42,37 67,51 -19,6 -37,5 -56,3 25,18 53,30 82,40 -30,17 -79,13 -120,-1l0 41 -31 0 0 -41z";
const STAR_MATRIX: [number, number, number, number, number, number] = [
  0.03597122302158273, 0, 0, 0.03597122302158273, -4.856115107913669,
  -5.071942446043165,
];

// Beer/pint shape (reusing pumpkin-style rounded form)
const PINT_PATH =
  "M449.4 142c-5 0-10 .3-15 1a183 183 0 0 0-66.9-19.1V87.5a17.5 17.5 0 1 0-35 0v36.4a183 183 0 0 0-67 19c-4.9-.6-9.9-1-14.8-1C170.3 142 105 219.6 105 315s65.3 173 145.7 173c5 0 10-.3 14.8-1a184.7 184.7 0 0 0 169 0c4.9.7 9.9 1 14.9 1 80.3 0 145.6-77.6 145.6-173s-65.3-173-145.7-173zm-220 138 27.4-40.4a11.6 11.6 0 0 1 16.4-2.7l54.7 40.3a11.3 11.3 0 0 1-7 20.3H239a11.3 11.3 0 0 1-9.6-17.5zM444 383.8l-43.7 17.5a17.7 17.7 0 0 1-13 0l-37.3-15-37.2 15a17.8 17.8 0 0 1-13 0L256 383.8a17.5 17.5 0 0 1 13-32.6l37.3 15 37.2-15c4.2-1.6 8.8-1.6 13 0l37.3 15 37.2-15a17.5 17.5 0 0 1 13 32.6zm17-86.3h-82a11.3 11.3 0 0 1-6.9-20.4l54.7-40.3a11.6 11.6 0 0 1 16.4 2.8l27.4 40.4a11.3 11.3 0 0 1-9.6 17.5z";
const PINT_MATRIX: [number, number, number, number, number, number] = [
  0.020491803278688523, 0, 0, 0.020491803278688523, -7.172131147540983,
  -5.9016393442622945,
];

import type { ConfettiConfig } from "@/components/ClockDisplay";

export type ConfettiMessage =
  | { type: "five"; city: string }
  | { type: "tagline"; tagline: string; city: string; config?: ConfettiConfig };

interface ConfettiProps {
  message: ConfettiMessage;
  isDark: boolean;
  onComplete: () => void;
}

export default function Confetti({ message, isDark, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const fireComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: false,
    });

    // Create custom shapes (browser-only APIs, safe inside useEffect)
    const cocktail = confetti.shapeFromPath({
      path: COCKTAIL_PATH,
      matrix: new DOMMatrix(COCKTAIL_MATRIX),
    });
    const star = confetti.shapeFromPath({
      path: STAR_PATH,
      matrix: new DOMMatrix(STAR_MATRIX),
    });
    const pint = confetti.shapeFromPath({
      path: PINT_PATH,
      matrix: new DOMMatrix(PINT_MATRIX),
    });

    const shapes = [cocktail, star, pint];

    const colors = getConfettiColors(isDark);

    const defaults: confetti.Options = {
      scalar: 1,
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      colors,
      shapes,
      disableForReducedMotion: true,
    };

    const config: ConfettiConfig = message.type === "five"
      ? { strength: 1.0, mode: "full", duration: 3.0 }
      : (message.config ?? { strength: 1.0, mode: "full", duration: 3.0 });

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const duration = config.duration * 1000;
    const baseParticles = 50 * config.strength;
    const animationEnd = Date.now() + duration;

    // "full" mode: sustained fireworks on an interval
    // "single"/"dual": one-shot burst(s)
    if (config.mode === "full") {
      const intervalId = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(intervalId);
          setTimeout(() => fireComplete(), 1500);
          return;
        }

        const particleCount = baseParticles * (timeLeft / duration);

        myConfetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        myConfetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => {
        clearInterval(intervalId);
        myConfetti.reset();
      };
    }

    // Single burst from center
    if (config.mode === "single") {
      myConfetti({
        ...defaults,
        particleCount: baseParticles,
        origin: { x: randomInRange(0.3, 0.7), y: Math.random() - 0.2 },
      });
    }

    // Dual burst from left + right
    if (config.mode === "dual") {
      myConfetti({
        ...defaults,
        particleCount: baseParticles,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      myConfetti({
        ...defaults,
        particleCount: baseParticles,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }

    const tid = setTimeout(() => fireComplete(), duration + 1500);

    return () => {
      clearTimeout(tid);
      myConfetti.reset();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally runs once on mount; message/isDark are captured at mount time
  }, [fireComplete]);

  return (
    <div
      className="fixed inset-0 z-50 cursor-pointer"
      role="button"
      aria-label="Dismiss confetti"
      tabIndex={0}
      onClick={fireComplete}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fireComplete(); } }}
    >
      {/* Dim background */}
      <motion.div
        className="absolute inset-0 bg-[var(--background)]/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />
      {/* Text centered within the left content column (excluding sidebar) */}
      <div className="absolute inset-0 lg:right-[260px] flex items-center justify-center overflow-hidden">
        <motion.div
          className="text-center px-6 text-[var(--foreground)]"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {message.type === "five" ? (
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight">
              It&apos;s <span className="font-black">Five</span> in {message.city}
            </h2>
          ) : (
            <>
              <p className="text-lg md:text-xl lg:text-2xl font-light tracking-tight opacity-60 mb-2">
                {message.tagline}
              </p>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight">
                {message.city}
              </h2>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
