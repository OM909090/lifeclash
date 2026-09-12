"use client";

import { StepFrame } from "../WizardChrome";
import { useOnboarding } from "@/store/onboarding-store";
import { SEASON_GOAL_PRESETS, SEASON } from "@/lib/game-config";
import { cn, timeUntil } from "@/lib/utils";
import { play } from "@/lib/audio";
import { TownHallSvg } from "@/components/art/Buildings";

/**
 * Step 6 — Your season goal.
 * Becomes the Epic Quest pinned in the Town Hall for the whole season.
 */
export function Step6Goal() {
  const { seasonGoal, setSeasonGoal } = useOnboarding();

  return (
    <StepFrame
      eyebrow="Chapter six"
      title="What's your #1 goal this season?"
      subtitle="One thing. It gets pinned in your Town Hall and every daily quest pushes it forward."
      hint={
        seasonGoal.trim().length < 2 ? "Pick a preset or write your own" : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {/* -------------------------------------------------------- presets */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SEASON_GOAL_PRESETS.map((p) => {
            const active = seasonGoal.trim() === p.label;
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={active}
                onMouseEnter={() => play("hover")}
                onClick={() => {
                  play("select");
                  setSeasonGoal(p.label);
                }}
                className={cn(
                  "relative flex items-center gap-3 overflow-hidden rounded-chunk border-[4px] px-3.5 py-3 text-left transition-all duration-150",
                  active
                    ? "-translate-y-0.5 border-wood-dark bg-gold-gradient shadow-btn-gold-sm"
                    : "border-wood-dark/35 bg-tan-light/70 hover:-translate-y-0.5 hover:border-wood-dark/60 hover:bg-tan-light",
                )}
              >
                {active ? (
                  <span
                    className="pointer-events-none absolute inset-x-1 top-0.5 h-1/3 rounded-t-[0.6rem]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,.45) 0%, rgba(255,255,255,0) 100%)",
                    }}
                  />
                ) : null}
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-wood-dark/25 bg-white/45 text-xl leading-none">
                  {p.emoji}
                </span>
                <span className="relative font-display text-base leading-tight text-wood-deep sm:text-lg">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* --------------------------------------------------------- freeform */}
        <label className="flex flex-col gap-2">
          <span className="font-ui text-[11px] font-black uppercase tracking-[0.18em] text-wood-mid">
            …or write your own
          </span>
          <div className="relative">
            <input
              value={seasonGoal}
              onChange={(e) => setSeasonGoal(e.target.value)}
              placeholder="Run a half marathon"
              maxLength={60}
              className="w-full rounded-chunk border-[4px] border-wood-dark bg-tan-light px-4 py-3 font-display text-lg text-wood-deep shadow-inset-soft outline-none placeholder:text-wood-mid/40 focus:border-gold-base sm:text-xl"
            />
            <span className="pointer-events-none absolute bottom-1.5 right-3 font-ui text-[10px] font-bold tabular-nums text-wood-mid/50">
              {seasonGoal.length}/60
            </span>
          </div>
        </label>

        {/* ---------------------------------------------------- epic quest card */}
        <div className="relative flex items-center gap-3.5 overflow-hidden rounded-chunk border-[3px] border-wood-dark/40 bg-[linear-gradient(160deg,#FFE9B0_0%,#E9C79A_60%,#C99B6B_100%)] p-3.5">
          <TownHallSvg level={9} width={76} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-pill border-2 border-elixir-deep bg-elixir-base px-2 py-0.5 font-ui text-[9px] font-black uppercase tracking-wider text-white">
              ★ Epic Quest
            </span>
            <p className="text-outline-xs mt-1.5 truncate text-base sm:text-lg">
              {seasonGoal.trim() || "Your season goal"}
            </p>
            <p className="font-body text-[11px] font-bold text-wood-mid">
              {SEASON.name} · ends in {timeUntil(SEASON.endsAt)}
            </p>
          </div>
        </div>
      </div>
    </StepFrame>
  );
}
