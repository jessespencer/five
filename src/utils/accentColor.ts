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

function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(...hslToRgb(h, s, l));
}

// Starting hue — our classic amber/orange (#D97B3A ≈ 25°)
const START_HUE = 25;

export function getAccentForHour(hour: number, isDark = true): string {
  // hour is spread from 17..41, so normalize 0..1 across the full cycle
  const t = ((hour - 17) % 24 + 24) % 24 / 24;
  const hue = (START_HUE + t * 360) % 360;

  // Blend from vibrant hero at t=0 to muted pastels, ramping back near t=1
  // Uses a sine curve so both ends (near the hero) stay warm/vibrant
  const blend = Math.sin(t * Math.PI);

  if (isDark) {
    const sat = 0.65 - blend * 0.35;  // 0.65 → 0.30 → 0.65
    const lit = 0.50 - blend * 0.15;  // 0.50 → 0.35 → 0.50
    return hslToHex(hue, sat, lit);
  }
  const sat = 0.60 - blend * 0.25;    // 0.60 → 0.35 → 0.60
  const lit = 0.58 + blend * 0.04;    // 0.58 → 0.62 → 0.58
  return hslToHex(hue, sat, lit);
}

export function getTextColorForAccent(hex: string): "#000" | "#fff" {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? "#000" : "#fff";
}
