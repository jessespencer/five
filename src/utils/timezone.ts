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

  // Sort: active city first, then cities approaching 5 PM (hours < 17,
  // descending so closest-to-5 is next), then cities past 5 PM (hours > 17,
  // ascending so just-past is last before the far-past ones).
  const activeCity = fiveMatch!.location.city;

  const sorted = [...allLocations].sort((a, b) => {
    const aIsActive = a.location.city === activeCity ? 1 : 0;
    const bIsActive = b.location.city === activeCity ? 1 : 0;
    if (aIsActive !== bIsActive) return bIsActive - aIsActive; // active first

    const aIsPast = a.hours > 17 ? 1 : 0;
    const bIsPast = b.hours > 17 ? 1 : 0;
    if (aIsPast !== bIsPast) return aIsPast - bIsPast; // approaching before past

    if (!aIsPast) {
      // Both approaching 5 PM — closest to 17 first (descending hours, then minutes)
      return b.hours * 60 + b.minutes - (a.hours * 60 + a.minutes);
    }
    // Both past 5 PM — just past 5 first (ascending)
    return a.hours * 60 + a.minutes - (b.hours * 60 + b.minutes);
  });

  return { location, drink, hours, minutes, seconds, allLocations: sorted };
}
