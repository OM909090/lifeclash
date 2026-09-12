"use client";

import { StepFrame, OptionCard } from "../WizardChrome";
import { useOnboarding } from "@/store/onboarding-store";
import { PILLARS, BUILDINGS } from "@/lib/game-config";
import { BuildingArt } from "@/components/art/Buildings";
import type { BuildingType } from "@/types/game";

/**
 * Step 2 — Choose your pillars.
 * Each selected pillar becomes a building in the seeded village, so the preview
 * strip below shows exactly what the realm will contain.
 */
export function Step2Pillars() {
  const { pillars, togglePillar } = useOnboarding();

  // Distinct buildings unlocked by the current selection (several pillars map
  // to the same structure — Recovery and Discipline both feed the tower).
  const unlocked = Array.from(
    new Set(
      pillars
        .map((p) => PILLARS.find((x) => x.id === p)?.building)
        .filter((b): b is BuildingType => Boolean(b)),
    ),
  );

  const hint =
    pillars.length < 2
      ? `Pick at least 2 — ${2 - pillars.length} more to go`
      : pillars.length > 4
        ? "That's a lot of fronts. Three or four is the sweet spot."
        : undefined;

  return (
    <StepFrame
      wide
      eyebrow="Chapter two"
      title="Choose your pillars"
      subtitle="Which parts of your life do you want to level up? Each one becomes a building in your realm."
      hint={hint}
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <OptionCard
            key={p.id}
            multi
            selected={pillars.includes(p.id)}
            onSelect={() => togglePillar(p.id)}
            emoji={p.emoji}
            label={p.label}
            blurb={p.blurb}
            from={p.from}
            to={p.to}
          />
        ))}
      </div>

      {/* ---------------------------------------------------- village preview */}
      <div className="mt-6 rounded-chunk border-[3px] border-wood-dark/30 bg-tan-mid/45 p-3">
        <p className="mb-2 text-center font-ui text-[10px] font-black uppercase tracking-[0.2em] text-wood-mid">
          {unlocked.length
            ? "Your realm will be built with"
            : "Select pillars to see your realm"}
        </p>
        <div className="flex min-h-[92px] flex-wrap items-end justify-center gap-3">
          {/* the Town Hall is always there */}
          <PreviewBuilding type="TOWN_HALL" />
          {unlocked.map((b) => (
            <PreviewBuilding key={b} type={b} />
          ))}
        </div>
      </div>
    </StepFrame>
  );
}

function PreviewBuilding({ type }: { type: BuildingType }) {
  return (
    <div className="flex w-[86px] flex-col items-center gap-0.5">
      <BuildingArt type={type} level={3} width={74} />
      <span className="text-center font-ui text-[9px] font-black uppercase leading-tight tracking-wide text-wood-mid">
        {BUILDINGS[type].name}
      </span>
    </div>
  );
}
