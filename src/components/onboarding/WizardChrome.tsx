"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { play } from "@/lib/audio";
import { TOTAL_STEPS } from "@/store/onboarding-store";

/* -------------------------------------------------------------------------- */
/* PROGRESS BAR — the gold XP-style bar pinned across the top of the wizard    */
/* -------------------------------------------------------------------------- */

export function WizardProgress({ step }: { step: number }) {
  // The forge (7) and the reveal (8) are cinematic, not questions.
  const questions = 6;
  const shown = Math.min(step, questions);
  const percent = (shown / questions) * 100;

  return (
    // Wrapped in a dark pill: the sky behind is full of white clouds, and cream
    // text with a shadow still washed out against them.
    <div className="mx-auto w-[calc(100%-1.5rem)] max-w-2xl rounded-panel border-2 border-panel-ink/70 bg-panel-ink/70 px-3 py-2.5 shadow-nav backdrop-blur-md sm:px-4">
      <div className="mb-1.5 flex items-end justify-between">
        <span className="font-ui text-[10px] font-black uppercase tracking-[0.22em] text-cream/90 sm:text-xs">
          {step <= questions ? `Step ${shown} of ${questions}` : "Forging your world"}
        </span>
        <span className="font-ui text-[10px] font-black tabular-nums text-cream/70 sm:text-xs">
          {Math.round(percent)}%
        </span>
      </div>

      <div className="well relative h-5 overflow-hidden">
        <motion.div
          className="relative h-full rounded-pill bg-gold-gradient"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 130, damping: 20 }}
        >
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-pill"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.6) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          {percent > 8 ? <span className="sheen rounded-pill" /> : null}
        </motion.div>
      </div>

      {/* step pips */}
      <div className="mt-2 flex justify-between px-0.5">
        {Array.from({ length: questions }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full border-2 transition-colors",
              i < shown
                ? "border-gold-deep bg-gold-light"
                : "border-panel-ink/60 bg-panel-ink/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STEP FRAME — title, subtitle, body, and the Back/Next footer                */
/* -------------------------------------------------------------------------- */

export interface StepFrameProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Hint shown next to the Next button, e.g. "Pick at least 2". */
  hint?: string;
  /** Widen the panel for grid-heavy steps. */
  wide?: boolean;
}

export function StepFrame({
  eyebrow,
  title,
  subtitle,
  children,
  hint,
  wide,
}: StepFrameProps) {
  return (
    <div
      className={cn(
        "panel-wood mx-auto flex w-full flex-col overflow-hidden",
        wide ? "max-w-3xl" : "max-w-2xl",
      )}
    >
      {/* header band */}
      <div className="relative border-b-[5px] border-wood-dark bg-wood-gradient px-5 py-4 text-center sm:px-8 sm:py-5">
        <span
          className="pointer-events-none absolute inset-x-2 top-1 h-5 rounded-t-xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.34) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
        <p className="relative font-ui text-[10px] font-black uppercase tracking-[0.26em] text-gold-light">
          {eyebrow}
        </p>
        <h1 className="text-outline-sm relative mt-1.5 text-2xl leading-tight sm:text-4xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="relative mx-auto mt-2 max-w-lg font-body text-sm font-semibold text-tan-light/90 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>

      {/* body */}
      <div className="px-4 py-5 sm:px-7 sm:py-7">{children}</div>

      {hint ? (
        <p className="px-5 pb-4 text-center font-ui text-[11px] font-bold uppercase tracking-wider text-wood-mid">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* OPTION CARD — the tappable choice used by steps 2-6                         */
/* -------------------------------------------------------------------------- */

export interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  emoji?: React.ReactNode;
  label: string;
  blurb?: string;
  /** Gradient stops for the selected state. */
  from?: string;
  to?: string;
  /** Compact variant for tight grids (time budget). */
  compact?: boolean;
  /** Shows a checkmark instead of a radio dot (multi-select). */
  multi?: boolean;
}

export function OptionCard({
  selected,
  onSelect,
  emoji,
  label,
  blurb,
  from,
  to,
  compact,
  multi,
}: OptionCardProps) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onMouseEnter={() => play("hover")}
      onClick={() => {
        play(selected && multi ? "back" : "select");
        onSelect();
      }}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-chunk border-[4px] text-left transition-all duration-150",
        compact ? "flex-col gap-1.5 px-3 py-4 text-center" : "px-3.5 py-3",
        selected
          ? "border-wood-dark shadow-btn-gold-sm -translate-y-0.5"
          : "border-wood-dark/35 bg-tan-light/70 hover:-translate-y-0.5 hover:border-wood-dark/60 hover:bg-tan-light",
      )}
      style={
        selected && from && to
          ? { background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }
          : selected
            ? { background: "linear-gradient(180deg, #FFE680 0%, #F0B429 100%)" }
            : undefined
      }
    >
      {/* top gloss on the selected state */}
      {selected ? (
        <span
          className="pointer-events-none absolute inset-x-1 top-0.5 h-1/3 rounded-t-[0.6rem]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.45) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
      ) : null}

      {emoji ? (
        <span
          className={cn(
            "relative grid shrink-0 place-items-center rounded-xl border-2 leading-none transition-transform group-hover:scale-105",
            compact ? "h-11 w-11 text-2xl" : "h-11 w-11 text-xl",
            selected
              ? "border-wood-dark/50 bg-white/30"
              : "border-wood-dark/25 bg-white/45",
          )}
        >
          {emoji}
        </span>
      ) : null}

      <span className="relative min-w-0 flex-1">
        <span
          className={cn(
            "block font-display leading-tight",
            compact ? "text-base" : "text-base sm:text-lg",
            selected ? "text-wood-deep" : "text-wood-dark",
          )}
        >
          {label}
        </span>
        {blurb ? (
          <span
            className={cn(
              "mt-0.5 block font-body text-xs font-semibold leading-snug",
              selected ? "text-wood-deep/80" : "text-wood-mid/85",
            )}
          >
            {blurb}
          </span>
        ) : null}
      </span>

      {/* selection indicator */}
      {!compact ? (
        <span
          className={cn(
            "relative grid h-7 w-7 shrink-0 place-items-center rounded-lg border-[3px] text-xs font-black transition-colors",
            selected
              ? "border-wood-dark bg-gem-gradient text-[#0C4A14]"
              : "border-wood-dark/25 bg-white/40 text-transparent",
          )}
        >
          ✓
        </span>
      ) : selected ? (
        <span className="relative grid h-6 w-6 place-items-center rounded-lg border-[3px] border-wood-dark bg-gem-gradient text-[10px] font-black text-[#0C4A14]">
          ✓
        </span>
      ) : null}
    </button>
  );
}
