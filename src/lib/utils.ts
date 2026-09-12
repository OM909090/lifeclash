import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 8420 → "8,420" */
export function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/** 8420 → "8.4K", 1250000 → "1.3M" — for tight HUD capsules. */
export function fmtCompact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k < 10 ? k.toFixed(1) : Math.round(k)}K`;
  }
  const m = n / 1_000_000;
  return `${m < 10 ? m.toFixed(1) : Math.round(m)}M`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function pct(value: number, total: number): number {
  if (total <= 0) return 0;
  return clamp((value / total) * 100, 0, 100);
}

let idCounter = 0;
/** Collision-free enough for client-side FX keys. */
export function uid(prefix = "id"): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

/**
 * Deterministic pseudo-random in [0,1) from a numeric seed.
 *
 * Used for ambient decoration (cloud sizes, sprite tracks, star fields) so the
 * layout is identical on the server and the client. The result is rounded
 * because `Math.sin` is implementation-defined in ECMAScript and Node vs V8
 * can disagree in the final bits — enough to trip React hydration when the
 * value lands in an inline style. Rounding collapses that difference and makes
 * every downstream calculation bit-identical.
 */
export function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return Math.round((x - Math.floor(x)) * 1e6) / 1e6;
}

export function timeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "ended";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
