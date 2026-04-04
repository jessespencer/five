import { locations, type Location } from "@/data/locations";
import { drinks, type Drink } from "@/data/drinks";

export interface LocationTime {
  location: Location;
  hours: number;
  minutes: number;
  seconds: number;
  isFiveOClock: boolean;
  liveUtcOffset: number;
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

/** Compute the current UTC offset (in hours) for a timezone, accounting for DST. */
function getLiveUtcOffset(timezone: string, now: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parseInt(parts.find((p) => p.type === type)!.value, 10);

  const year = get("year");
  const month = get("month");
  const day = get("day");
  let hour = get("hour");
  if (hour === 24) hour = 0;
  const minute = get("minute");
  const second = get("second");

  // Build a UTC timestamp for the same wall-clock reading
  const utcEquiv = Date.UTC(year, month - 1, day, hour, minute, second);
  const diffMs = utcEquiv - now.getTime();
  // Round to nearest 15 minutes to handle quarter-hour offsets cleanly
  const diffMinutes = Math.round(diffMs / 60000 / 15) * 15;
  return diffMinutes / 60;
}

const fallbackDrink: Drink = {
  name: "Local Brew",
  city: "",
  type: "spirit",
  tagline: "Drink like a local",
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
    const liveUtcOffset = getLiveUtcOffset(location.timezone, now);
    const isFiveOClock = hours === 17;
    const entry: LocationTime = { location, hours, minutes, seconds, isFiveOClock, liveUtcOffset };
    allLocations.push(entry);
    if (isFiveOClock && !fiveMatch) {
      fiveMatch = entry;
    }
  }

  // Fallback: no city is exactly at 17:xx right now.
  // Pick the city that most recently passed 5 PM (hour 18, lowest minutes first)
  // so we don't jump ahead to a city that hasn't hit 5 yet.
  if (!fiveMatch) {
    let bestEntry: LocationTime | null = null;
    let bestDist = Infinity;
    for (const entry of allLocations) {
      // How many minutes ago was 17:00 in this timezone? (only consider cities past 5 PM)
      const minsSince = (entry.hours - 17) * 60 + entry.minutes;
      if (minsSince > 0 && minsSince < bestDist) {
        bestDist = minsSince;
        bestEntry = entry;
      }
    }
    fiveMatch = bestEntry ?? allLocations[0];
  }

  const { location, hours, minutes, seconds } = fiveMatch!;
  const drink = drinks[location.city] || { ...fallbackDrink, city: location.city };

  // Sort by continuous westward progression from the active city.
  // Each next city is ~1 hour behind, wrapping through midnight.
  // This gives a smooth, unbroken time sequence down the list.
  const fiveOffset = fiveMatch!.liveUtcOffset;

  const sorted = [...allLocations].sort((a, b) => {
    const distA = ((fiveOffset - a.liveUtcOffset) % 24 + 24) % 24;
    const distB = ((fiveOffset - b.liveUtcOffset) % 24 + 24) % 24;
    return distA - distB;
  });

  return { location, drink, hours, minutes, seconds, allLocations: sorted };
}
