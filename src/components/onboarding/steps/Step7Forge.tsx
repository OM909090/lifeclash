"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/store/onboarding-store";
import { useGame } from "@/store/game-store";
import {
  PILLARS,
  NEMESIS_OPTIONS,
  CONSISTENCY_OPTIONS,
  leagueById,
  BUILDINGS,
} from "@/lib/game-config";
import { BuildingArt } from "@/components/art/Buildings";
import { GuardianArt } from "@/components/art/Guardians";
import { DragonSvg } from "@/components/art/Dragon";
import { LeagueBadge } from "@/components/art/LeagueBadge";
import { play } from "@/lib/audio";
import { cn } from "@/lib/utils";
import type { BuildingType } from "@/types/game";

/**
 * Step 7 — THE FORGE.
 *
 * The moment the system visibly "plans". Each stage resolves one onboarding
 * answer into a piece of the world, dropping in with spring physics and a
 * synthesised anvil hit. This is where the backend seeding will eventually
 * happen (POST /api/onboarding); the staging is identical either way.
 */

const STAGE_MS = 1150;

export function Step7Forge({ onDone }: { onDone: () => void }) {
  const answers = useOnboarding();
  const seedRealm = useGame((s) => s.seedRealm);

  const [stage, setStage] = useState(0);
  const seededRef = useRef(false);

  const primaryPillar = PILLARS.find((p) => p.id === answers.pillars[0]);
  const guardian = primaryPillar?.guardian ?? "scholar";

  const buildings: BuildingType[] = Array.from(
    new Set<BuildingType>([
      "TOWN_HALL",
      ...answers.pillars
        .map((p) => PILLARS.find((x) => x.id === p)?.building)
        .filter((b): b is BuildingType => Boolean(b)),
    ]),
  );

  const consistency = CONSISTENCY_OPTIONS.find((c) => c.id === answers.consistency);
  const nemesis = NEMESIS_OPTIONS.find((n) => n.id === answers.nemesis);

  const stages = [
    {
      label: `Raising your ${BUILDINGS[buildings[1] ?? "ACADEMY"].name}…`,
      done: `${buildings.length} buildings placed`,
    },
    {
      label: "Summoning your Guardian…",
      done: `${guardianName(guardian)} answers the call`,
    },
    {
      label: "Generating your first quests…",
      done: "Daily board ready",
    },
    {
      label: "Calibrating your league…",
      done: `${leagueById(consistency?.league ?? "WOOD").name} League`,
    },
    {
      label: "Waking the Procrastination Dragon…",
      done: nemesis?.boss ?? "The Procrastination Dragon",
    },
  ];

  /* Advance one stage at a time, then seed the game state and hand off. */
  useEffect(() => {
    if (stage >= stages.length) {
      if (!seededRef.current) {
        seededRef.current = true;
        // Persists to Supabase in server mode, seeds locally otherwise. We wait
        // for it so Step 8 reads the real, saved realm.
        void seedRealm({
          realmName: answers.realmName,
          displayName: answers.displayName,
          crest: answers.crest,
          pillars: answers.pillars,
          consistency: answers.consistency,
          nemesis: answers.nemesis,
          timeBudget: answers.timeBudget,
          seasonGoal: answers.seasonGoal,
        }).finally(() => window.setTimeout(onDone, 700));
      }
      return;
    }

    play(stage === stages.length - 1 ? "dragonRoar" : "forge");
    const t = window.setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4">
      {/* ------------------------------------------------------------- title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-outline text-center text-4xl sm:text-6xl"
      >
        Forging your world…
      </motion.h1>
      <p className="mt-3 rounded-pill border-2 border-panel-ink/60 bg-panel-ink/65 px-4 py-1.5 text-center font-body text-sm font-bold text-cream/90 backdrop-blur-sm sm:text-base">
        {answers.realmName.trim() || "Everhold"} is being raised from your answers.
      </p>

      {/* ------------------------------------------------------- forge stage */}
      <div className="panel-dark relative mt-7 w-full overflow-hidden">
        {/* anvil sparks band */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-50">
          <div className="absolute left-1/2 top-0 h-24 w-64 -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,196,66,.6),transparent_70%)] blur-xl" />
        </div>

        {/* the world being assembled */}
        <div className="relative flex min-h-[190px] items-end justify-center gap-2 px-4 pt-8 sm:gap-4">
          {/* buildings drop in during stage 0 */}
          {buildings.map((b, i) => (
            <AnimatePresence key={b}>
              {stage >= 0 ? (
                <motion.div
                  initial={{ y: -140, opacity: 0, scale: 0.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    delay: i * 0.16,
                    type: "spring",
                    stiffness: 240,
                    damping: 14,
                  }}
                  className="flex flex-col items-center"
                >
                  <BuildingArt type={b} level={2} width={72} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          ))}

          {/* guardian walks in at stage 1 */}
          <AnimatePresence>
            {stage >= 1 ? (
              <motion.div
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 18 }}
              >
                <GuardianArt id={guardian} width={104} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* dragon rises at the final stage */}
          <AnimatePresence>
            {stage >= 4 ? (
              <motion.div
                initial={{ y: 90, opacity: 0, scale: 0.7 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className="absolute -right-2 bottom-2 sm:right-4"
              >
                <DragonSvg width={150} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* ground line */}
        <div className="relative h-3 bg-grass-gradient" />

        {/* ------------------------------------------------------ status lines */}
        <div className="relative flex flex-col gap-1.5 px-4 py-4 sm:px-6">
          {stages.map((s, i) => {
            const active = stage === i;
            const complete = stage > i;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -18 }}
                animate={{
                  opacity: stage >= i ? 1 : 0.28,
                  x: stage >= i ? 0 : -18,
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex items-center gap-3 rounded-chunk border-2 px-3 py-2 transition-colors",
                  complete
                    ? "border-gem-deep/60 bg-gem-base/12"
                    : active
                      ? "border-gold-deep/70 bg-gold-base/15"
                      : "border-white/5 bg-white/[0.02]",
                )}
              >
                {/* state glyph */}
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 text-[11px] font-black",
                    complete
                      ? "border-gem-deep bg-gem-gradient text-[#0C4A14]"
                      : active
                        ? "border-gold-deep bg-gold-gradient text-wood-deep"
                        : "border-white/15 bg-white/5 text-cream/30",
                  )}
                >
                  {complete ? "✓" : active ? "⚒" : i + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate font-ui text-xs font-black uppercase tracking-wide sm:text-sm",
                      complete ? "text-gem-light" : active ? "text-gold-light" : "text-cream/40",
                    )}
                  >
                    {complete ? s.done : s.label}
                  </span>
                </span>

                {active ? (
                  <span className="flex shrink-0 gap-1">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold-light"
                        style={{ animationDelay: `${d * 0.18}s` }}
                      />
                    ))}
                  </span>
                ) : null}

                {complete && i === 3 ? (
                  <LeagueBadge
                    league={consistency?.league ?? "WOOD"}
                    size={26}
                    className="shrink-0"
                  />
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function guardianName(id: string): string {
  return (
    {
      scholar: "The Scholar",
      warrior: "The Warrior",
      merchant: "The Merchant",
      sentinel: "The Sentinel",
    }[id] ?? "The Scholar"
  );
}
