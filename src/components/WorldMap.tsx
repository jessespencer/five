"use client";

import { motion } from "framer-motion";
import type { LocationTime } from "@/utils/timezone";

interface WorldMapProps {
  allLocations: LocationTime[];
  activeCity: string;
  activeLongitude: number;
}

// Simplified continent SVG paths (equirectangular projection, viewBox 0 0 1000 500)
// x = (lon + 180) / 360 * 1000, y = (90 - lat) / 180 * 500
const continents = [
  // North America
  "M 42,69 L 64,53 L 153,56 L 200,60 L 280,58 L 320,72 L 347,119 L 314,125 L 300,140 L 278,172 L 260,167 L 240,178 L 222,194 L 256,192 L 264,217 L 250,225 L 222,203 L 194,186 L 172,156 L 161,118 L 153,97 L 100,83 L 80,97 L 42,69 Z",
  // Greenland
  "M 347,39 L 389,33 L 420,36 L 439,53 L 420,72 L 380,83 L 361,72 L 347,39 Z",
  // South America
  "M 278,225 L 300,219 L 340,228 L 370,236 L 403,258 L 400,286 L 386,314 L 360,353 L 330,386 L 311,403 L 300,419 L 292,397 L 283,364 L 270,325 L 260,281 L 264,250 L 278,225 Z",
  // Europe
  "M 475,142 L 486,125 L 489,108 L 492,100 L 500,92 L 514,86 L 528,78 L 550,72 L 572,69 L 589,75 L 600,83 L 611,94 L 600,108 L 594,125 L 589,136 L 575,142 L 564,147 L 550,142 L 536,136 L 528,139 L 517,142 L 503,144 L 489,147 L 475,142 Z",
  // British Isles
  "M 486,100 L 492,92 L 497,94 L 494,103 L 489,108 L 486,100 Z",
  // Africa
  "M 472,156 L 483,153 L 503,147 L 528,147 L 550,147 L 569,150 L 589,164 L 597,178 L 603,194 L 625,217 L 636,228 L 622,247 L 611,253 L 608,269 L 600,297 L 589,314 L 572,333 L 556,344 L 547,339 L 536,319 L 528,300 L 531,275 L 519,256 L 508,236 L 497,222 L 481,214 L 464,208 L 453,203 L 461,186 L 469,172 L 472,156 Z",
  // Madagascar
  "M 614,322 L 619,314 L 622,325 L 619,339 L 614,336 L 614,322 Z",
  // Asia (mainland)
  "M 611,94 L 628,83 L 653,75 L 694,64 L 750,58 L 806,56 L 861,56 L 917,64 L 944,78 L 944,89 L 933,100 L 914,111 L 903,125 L 892,131 L 889,142 L 886,150 L 867,153 L 858,156 L 847,158 L 836,164 L 836,175 L 833,186 L 831,197 L 828,206 L 819,214 L 811,222 L 803,231 L 794,239 L 786,247 L 778,244 L 775,233 L 775,222 L 778,214 L 783,203 L 772,200 L 764,194 L 756,192 L 747,189 L 739,194 L 731,208 L 722,219 L 714,228 L 706,222 L 700,208 L 694,197 L 686,186 L 678,178 L 669,172 L 661,164 L 644,158 L 631,153 L 619,147 L 611,136 L 608,119 L 611,100 L 611,94 Z",
  // Japan
  "M 886,131 L 892,125 L 897,131 L 894,144 L 889,153 L 883,150 L 886,139 L 886,131 Z",
  // Indonesia / Philippines
  "M 808,256 L 819,253 L 836,256 L 858,258 L 875,261 L 883,267 L 875,272 L 858,275 L 836,275 L 819,272 L 808,264 L 808,256 Z",
  // Sri Lanka
  "M 722,231 L 728,228 L 731,236 L 725,239 L 722,231 Z",
  // Australia
  "M 819,303 L 842,292 L 867,289 L 892,289 L 917,292 L 928,303 L 931,319 L 925,333 L 914,344 L 897,350 L 883,350 L 864,347 L 847,344 L 833,339 L 822,328 L 819,314 L 819,303 Z",
  // Tasmania
  "M 917,356 L 922,353 L 925,358 L 919,361 L 917,356 Z",
  // New Zealand
  "M 975,344 L 981,339 L 986,344 L 983,356 L 978,353 L 975,344 Z M 972,358 L 978,356 L 981,364 L 978,375 L 972,369 L 972,358 Z",
];

function lonToX(lon: number): number {
  return ((lon + 180) / 360) * 1000;
}
function latToY(lat: number): number {
  return ((90 - lat) / 180) * 500;
}

export default function WorldMap({
  allLocations,
  activeCity,
  activeLongitude,
}: WorldMapProps) {
  const lineX = lonToX(activeLongitude);

  return (
    <div className="relative w-full aspect-[2/1] max-h-[280px]">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern
            id="dotPattern"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="7"
              cy="7"
              r="2.5"
              className="fill-[var(--foreground)]"
              opacity="0.12"
            />
          </pattern>
          <pattern
            id="dotPatternActive"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="7"
              cy="7"
              r="2.5"
              className="fill-[var(--foreground)]"
              opacity="0.35"
            />
          </pattern>
        </defs>

        {/* Continents */}
        {continents.map((d, i) => (
          <path key={i} d={d} fill="url(#dotPattern)" stroke="none" />
        ))}

        {/* Timezone highlight band */}
        <rect
          x={lineX - 20}
          y={0}
          width={40}
          height={500}
          className="fill-[var(--foreground)]"
          opacity={0.04}
        />

        {/* Timezone line */}
        <motion.line
          x1={lineX}
          y1={0}
          x2={lineX}
          y2={500}
          className="stroke-[var(--foreground)]"
          strokeWidth={1.5}
          opacity={0.2}
          strokeDasharray="6 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 0.6 }}
        />

        {/* City dots */}
        {allLocations.map(({ location, isFiveOClock }) => {
          const cx = lonToX(location.longitude);
          const cy = latToY(location.latitude);
          const isActive = location.city === activeCity;
          return (
            <g key={location.city}>
              {isActive && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r={12}
                  className="fill-[var(--foreground)]"
                  opacity={0.08}
                  initial={{ r: 6 }}
                  animate={{ r: 12 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isActive ? 5 : isFiveOClock ? 4 : 3}
                className="fill-[var(--foreground)]"
                opacity={isActive ? 0.9 : 0.2}
              />
            </g>
          );
        })}

        {/* Active city label */}
        {allLocations
          .filter(({ location }) => location.city === activeCity)
          .map(({ location }) => {
            const cx = lonToX(location.longitude);
            const cy = latToY(location.latitude);
            return (
              <text
                key="label"
                x={cx}
                y={cy - 18}
                textAnchor="middle"
                className="fill-[var(--foreground)] text-[13px] font-semibold"
                opacity={0.7}
              >
                {location.city}
              </text>
            );
          })}
      </svg>
    </div>
  );
}
