"use client";

import { motion } from "framer-motion";
import { cn, pct } from "@/lib/utils";

export type BarTone = "xp" | "gold" | "elixir" | "gem" | "hp" | "stone";

const FILL: Record<BarTone, string> = {
  xp: "bg-[linear-gradient(180deg,#C9F79B_0%,#7BD84A_48%,#4E9E28_100%)]",
  gold: "bg-gold-gradient",
  elixir: "bg-elixir-gradient",
  gem: "bg-gem-gradient",
  hp: "bg-[linear-gradient(180deg,#FF9A8F_0%,#E94B4B_48%,#A32020_100%)]",
  stone: "bg-stone-gradient",
};

export interface ProgressBarProps {
  value: number;
  max: number;
  tone?: BarTone;
  /** Bar height. */
  size?: "xs" | "sm" | "md" | "lg";
  /** Centre label, e.g. "1,240 / 1,800". */
  label?: string;
  /** Animated sheen sweep across the fill. */
  shine?: boolean;
  className?: string;
}

const HEIGHT = {
  xs: "h-2",
  sm: "h-3",
  md: "h-5",
  lg: "h-7",
} as const;

const TEXT = {
  xs: "text-[9px]",
  sm: "text-[10px]",
  md: "text-[11px]",
  lg: "text-sm",
} as const;

/** Recessed track + glossy animated fill. */
export function ProgressBar({
  value,
  max,
  tone = "xp",
  size = "md",
  label,
  shine = true,
  className,
}: ProgressBarProps) {
  const percent = pct(value, max);

  return (
    <div
      className={cn("well relative overflow-hidden", HEIGHT[size], className)}
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-label={label}
    >
      <motion.div
        className={cn("relative h-full rounded-pill", FILL[tone])}
        initial={false}
        animate={{ width: `${percent}%` }}
        transition={{ type: "spring", stiffness: 140, damping: 20 }}
      >
        {/* top gloss */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-pill"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
        {shine && percent > 6 ? <span className="sheen rounded-pill" /> : null}
      </motion.div>

      {label ? (
        <span
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center font-ui font-extrabold tabular-nums tracking-tight text-cream",
            TEXT[size],
          )}
          style={{ textShadow: "0 1px 2px rgba(0,0,0,.85)" }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
