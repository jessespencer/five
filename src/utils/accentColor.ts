type HSL = [number, number, number];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360;
  return [
    Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, hNorm) * 255),
    Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  ];
}

function hexToHsl(hex: string): HSL {
  return rgbToHsl(...hexToRgb(hex));
}

function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(...hslToRgb(h, s, l));
}

function lerpHsl(a: HSL, b: HSL, t: number): HSL {
  // Shortest-arc hue interpolation
  let dh = b[0] - a[0];
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const h = a[0] + dh * t;
  const s = a[1] + (b[1] - a[1]) * t;
  const l = a[2] + (b[2] - a[2]) * t;
  return [h, s, l];
}

const COLOR_STOPS: [number, string][] = [
  [0,  "#1B2240"],  // midnight — deep navy
  [2,  "#1A2E3D"],  // dark teal-navy
  [4,  "#1E3A3A"],  // dark ocean teal
  [6,  "#3A6B5C"],  // dawn — muted teal-green
  [8,  "#6B8F5E"],  // morning — sage green
  [10, "#8B8840"],  // late morning — warm olive
  [12, "#B87040"],  // noon — soft terracotta
  [14, "#D4923A"],  // afternoon — warm amber
  [16, "#E0B030"],  // approaching golden hour
  [17, "#E8C547"],  // 5 o'clock — hero golden amber
  [18, "#D97B3A"],  // sunset — burnt orange
  [19, "#C45060"],  // dusk — coral rose
  [20, "#A04080"],  // evening — rose pink
  [21, "#7B3090"],  // twilight — mauve purple
  [22, "#4D2878"],  // night — deep violet
  [23, "#302060"],  // late night — dark indigo-violet
  [24, "#1B2240"],  // wraps to midnight
];

const HSL_STOPS: [number, HSL][] = COLOR_STOPS.map(([hour, hex]) => [
  hour,
  hexToHsl(hex),
]);

export function getAccentForHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;

  for (let i = 0; i < HSL_STOPS.length - 1; i++) {
    const [h0, hsl0] = HSL_STOPS[i];
    const [h1, hsl1] = HSL_STOPS[i + 1];
    if (h >= h0 && h <= h1) {
      const t = h0 === h1 ? 0 : (h - h0) / (h1 - h0);
      const [hue, sat, lit] = lerpHsl(hsl0, hsl1, t);
      return hslToHex(hue, sat, lit);
    }
  }

  return COLOR_STOPS[0][1];
}

export function getTextColorForAccent(hex: string): "#000" | "#fff" {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? "#000" : "#fff";
}
