"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useOnboarding, TOTAL_STEPS } from "@/store/onboarding-store";
import { WizardProgress } from "./WizardChrome";
import { Step1Realm } from "./steps/Step1Realm";
import { Step2Pillars } from "./steps/Step2Pillars";
import { Step3Consistency } from "./steps/Step3Consistency";
import { Step4Nemesis } from "./steps/Step4Nemesis";
import { Step5Time } from "./steps/Step5Time";
import { Step6Goal } from "./steps/Step6Goal";
import { Step7Forge } from "./steps/Step7Forge";
import { Step8Enter } from "./steps/Step8Enter";
import { Button } from "@/components/ui/Button";
import { SkyBackdrop } from "@/components/landing/SkyBackdrop";
import { useGame } from "@/store/game-store";
import { play } from "@/lib/audio";

/** Horizontal slide — direction follows travel through the wizard. */
const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 220 : -220, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -220 : 220, opacity: 0, scale: 0.97 }),
};

export function Wizard() {
  const { step, next, back, canAdvance, goto } = useOnboarding();
  // Persisted answers rehydrate in an effect (see StoreHydrator). Rendering the
  // inputs before that lands lets a fast typist have their text overwritten by
  // the incoming stored value, so the form waits for the flag.
  const hydrated = useGame((s) => s.hydrated);
  const mode = useGame((s) => s.mode);
  const seeded = useGame((s) => s.seeded);
  const router = useRouter();
  const isQuestion = step <= 6;

  // A signed-in player who already has a realm shouldn't be able to wander back
  // into the wizard and accidentally re-seed. Send them to the village; a real
  // restart goes through Settings → Reset.
  useEffect(() => {
    if (hydrated && mode === "server" && seeded && step === 1) {
      router.replace("/village");
    }
  }, [hydrated, mode, seeded, step, router]);

  /* Enter advances, Escape steps back — keyboard users shouldn't need the mouse. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isQuestion) return;
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";

      if (e.key === "Enter" && canAdvance()) {
        // In a text field, Enter should still advance — it's a one-field step.
        e.preventDefault();
        play("tap");
        next();
      }
      if (e.key === "Escape" && !typing && step > 1) {
        play("back");
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isQuestion, canAdvance, next, back, step]);

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <SkyBackdrop />

      {/* grass horizon at the base so the wizard sits in the world */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-grass-gradient">
        <div className="h-2 w-full bg-grass-light/70" />
      </div>

      {/* -------------------------------------------------------------- header */}
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
        <Link
          href="/"
          onClick={() => play("back")}
          className="flex items-center gap-2 rounded-pill border-2 border-panel-ink/60 bg-panel-base/80 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-panel-base"
        >
          <span className="grid h-6 w-6 place-items-center rounded-lg border-2 border-gold-deep bg-gold-gradient text-[11px]">
            ⚡
          </span>
          <span className="font-logo text-sm text-cream">
            Life<span className="text-gold-light">Clash</span>
          </span>
        </Link>

        {isQuestion ? (
          <button
            onClick={() => {
              play("whoosh");
              goto(7);
            }}
            className="rounded-pill border-2 border-panel-ink/60 bg-panel-base/70 px-3 py-1.5 font-ui text-[10px] font-black uppercase tracking-wider text-cream/70 backdrop-blur-sm transition-colors hover:text-cream sm:text-xs"
          >
            Skip setup →
          </button>
        ) : null}
      </header>

      {/* ------------------------------------------------------------ progress */}
      {step <= 7 ? (
        <div className="relative z-20 pt-5 sm:pt-7">
          <WizardProgress step={step} />
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- body */}
      <div className="relative z-10 flex flex-1 items-center justify-center py-7 sm:py-10">
        {!hydrated ? (
          <div className="panel-wood flex w-full max-w-2xl flex-col items-center gap-3 px-6 py-16">
            <span className="grid h-12 w-12 animate-pulse-glow place-items-center rounded-xl border-[3px] border-wood-dark bg-gold-gradient text-2xl">
              ⚒
            </span>
            <p className="text-outline-xs text-lg">Waking the forge…</p>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={step}
              custom={1}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              {step === 1 ? <Step1Realm /> : null}
              {step === 2 ? <Step2Pillars /> : null}
              {step === 3 ? <Step3Consistency /> : null}
              {step === 4 ? <Step4Nemesis /> : null}
              {step === 5 ? <Step5Time /> : null}
              {step === 6 ? <Step6Goal /> : null}
              {step === 7 ? <Step7Forge onDone={() => goto(8)} /> : null}
              {step === 8 ? <Step8Enter /> : null}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* -------------------------------------------------------- nav footer */}
      {/* A dark HUD bar keeps the chunky buttons legible over the grass. */}
      {isQuestion ? (
        <div className="relative z-20 border-t-[4px] border-panel-ink bg-[linear-gradient(180deg,rgba(32,40,43,.94),rgba(14,21,23,.97))] backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-4">
            <Button
              tone="stone"
              size="lg"
              sfx="back"
              onClick={back}
              disabled={step === 1}
              className="min-w-[104px]"
            >
              ← Back
            </Button>

            <span className="hidden flex-1 text-center font-ui text-[10px] font-bold uppercase tracking-widest text-cream/35 sm:block">
              Enter to continue · Esc to go back
            </span>

            <Button
              tone="gold"
              size="lg"
              onClick={next}
              disabled={!canAdvance()}
              className="min-w-[150px] flex-1 sm:flex-none"
            >
              {step === 6 ? "⚒️ Forge my world" : "Next →"}
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export { TOTAL_STEPS };
