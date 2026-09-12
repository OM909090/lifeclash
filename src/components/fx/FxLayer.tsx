"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/store/game-store";
import { Confetti } from "./Confetti";
import { LeagueBadge } from "@/components/art/LeagueBadge";
import { Button } from "@/components/ui/Button";
import { leagueById } from "@/lib/game-config";
import { cn } from "@/lib/utils";
import type { FloatingFx, LeagueId } from "@/types/game";

const TONE: Record<FloatingFx["tone"], string> = {
  xp: "text-[#8BEF4F]",
  gold: "text-gold-light",
  elixir: "text-elixir-light",
  gem: "text-gem-light",
  damage: "text-[#FF8A7A]",
  trophy: "text-gold-glow",
};

const SUFFIX: Record<FloatingFx["tone"], string> = {
  xp: "XP",
  gold: "",
  elixir: "",
  gem: "",
  damage: "DMG",
  trophy: "🏆",
};

/**
 * Fixed overlay for all transient game feedback:
 *   · floating "+100 XP" particles at the point of interaction
 *   · the level-up / promotion celebration card
 *
 * Screen shake is applied by <ShakeWrapper/> instead, because it needs to
 * transform the game content rather than an overlay.
 */
export function FxLayer() {
  const fx = useGame((s) => s.fx);
  const celebration = useGame((s) => s.celebration);
  const dismissCelebration = useGame((s) => s.dismissCelebration);
  const notice = useGame((s) => s.notice);

  return (
    <>
      {/* ------------------------------------------------------------- toast */}
      <AnimatePresence>
        {notice ? (
          <motion.div
            initial={{ opacity: 0, y: -24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -24, x: "-50%" }}
            className={cn(
              "fixed left-1/2 top-3 z-[130] flex items-center gap-2 rounded-pill border-2 px-4 py-2 font-ui text-xs font-black shadow-panel backdrop-blur-sm",
              notice.tone === "error"
                ? "border-[#7A1B1B] bg-danger/90 text-white"
                : "border-gem-deep bg-gem-base/90 text-[#0C4A14]",
            )}
          >
            <span>{notice.tone === "error" ? "⚠️" : "✓"}</span>
            {notice.message}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ------------------------------------------------ floating particles */}
      <div className="pointer-events-none fixed inset-0 z-[110] overflow-hidden">
        <AnimatePresence>
          {fx.map((f) => (
            <motion.span
              key={f.id}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, y: -78, scale: 1.1 }}
              exit={{ opacity: 0, y: -104, scale: 0.9 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className={cn(
                "absolute -translate-x-1/2 whitespace-nowrap font-display text-xl sm:text-2xl",
                TONE[f.tone],
              )}
              style={{
                left: f.x,
                top: f.y,
                textShadow:
                  "0 2px 0 rgba(42,22,8,.9), 0 0 14px rgba(255,255,255,.4)",
                WebkitTextStroke: "2px #2A1608",
                paintOrder: "stroke fill",
              }}
            >
              {f.label} {SUFFIX[f.tone]}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------- celebration */}
      <AnimatePresence>
        {celebration ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[115] grid place-items-center p-4"
          >
            <Confetti count={110} />
            <div
              aria-hidden="true"
              className="absolute inset-0 cursor-default bg-panel-ink/55 backdrop-blur-[2px]"
              onClick={dismissCelebration}
            />

            <motion.div
              initial={{ scale: 0.55, y: 40, rotate: -3 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 16 }}
              className="panel-wood relative w-full max-w-sm overflow-hidden p-6 text-center"
            >
              {/* radiating sunburst */}
              <span
                className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 opacity-25"
                style={{
                  background:
                    "conic-gradient(from 0deg, #FFD447 0deg 12deg, transparent 12deg 30deg, #FFD447 30deg 42deg, transparent 42deg 60deg, #FFD447 60deg 72deg, transparent 72deg 90deg, #FFD447 90deg 102deg, transparent 102deg 120deg, #FFD447 120deg 132deg, transparent 132deg 150deg, #FFD447 150deg 162deg, transparent 162deg 180deg, #FFD447 180deg 192deg, transparent 192deg 210deg, #FFD447 210deg 222deg, transparent 222deg 240deg, #FFD447 240deg 252deg, transparent 252deg 270deg, #FFD447 270deg 282deg, transparent 282deg 300deg, #FFD447 300deg 312deg, transparent 312deg 330deg, #FFD447 330deg 342deg, transparent 342deg 360deg)",
                }}
              />

              <p className="relative font-ui text-[11px] font-black uppercase tracking-[0.3em] text-wood-mid">
                Level up
              </p>

              <motion.p
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.12, type: "spring", stiffness: 300, damping: 12 }}
                className="text-outline relative my-1 text-7xl leading-none"
              >
                {celebration.level}
              </motion.p>

              <p className="relative font-body text-base font-bold text-wood-deep">
                Your realm grows stronger.
              </p>

              {celebration.league ? (
                <div className="relative mt-4 flex items-center justify-center gap-3 rounded-chunk border-[3px] border-gold-deep bg-gold-base/30 p-3">
                  <LeagueBadge league={celebration.league as LeagueId} size={46} />
                  <div className="text-left">
                    <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-wood-mid">
                      Promoted
                    </p>
                    <p className="text-outline-xs text-lg">
                      {leagueById(celebration.league as LeagueId).name} League
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="relative mt-5">
                <Button tone="gold" size="lg" fullWidth onClick={dismissCelebration}>
                  Keep building
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/**
 * Wraps the game content and shakes it when the store's shake counter bumps.
 * A key change restarts the CSS animation, which is simpler and smoother than
 * driving a spring from React state.
 */
export function ShakeWrapper({ children }: { children: React.ReactNode }) {
  const shake = useGame((s) => s.shake);
  return (
    <div key={shake} className={shake > 0 ? "h-full animate-shake" : "h-full"}>
      {children}
    </div>
  );
}
