#!/usr/bin/env node
/**
 * Verifies that src/data/locations.ts covers the world's time zones, and that
 * the 5 o'clock logic in src/utils/timezone.ts holds up across a whole year.
 *
 *   npm run verify:timezones                 # current year
 *   npm run verify:timezones -- --year=2027  # a specific year
 *   npm run verify:timezones -- --step=5     # finer app sweep (minutes; slower)
 *
 * Checks
 *   1. Data integrity — valid IANA zones, declared utcOffset matches the zone's
 *      standard offset, coordinates sane, every city has a drink (and vice versa).
 *   2. Offset coverage — hour by hour through the year, every UTC offset used by
 *      any IANA zone has at least one location at that live offset (DST aware).
 *   3. App behavior — runs the real getFiveOClockData() through the year: one
 *      contiguous "Now" group at the top, the active city first and the most
 *      recent to turn five, every city listed exactly once; reports any time
 *      no city is in the 5 PM hour (fallback mode).
 *   4. Reference table — each offset, our city, and the IANA zones that share
 *      it, so a human can judge whether the representative city is the best one.
 *
 * Exits 1 if any error is found. Warnings and notes don't fail the run.
 * Requires Node 22.18+ (imports the app's .ts files directly via type stripping).
 */
import { register } from "node:module";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 18)) {
  console.error(`verify-timezones needs Node 22.18+ (found ${process.versions.node}).`);
  process.exit(2);
}
register("./alias-hooks.mjs", import.meta.url);

// ── Args ────────────────────────────────────────────────────────────────────
const arg = (name, fallback) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=")[1] : fallback;
};
const YEAR = Number(arg("year", new Date().getUTCFullYear()));
// Odd default so samples land on many different minutes of the hour.
const STEP_MIN = Number(arg("step", 37));

const { locations } = await import("../src/data/locations.ts");
const { drinks } = await import("../src/data/drinks.ts");
const { getFiveOClockData } = await import("../src/utils/timezone.ts");

// ── Helpers ─────────────────────────────────────────────────────────────────
const HOUR = 3600e3;
const yearStart = Date.UTC(YEAR, 0, 1);
const yearEnd = Date.UTC(YEAR + 1, 0, 1);

const fmtCache = new Map();
/** Live UTC offset of a zone at an instant, in minutes. Throws on invalid zones. */
function offsetMinutes(tz, ms) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "longOffset" });
    fmtCache.set(tz, f);
  }
  const name = f.formatToParts(ms).find((p) => p.type === "timeZoneName").value;
  if (name === "GMT") return 0;
  const m = /^GMT([+-])(\d{2}):(\d{2})$/.exec(name);
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

const pad = (n) => String(n).padStart(2, "0");
function fmtOffset(min) {
  const a = Math.abs(min);
  return `UTC${min < 0 ? "−" : "+"}${pad(Math.floor(a / 60))}:${pad(a % 60)}`;
}
const day = (ms) => new Date(ms).toISOString().slice(0, 10);
const stamp = (ms) => new Date(ms).toISOString().slice(0, 16).replace("T", " ") + "Z";

/** Collapse sorted sample times into [start, end] runs (gap > step+1min splits). */
function runs(times, stepMs) {
  const out = [];
  for (const t of times) {
    const last = out[out.length - 1];
    if (last && t - last[1] <= stepMs + 60e3) last[1] = t;
    else out.push([t, t]);
  }
  return out;
}

const errors = [];
const warnings = [];
const notes = [];
const section = (title) => console.log(`\n\x1b[1m${title}\x1b[0m`);

// Every IANA zone this runtime knows (canonical names only).
const ianaZones = Intl.supportedValuesOf("timeZone");

// Year profile per zone: standard (lowest) offset and every offset it uses.
const zoneProfile = new Map();
for (const tz of [...ianaZones, ...locations.map((l) => l.timezone)]) {
  if (zoneProfile.has(tz)) continue;
  try {
    const seen = new Set();
    for (let t = yearStart; t < yearEnd; t += 24 * HOUR) seen.add(offsetMinutes(tz, t + 12 * HOUR));
    zoneProfile.set(tz, { standard: Math.min(...seen), offsets: seen });
  } catch {
    zoneProfile.set(tz, null);
  }
}

console.log(`Five · time zone verification · ${YEAR}`);
console.log(`${locations.length} locations · ${ianaZones.length} IANA zones (Node ${process.versions.node}, ICU ${process.versions.icu}, tz ${process.versions.tz ?? "?"})`);

// ── 1. Data integrity ───────────────────────────────────────────────────────
section("1. Data integrity");
{
  const seenCities = new Set();
  for (const loc of locations) {
    const where = `${loc.city} (${loc.timezone})`;
    if (seenCities.has(loc.city)) errors.push(`Duplicate city: ${loc.city}`);
    seenCities.add(loc.city);

    const profile = zoneProfile.get(loc.timezone);
    if (!profile) {
      errors.push(`${where}: not a valid IANA time zone`);
      continue;
    }
    const declared = Math.round(loc.utcOffset * 60);
    if (declared !== profile.standard) {
      errors.push(`${where}: utcOffset ${fmtOffset(declared)} but the zone's standard offset is ${fmtOffset(profile.standard)}`);
    }
    if (Math.abs(loc.latitude) > 90 || Math.abs(loc.longitude) > 180) {
      errors.push(`${where}: coordinates out of range (${loc.latitude}, ${loc.longitude})`);
    }
    // Sanity: the map plots by longitude, so a city far from its zone's solar
    // longitude is worth a second look (some are legitimately offset).
    const solar = (loc.longitude / 15) * 60;
    const drift = ((((profile.standard - solar) % 1440) + 1440 + 720) % 1440) - 720;
    if (Math.abs(drift) > 150) {
      warnings.push(`${where}: longitude ${loc.longitude} is ${(drift / 60).toFixed(1)}h from its zone's offset — check coordinates`);
    }

    const drink = drinks[loc.city];
    if (!drink) errors.push(`${loc.city}: no drink in drinks.ts (would show the "Local Brew" fallback)`);
    else if (drink.city !== loc.city) errors.push(`${loc.city}: drink entry says city "${drink.city}"`);
  }
  for (const key of Object.keys(drinks)) {
    if (!seenCities.has(key)) warnings.push(`drinks.ts has "${key}" but no location uses it`);
  }
  const integrityErrors = errors.length;
  console.log(integrityErrors ? `  ✗ ${integrityErrors} problem(s)` : "  ✓ zones valid, offsets match, coordinates sane, drinks matched");
}

// ── 2. Offset coverage across the year ──────────────────────────────────────
section("2. Offset coverage (hourly, all IANA zones, DST aware)");
{
  const gaps = new Map(); // offset -> { times: [], zones: Set }
  const orphanOurs = new Map(); // offset -> Set(city) used by us but by no IANA zone
  let samples = 0;
  const realZones = ianaZones.filter((z) => zoneProfile.get(z));
  for (let t = yearStart; t < yearEnd; t += HOUR) {
    samples++;
    const world = new Map();
    for (const z of realZones) {
      const o = offsetMinutes(z, t);
      if (!world.has(o)) world.set(o, []);
      world.get(o).push(z);
    }
    const ours = new Map();
    for (const l of locations) {
      const o = offsetMinutes(l.timezone, t);
      if (!ours.has(o)) ours.set(o, []);
      ours.get(o).push(l.city);
    }
    for (const [o, zones] of world) {
      if (ours.has(o)) continue;
      if (!gaps.has(o)) gaps.set(o, { times: [], zones: new Set() });
      const g = gaps.get(o);
      g.times.push(t);
      zones.forEach((z) => g.zones.add(z));
    }
    for (const [o, cities] of ours) {
      if (world.has(o)) continue;
      if (!orphanOurs.has(o)) orphanOurs.set(o, new Set());
      cities.forEach((c) => orphanOurs.get(o).add(c));
    }
  }

  // A gap only matters to the app if, during it, that offset's local clock
  // passes through 17:00–17:59. Gaps that don't (e.g. the hour between two
  // zones' DST switches, which happens around 2 AM local) are reported as notes.
  const touchesFivePm = (t, o) => {
    const startLocal = (((t / 60e3 + o) % 1440) + 1440) % 1440;
    const overlap = (a) => a < 1080 && a + 60 > 1020;
    return overlap(startLocal) || overlap(startLocal - 1440);
  };

  if (gaps.size === 0) {
    console.log(`  ✓ every offset in use was covered at all ${samples} hourly samples`);
  } else {
    for (const [o, g] of [...gaps].sort((a, b) => a[0] - b[0])) {
      const spans = runs(g.times, HOUR).map(([a, b]) => (a === b ? stamp(a) : day(a) === day(b) ? day(a) : `${day(a)} → ${day(b)}`));
      const at5 = g.times.filter((t) => touchesFivePm(t, o));
      const zones = [...g.zones].slice(0, 6).join(", ");
      if (at5.length) {
        const msg = `${fmtOffset(o)} has no location for ${g.times.length}h of the year (${spans.slice(0, 3).join(", ")}${spans.length > 3 ? ", …" : ""}), including ${at5.length}h at 5 PM local. Zones: ${zones}`;
        errors.push(msg);
        console.log(`  ✗ ${msg}`);
      } else {
        const msg = `${fmtOffset(o)} uncovered ${g.times.length}h (${spans.slice(0, 3).join(", ")}) — never during 5 PM local, so the app is unaffected. Zones: ${zones}`;
        notes.push(msg);
        console.log(`  · ${msg}`);
      }
    }
    if (!errors.some((e) => e.includes("at 5 PM local"))) {
      console.log(`  ✓ no gap ever falls in an offset's 5 PM hour`);
    }
  }
  for (const [o, cities] of orphanOurs) {
    const msg = `${fmtOffset(o)} (${[...cities].join(", ")}) is used by no populated IANA zone`;
    notes.push(msg);
    console.log(`  · ${msg}`);
  }
}

// ── 3. App behavior through the year ────────────────────────────────────────
section(`3. getFiveOClockData() every ${STEP_MIN} min through ${YEAR}`);
{
  const RealDate = globalThis.Date;
  const stepMs = STEP_MIN * 60e3;
  const fallbackTimes = [];
  const failures = [];
  let samples = 0;
  for (let t = yearStart; t < yearEnd; t += stepMs) {
    samples++;
    globalThis.Date = class extends RealDate {
      constructor(...a) { super(...(a.length ? a : [t])); }
      static now() { return t; }
    };
    const r = getFiveOClockData();
    const list = r.allLocations;
    const fives = list.filter((l) => l.isFiveOClock);
    const problems = [];

    if (list.length !== locations.length || new Set(list.map((l) => l.location.city)).size !== list.length) {
      problems.push("list doesn't contain every city exactly once");
    }
    if (list[0].location.city !== r.location.city) problems.push(`active ${r.location.city} isn't first`);
    if (fives.length) {
      const groups = list.filter((l, i) => l.isFiveOClock && (i === 0 || !list[i - 1].isFiveOClock)).length;
      if (groups !== 1 || !list[0].isFiveOClock) problems.push(`${groups} "Now" groups`);
      if (r.isFallback || r.hours !== 17) problems.push("active city isn't at 5 PM");
      if (r.minutes !== Math.min(...fives.map((l) => l.minutes))) problems.push("active city isn't the most recent to turn five");
    } else {
      fallbackTimes.push(t);
      if (!r.isFallback) problems.push("no city at 5 PM but isFallback is false");
    }
    if (problems.length) failures.push(`${stamp(t)}: ${problems.join("; ")}`);
  }
  globalThis.Date = RealDate;

  if (failures.length) {
    failures.slice(0, 10).forEach((f) => console.log(`  ✗ ${f}`));
    if (failures.length > 10) console.log(`  … and ${failures.length - 10} more`);
    errors.push(`${failures.length} moment(s) broke a list invariant`);
  } else {
    console.log(`  ✓ ${samples} moments: one "Now" group, active city first and freshest, every city listed once`);
  }
  if (fallbackTimes.length) {
    const spans = runs(fallbackTimes, stepMs);
    const msg = `No city in the 5 PM hour at ${fallbackTimes.length} sampled moment(s), e.g. ${spans.slice(0, 3).map(([a]) => stamp(a)).join(", ")} (app falls back to the closest city)`;
    warnings.push(msg);
    console.log(`  ! ${msg}`);
  } else {
    console.log("  ✓ some city is always in the 5 PM hour (fallback never needed)");
  }
}

// ── 4. Reference table ──────────────────────────────────────────────────────
section("4. Representative city per standard offset");
{
  const byStandard = new Map();
  for (const z of ianaZones) {
    const p = zoneProfile.get(z);
    if (!p) continue;
    if (!byStandard.has(p.standard)) byStandard.set(p.standard, []);
    byStandard.get(p.standard).push(z);
  }
  const oursByStandard = new Map();
  for (const l of locations) {
    const s = zoneProfile.get(l.timezone)?.standard;
    if (s === undefined) continue;
    if (!oursByStandard.has(s)) oursByStandard.set(s, []);
    oursByStandard.get(s).push(l.city);
  }
  const all = [...new Set([...byStandard.keys(), ...oursByStandard.keys()])].sort((a, b) => a - b);
  for (const o of all) {
    const zones = byStandard.get(o) ?? [];
    const ours = oursByStandard.get(o);
    const examples = zones.slice(0, 5).map((z) => z.split("/").pop().replace(/_/g, " ")).join(", ");
    const label = ours ? ours.join(" + ") : "\x1b[31m— none —\x1b[0m";
    console.log(`  ${fmtOffset(o).padEnd(10)} ${label.padEnd(30)} ${String(zones.length).padStart(3)} zones  ${examples}${zones.length > 5 ? ", …" : ""}`);
  }
}

// ── Summary ─────────────────────────────────────────────────────────────────
section("Summary");
warnings.forEach((w) => console.log(`  ! ${w}`));
notes.forEach((n) => console.log(`  · ${n}`));
errors.forEach((e) => console.log(`  ✗ ${e}`));
console.log(
  errors.length
    ? `\n✗ ${errors.length} error(s), ${warnings.length} warning(s)`
    : `\n✓ All checks passed (${warnings.length} warning(s))`,
);
process.exit(errors.length ? 1 : 0);
