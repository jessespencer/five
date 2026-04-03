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

  // Sort all locations so the active city is first, then progress westward
  // (next cities to hit 5 PM), wrapping around the date line.
  const fiveOffset = fiveMatch!.location.utcOffset;

  const sorted = [...allLocations].sort((a, b) => {
    // Distance "behind" the active city (how far west / how soon until 5 PM)
    const distA = (fiveOffset - a.location.utcOffset + 24) % 24;
    const distB = (fiveOffset - b.location.utcOffset + 24) % 24;
    return distA - distB;
  });

  // Deduplicate cities sharing the same time — randomly pick one per time slot.
  // Seed on current minute so the pick stays stable for 60 seconds.
  const seen = new Map<string, boolean>();
  const deduped = sorted.filter((entry) => {
    const key = `${entry.hours}:${entry.minutes}`;
    if (seen.has(key)) return false;
    const dupes = sorted.filter((e) => `${e.hours}:${e.minutes}` === key);
    const pick = dupes[minutes % dupes.length];
    seen.set(key, true);
    return entry.location.city === pick.location.city;
  });

  return { location, drink, hours, minutes, seconds, allLocations: deduped };
}
