"use client";

import { StepFrame, OptionCard } from "../WizardChrome";
import { useOnboarding } from "@/store/onboarding-store";
import { CONSISTENCY_OPTIONS, leagueById } from "@/lib/game-config";
import { LeagueBadge } from "@/components/art/LeagueBadge";
import { fmt } from "@/lib/utils";

/**
 * Step 3 — Your starting point.
 * Sets the starting league tier and quest difficulty so the first week feels
 * fair rather than punishing or trivial.
 */
export function Step3Consistency() {
  const { consistency, setConsistency } = useOnboarding();
  const chosen = CONSISTENCY_OPTIONS.find((c) => c.id === consistency);

  return (
    <StepFrame
      eyebrow="Chapter three"
      title="How consistent are you right now?"
      subtitle="Be honest — this only decides where you start, not where you finish."
      hint={!consistency ? "Pick the one that sounds most like you" : undefined}
    >
      <div className="flex flex-col gap-2.5">
        {CONSISTENCY_OPTIONS.map((c) => (
          <OptionCard
            key={c.id}
            selected={consistency === c.id}
            onSelect={() => setConsistency(c.id)}
            emoji={c.emoji}
            label={c.label}
            blurb={c.blurb}
          />
        ))}
      </div>

      {/* ------------------------------------------------------ consequence */}
      <div className="mt-6 flex items-center gap-4 rounded-chunk border-[3px] border-wood-dark/30 bg-tan-mid/45 p-3.5">
        {chosen ? (
          <>
            <LeagueBadge league={chosen.league} size={52} />
            <div className="min-w-0 flex-1">
              <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-wood-mid">
                You&apos;ll start in
              </p>
              <p className="text-outline-xs text-lg sm:text-xl">
                {leagueById(chosen.league).name} League
              </p>
              <p className="font-body text-xs font-bold text-wood-mid">
                {fmt(chosen.trophies)} Consistency Trophies · quest difficulty{" "}
                {"★".repeat(chosen.difficulty)}
                <span className="text-wood-mid/40">
                  {"★".repeat(4 - chosen.difficulty)}
                </span>
              </p>
            </div>
          </>
        ) : (
          <p className="w-full py-2 text-center font-body text-sm font-bold text-wood-mid/70">
            Your starting league appears here.
          </p>
        )}
      </div>
    </StepFrame>
  );
}
