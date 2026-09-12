import { cn } from "@/lib/utils";
import { difficultyLabel } from "@/lib/rewards";

/** Small hexagon-ish level chip used on cards and buildings. */
export function LevelBadge({
  level,
  className,
  size = "md",
}: {
  level: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "sm"
      ? "h-7 w-7 text-[10px]"
      : size === "lg"
        ? "h-14 w-14 text-lg"
        : "h-10 w-10 text-xs";

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-xl border-[3px] border-wood-dark bg-gold-gradient shadow-btn-gold-sm",
        dims,
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-x-0.5 top-0.5 h-1/3 rounded-t-lg"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,.6) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
      <span className="relative flex flex-col items-center leading-none">
        {size !== "sm" ? (
          <span className="font-ui text-[7px] font-black uppercase tracking-widest text-wood-dark/80">
            lvl
          </span>
        ) : null}
        <span
          className="text-outline-xs tabular-nums"
          style={{ WebkitTextStroke: "1.5px #4D2815" }}
        >
          {level}
        </span>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Difficulty stars — 1★ Easy through 4★ Epic. */
export function DifficultyStars({
  difficulty,
  showLabel = true,
  className,
}: {
  difficulty: number;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="text-[11px] leading-none tracking-tight">
        {Array.from({ length: 4 }, (_, i) => (
          <span
            key={i}
            className={i < difficulty ? "text-gold-base" : "text-wood-dark/25"}
          >
            ★
          </span>
        ))}
      </span>
      {showLabel ? (
        <span className="font-ui text-[10px] font-extrabold uppercase tracking-wide text-wood-mid">
          {difficultyLabel(difficulty)}
        </span>
      ) : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

export type ChipTone =
  | "gold"
  | "elixir"
  | "gem"
  | "xp"
  | "wood"
  | "stone"
  | "danger"
  | "warn"
  | "ink";

const CHIP: Record<ChipTone, string> = {
  gold: "bg-gold-base/95 border-gold-deep text-wood-deep",
  elixir: "bg-elixir-base/95 border-elixir-deep text-white",
  gem: "bg-gem-base/95 border-gem-deep text-[#0C4A14]",
  xp: "bg-xp/95 border-[#3C7A1E] text-[#1B3A0C]",
  wood: "bg-wood-base/95 border-wood-deep text-cream",
  stone: "bg-stone-base/95 border-stone-deep text-panel-ink",
  danger: "bg-danger/95 border-[#7A1B1B] text-white",
  warn: "bg-warn/95 border-[#A85D0C] text-[#4A2803]",
  ink: "bg-panel-base/92 border-panel-ink text-cream",
};

/** Compact label pill — categories, rewards, statuses. */
export function Chip({
  tone = "wood",
  children,
  className,
}: {
  tone?: ChipTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border-2 px-2 py-0.5 font-ui text-[10px] font-black uppercase tracking-wide",
        CHIP[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
