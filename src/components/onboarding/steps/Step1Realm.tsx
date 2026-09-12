"use client";

import { StepFrame } from "../WizardChrome";
import { useOnboarding } from "@/store/onboarding-store";
import { CRESTS } from "@/lib/game-config";
import { cn } from "@/lib/utils";
import { play } from "@/lib/audio";
import { BannerSvg } from "@/components/art/Scenery";

/** Step 1 — Name your realm. A deliberately low-friction opener. */
export function Step1Realm() {
  const { realmName, displayName, crest, setRealmName, setDisplayName, setCrest } =
    useOnboarding();

  return (
    <StepFrame
      eyebrow="Chapter one"
      title="Name your realm"
      subtitle="This is the world your habits will build. Pick something you'd be glad to see every morning."
      hint={realmName.trim().length < 2 ? "Give your realm a name to continue" : undefined}
    >
      <div className="flex flex-col gap-5">
        {/* -------------------------------------------------- realm name field */}
        <label className="flex flex-col gap-2">
          <span className="font-ui text-[11px] font-black uppercase tracking-[0.18em] text-wood-mid">
            Realm name
          </span>
          <div className="relative">
            <input
              value={realmName}
              onChange={(e) => setRealmName(e.target.value)}
              placeholder="Everhold"
              autoFocus
              maxLength={24}
              className="w-full rounded-chunk border-[4px] border-wood-dark bg-tan-light px-4 py-3.5 font-display text-xl text-wood-deep shadow-inset-soft outline-none transition-shadow placeholder:text-wood-mid/40 focus:border-gold-base sm:text-2xl"
            />
            <span className="pointer-events-none absolute bottom-2 right-3 font-ui text-[10px] font-bold tabular-nums text-wood-mid/50">
              {realmName.length}/24
            </span>
          </div>
        </label>

        {/* ------------------------------------------------------- display name */}
        <label className="flex flex-col gap-2">
          <span className="font-ui text-[11px] font-black uppercase tracking-[0.18em] text-wood-mid">
            Your name{" "}
            <span className="font-bold normal-case tracking-normal text-wood-mid/60">
              — optional, shown on leaderboards
            </span>
          </span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Chieftain"
            maxLength={20}
            className="w-full rounded-chunk border-[4px] border-wood-dark/50 bg-tan-light/80 px-4 py-2.5 font-body text-base font-bold text-wood-deep shadow-inset-soft outline-none placeholder:text-wood-mid/40 focus:border-gold-base"
          />
        </label>

        {/* -------------------------------------------------------------- crest */}
        <div className="flex flex-col gap-2">
          <span className="font-ui text-[11px] font-black uppercase tracking-[0.18em] text-wood-mid">
            Choose your crest
          </span>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {CRESTS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Crest ${c}`}
                aria-pressed={crest === c}
                onMouseEnter={() => play("hover")}
                onClick={() => {
                  play("select");
                  setCrest(c);
                }}
                className={cn(
                  "grid aspect-square place-items-center rounded-chunk border-[3px] text-2xl transition-all duration-150",
                  crest === c
                    ? "-translate-y-0.5 border-wood-dark bg-gold-gradient shadow-btn-gold-sm"
                    : "border-wood-dark/30 bg-tan-light/70 hover:-translate-y-0.5 hover:bg-tan-light",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------ preview */}
        <div className="flex items-center gap-4 rounded-chunk border-[3px] border-wood-dark/30 bg-tan-mid/50 p-3">
          <BannerSvg width={54} crest={crest} color="#3E8BE0" />
          <div className="min-w-0">
            <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-wood-mid">
              Your banner
            </p>
            <p className="text-outline-xs truncate text-lg sm:text-xl">
              {realmName.trim() || "Everhold"}
            </p>
            <p className="truncate font-body text-xs font-bold text-wood-mid">
              Ruled by {displayName.trim() || "Chieftain"}
            </p>
          </div>
        </div>
      </div>
    </StepFrame>
  );
}
