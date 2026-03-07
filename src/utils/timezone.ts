import { locations, type Location } from "@/data/locations";
import { drinks, type Drink } from "@/data/drinks";

export interface LocationTime {
  location: Location;
  hours: number;
  minutes: number;
  seconds: number;
  isFiveOClock: boolean;
}

export interface FiveOClockResult {
  location: Location;
  drink: Drink;
  hours: number;
  minutes: number;
  seconds: number;
  allLocations: LocationTime[];
}

function getCurrentTimeInZone(
  timezone: string,
  now: Date
): { hours: number; minutes: number; seconds: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const hours = parseInt(parts.find((p) => p.type === "hour")!.value, 10);
  const minutes = parseInt(parts.find((p) => p.type === "minute")!.value, 10);
  const seconds = parseInt(parts.find((p) => p.type === "second")!.value, 10);

  return { hours: hours === 24 ? 0 : hours, minutes, seconds };
}

const fallbackDrink: Drink = {
  name: "Local Brew",
  city: "",
  type: "spirit",
  tagline: "Drink like a local:",
  description:
    "Ask a local for their favorite — every place has a story in a glass.",
  recipe: {
    ingredients: [{ amount: "1", item: "Sense of adventure" }],
    instructions: ["Find the nearest bar.", "Ask for the house special."],
    glass: "Whatever they hand you",
    garnish: "A good conversation",
  },
  isAlcoholic: true,
};

export function getFiveOClockData(): FiveOClockResult {
  const now = new Date();

  let fiveMatch: LocationTime | null = null;
  const allLocations: LocationTime[] = [];

  for (const location of locations) {
    const { hours, minutes, seconds } = getCurrentTimeInZone(
      location.timezone,
      now
    );
    const isFiveOClock = hours === 17;
    const entry: LocationTime = { location, hours, minutes, seconds, isFiveOClock };
    allLocations.push(entry);
    if (isFiveOClock && !fiveMatch) {
      fiveMatch = entry;
    }
  }

  // Fallback: find closest to 17:00
  if (!fiveMatch) {
    let closestDiff = Infinity;
    for (const entry of allLocations) {
      const totalMins = entry.hours * 60 + entry.minutes;
      const diff = Math.abs(totalMins - 17 * 60);
      const wrappedDiff = Math.min(diff, 24 * 60 - diff);
      if (wrappedDiff < closestDiff) {
        closestDiff = wrappedDiff;
        fiveMatch = entry;
      }
    }
  }

  const { location, hours, minutes, seconds } = fiveMatch!;
  const drink = drinks[location.city] || { ...fallbackDrink, city: location.city };

  // Sort: active city (5 PM) first, then descending — 4 PM, 3 PM, 2 PM...
  // Only include cities within a 12-hour window (17:xx down to 06:xx)
  const activeIndex = allLocations.indexOf(fiveMatch!);
  const descending = [
    allLocations[activeIndex],
    ...allLocations.slice(0, activeIndex).reverse(),
    ...allLocations.slice(activeIndex + 1).reverse(),
  ];

  const fiveTotal = fiveMatch!.hours * 60 + fiveMatch!.minutes;
  const withinWindow = descending.filter((entry) => {
    const entryTotal = entry.hours * 60 + entry.minutes;
    let diff = fiveTotal - entryTotal;
    if (diff < 0) diff += 24 * 60;
    return diff < 12 * 60;
  });

  // Deduplicate cities sharing the same hour (DST collisions).
  // Alternate which one shows based on current minute so it rotates on load.
  const seen = new Map<number, number>();
  const filtered = withinWindow.filter((entry) => {
    const h = entry.hours;
    const count = seen.get(h) ?? 0;
    seen.set(h, count + 1);
    if (count === 0) return true;
    // For duplicates, alternate: even minutes show first occurrence, odd show second
    return (minutes % 2 === 1) === (count === 1);
  });

  return { location, drink, hours, minutes, seconds, allLocations: filtered };
}
