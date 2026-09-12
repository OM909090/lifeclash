"use client";

import { StepFrame, OptionCard } from "../WizardChrome";
import { useOnboarding } from "@/store/onboarding-store";
import { TIME_BUDGETS } from "@/lib/game-config";
import { generateQuests } from "@/lib/rewards";
import { GoldCoinSvg, ElixirFlaskSvg } from "@/components/art/ResourceIcons";
import { DifficultyStars } from "@/components/ui/Badge";
import { fmt } from "@/lib/utils";

/**
 * Step 5 — Time budget.
 * Scales daily quest targets and rewards. The preview below runs the real
 * generator so the numbers shown are the numbers they'll get.
 */
export function Step5Time() {
  const { timeBudget, setTimeBudget, pillars, consistency } = useOnboarding();

  const preview = timeBudget
    ? generateQuests(pillars, timeBudget, consistency)
        .filter((q) => q.cadence === "DAILY")
        .slice(0, 3)
    : [];

  return (
    <StepFrame
      eyebrow="Chapter five"
      title="How much time can you invest each day?"
      subtitle="Quests are sized to fit the life you actually have. You can change this later."
      hint={!timeBudget ? "Pick a daily budget" : undefined}
    >
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {TIME_BUDGETS.map((t) => (
          <OptionCard
            key={t.id}
            compact
            selected={timeBudget === t.id}
            onSelect={() => setTimeBudget(t.id)}
            emoji={t.emoji}
            label={t.label}
            blurb={t.blurb}
          />
        ))}
      </div>

      {/* ------------------------------------------------------ quest preview */}
      <div className="mt-6 rounded-chunk border-[3px] border-wood-dark/30 bg-tan-mid/45 p-3">
        <p className="mb-2.5 text-center font-ui text-[10px] font-black uppercase tracking-[0.2em] text-wood-mid">
          {preview.length
            ? "Your first daily quests would look like this"
            : "Your daily quests appear here"}
        </p>

        <div className="flex min-h-[92px] flex-col gap-2">
          {preview.length ? (
            preview.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3 rounded-chunk border-2 border-wood-dark/25 bg-tan-light/80 px-3 py-2"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-wood-dark/30 bg-white/60 text-xs font-black text-wood-mid">
                  ☐
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm leading-tight text-wood-deep sm:text-base">
                    {q.title}
                    {q.targetValue ? (
                      <span className="ml-1.5 font-ui text-xs font-black tabular-nums text-wood-mid">
                        · {fmt(q.targetValue)} {q.unit}
                      </span>
                    ) : null}
                  </p>
                  <DifficultyStars difficulty={q.difficulty} />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-ui text-xs font-black tabular-nums text-[#3C7A1E]">
                    +{q.reward.xp} XP
                  </span>
                  <span className="flex items-center gap-0.5 font-ui text-xs font-black tabular-nums text-gold-dark">
                    <GoldCoinSvg size={13} />
                    {q.reward.gold}
                  </span>
                  <span className="hidden items-center gap-0.5 font-ui text-xs font-black tabular-nums text-elixir-dark sm:flex">
                    <ElixirFlaskSvg size={13} />
                    {q.reward.elixir}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-center font-body text-sm font-bold text-wood-mid/70">
              Choose a time budget to see them.
            </p>
          )}
        </div>
      </div>
    </StepFrame>
  );
}
