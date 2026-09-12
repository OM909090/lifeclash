"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/store/game-store";
import { useOnboarding } from "@/store/onboarding-store";
import { GuardianArt } from "@/components/art/Guardians";
import { BuildingArt } from "@/components/art/Buildings";
import { FloatingIsland } from "@/components/art/Scenery";
import { Button } from "@/components/ui/Button";
import { Confetti } from "@/components/fx/Confetti";
import { guardianById } from "@/lib/game-config";
import { play } from "@/lib/audio";
import { cn } from "@/lib/utils";

/**
 * Step 8 — Enter the world.
 *
 * Camera fly-in onto the finished realm, then a three-beat Guardian tutorial:
 * tap a building → open a quest → do it in real life. Ends by handing off to
 * /village.
 */

const TUTORIAL = [
  {
    title: "Tap a building",
    body: "Every building is one part of your life. Tap it to see what it wants from you today.",
    emoji: "👆",
  },
  {
    title: "Open a quest",
    body: "Quests are small, specific and finishable. Pick one and go do it in the real world.",
    emoji: "📜",
  },
  {
    title: "Watch your world grow",
    body: "Mark it complete and the rewards land: XP, gold, elixir — and your realm levels up.",
    emoji: "🌱",
  },
];

export function Step8Enter() {
  const router = useRouter();
  const player = useGame((s) => s.player);
  const buildings = useGame((s) => s.buildings);
  const markCompleted = useOnboarding((s) => s.finish);

  const guardian = guardianById(player.guardian);
  const [beat, setBeat] = useState(-1);
  const [celebrate, setCelebrate] = useState(false);

  /* Fly-in, then start the tutorial beats. */
  useEffect(() => {
    play("levelUp");
    setCelebrate(true);
    const t1 = window.setTimeout(() => setBeat(0), 1500);
    const t2 = window.setTimeout(() => setCelebrate(false), 4000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  const enter = () => {
    markCompleted();
    router.push("/village");
  };

  return (
    <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4">
      {celebrate ? <Confetti count={90} /> : null}

      {/* ---------------------------------------------------------- headline */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="inline-block rounded-pill border-2 border-panel-ink/60 bg-panel-ink/70 px-3.5 py-1 font-ui text-[10px] font-black uppercase tracking-[0.3em] text-gold-light backdrop-blur-sm sm:text-xs">
          Your realm is built
        </p>
        <h1 className="text-outline mt-2 text-4xl sm:text-6xl">
          {player.realmName}
        </h1>
      </motion.div>

      {/* ------------------------------------------------------- camera fly-in */}
      <motion.div
        initial={{ scale: 1.9, y: 130, opacity: 0, rotateX: 28 }}
        animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
        transition={{ duration: 1.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="relative mt-4 w-full"
        style={{ perspective: 1200 }}
      >
        <div className="relative mx-auto w-[min(90vw,620px)]">
          <FloatingIsland width={620} id="enterIsle" className="w-full drop-shadow-chunk" />

          {/* The player's actual seeded buildings, fanned across the grass cap.
              Centring uses marginLeft rather than translateX: Framer Motion
              writes its own `transform` for the drop-in and would wipe it. */}
          <div className="pointer-events-none absolute inset-0">
            {buildings
              .filter((b) => b.status !== "LOCKED")
              .slice(0, 5)
              .map((b, i, arr) => {
                const n = arr.length;
                const t = n === 1 ? 0.5 : i / (n - 1);
                // Grass cap spans ~22%–78% horizontally; stagger rows so the
                // silhouettes don't collide.
                const left = 24 + t * 52;
                const top = 17 + (i % 2) * 8;

                return (
                  <motion.div
                    key={b.id}
                    initial={{ y: -90, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 1.1 + i * 0.12,
                      type: "spring",
                      stiffness: 220,
                      damping: 15,
                    }}
                    className="absolute w-[19%]"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      marginLeft: "-9.5%",
                    }}
                  >
                    <BuildingArt type={b.type} level={b.level} width={120} />
                  </motion.div>
                );
              })}
          </div>
        </div>
      </motion.div>

      {/* ------------------------------------------------- guardian tutorial */}
      <div className="relative mt-6 w-full">
        <AnimatePresence mode="wait">
          {beat >= 0 ? (
            <motion.div
              key={beat}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="mx-auto flex max-w-2xl items-end gap-2 sm:gap-4"
            >
              {/* guardian portrait */}
              <div className="shrink-0">
                <GuardianArt
                  id={player.guardian}
                  width={132}
                  className="h-auto w-[86px] drop-shadow-chunk sm:w-[120px]"
                />
              </div>

              {/* speech panel */}
              <div className="panel-wood relative flex-1 p-3.5 sm:p-4">
                {/* tail pointing at the guardian */}
                <span className="absolute -left-2.5 bottom-8 h-5 w-5 rotate-45 border-b-[5px] border-l-[5px] border-wood-dark bg-tan-base" />

                <div className="relative flex items-center gap-2">
                  <span className="text-lg leading-none">{TUTORIAL[beat].emoji}</span>
                  <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-wood-mid">
                    {guardian.name} · {beat + 1} of {TUTORIAL.length}
                  </p>
                </div>

                <h2 className="text-outline-xs relative mt-1 text-lg leading-tight sm:text-2xl">
                  {TUTORIAL[beat].title}
                </h2>
                <p className="relative mt-1.5 font-body text-sm font-semibold leading-snug text-wood-deep sm:text-base">
                  {TUTORIAL[beat].body}
                </p>

                <div className="relative mt-3 flex items-center justify-between gap-3">
                  {/* beat pips */}
                  <span className="flex gap-1.5">
                    {TUTORIAL.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-2 w-2 rounded-full border-2",
                          i === beat
                            ? "border-gold-deep bg-gold-light"
                            : i < beat
                              ? "border-gem-deep bg-gem-base"
                              : "border-wood-dark/30 bg-tan-mid",
                        )}
                      />
                    ))}
                  </span>

                  {beat < TUTORIAL.length - 1 ? (
                    <Button
                      tone="stone"
                      size="sm"
                      onClick={() => setBeat((b) => b + 1)}
                    >
                      Got it →
                    </Button>
                  ) : (
                    <Button tone="gold" size="md" sfx="whoosh" onClick={enter}>
                      ⚔️ Enter your realm
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* skip affordance while the fly-in plays */}
        {beat < 0 ? (
          <div className="flex justify-center">
            <Button tone="stone" size="sm" onClick={() => setBeat(0)}>
              Skip intro
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
