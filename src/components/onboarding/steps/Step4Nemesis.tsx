"use client";

import { StepFrame, OptionCard } from "../WizardChrome";
import { useOnboarding } from "@/store/onboarding-store";
import { NEMESIS_OPTIONS } from "@/lib/game-config";
import { DragonSvg } from "@/components/art/Dragon";

/**
 * Step 4 — Your greatest enemy.
 * Personalises the raid boss variant and the coaching tone.
 */
export function Step4Nemesis() {
  const { nemesis, setNemesis } = useOnboarding();
  const chosen = NEMESIS_OPTIONS.find((n) => n.id === nemesis);

  return (
    <StepFrame
      wide
      eyebrow="Chapter four"
      title="Name your greatest enemy"
      subtitle="Every realm has one. Yours becomes the boss you and your clan hunt each week."
      hint={!nemesis ? "Choose the thing that stops you most often" : undefined}
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-2.5">
          {NEMESIS_OPTIONS.map((n) => (
            <OptionCard
              key={n.id}
              selected={nemesis === n.id}
              onSelect={() => setNemesis(n.id)}
              emoji={n.emoji}
              label={n.label}
              from="#B78CFF"
              to="#4A1E7D"
            />
          ))}
        </div>

        {/* ------------------------------------------------------ boss reveal */}
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-chunk border-[3px] border-panel-ink bg-[radial-gradient(ellipse_at_50%_20%,#4A3466_0%,#241539_60%,#150B24_100%)] p-4">
          {/* smoke */}
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-dragon-accent/25 blur-3xl" />
          </div>

          <div className="relative animate-bob-slow">
            <DragonSvg width={210} defeated={!nemesis} />
          </div>

          <div className="relative mt-1 text-center">
            <p className="font-ui text-[9px] font-black uppercase tracking-[0.24em] text-elixir-light">
              Your raid boss
            </p>
            <p className="text-outline-xs mt-1 text-sm leading-tight sm:text-base">
              {chosen?.boss ?? "The Procrastination Dragon"}
            </p>
            <p className="mt-2 font-body text-xs font-semibold italic leading-snug text-cream/65">
              {chosen ? `“${chosen.taunt}”` : "It stirs when you choose."}
            </p>
          </div>
        </div>
      </div>
    </StepFrame>
  );
}
