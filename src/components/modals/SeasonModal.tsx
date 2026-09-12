"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Badge";
import { useGame } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import { SEASON, SEASON_TIERS } from "@/lib/game-config";
import { cn, fmt, timeUntil } from "@/lib/utils";

/** Season reward track, gated on Consistency Trophies. */
export function SeasonModal() {
  const modal = useUi((s) => s.modal);
  const closeModal = useUi((s) => s.closeModal);
  const openModal = useUi((s) => s.openModal);

  const trophies = useGame((s) => s.player.trophies);
  const epicQuest = useGame((s) => s.epicQuest);

  const unlocked = SEASON_TIERS.filter((t) => trophies >= t.trophies);
  const nextTier = SEASON_TIERS.find((t) => trophies < t.trophies);
  const currentTier = unlocked.length;

  return (
    <Modal
      open={modal === "season"}
      onClose={closeModal}
      title={SEASON.name}
      subtitle={`Ends in ${timeUntil(SEASON.endsAt)} · rewards unlock with trophies`}
      icon="★"
      size="md"
      footer={
        <div className="flex gap-2">
          <Button tone="stone" size="lg" onClick={closeModal} className="min-w-[92px]">
            Close
          </Button>
          <Button tone="gold" size="lg" fullWidth onClick={() => openModal("quests")}>
            📜 Earn trophies
          </Button>
        </div>
      }
    >
      {/* --------------------------------------------------------- season goal */}
      {epicQuest ? (
        <div className="mb-4 rounded-chunk border-[3px] border-wood-dark/35 bg-[linear-gradient(160deg,#FFE9B0,#D9AE79)] p-3.5">
          <Chip tone="elixir">★ Your season objective</Chip>
          <p className="text-outline-xs mt-1.5 text-lg leading-tight sm:text-xl">
            {epicQuest.title}
          </p>
          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-ui text-[10px] font-black uppercase tracking-wider text-wood-mid">
                Progress
              </span>
              <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
                {epicQuest.completedValue}%
              </span>
            </div>
            <ProgressBar value={epicQuest.completedValue} max={100} tone="gold" size="md" />
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------------ progress */}
      <div className="mb-4 rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
            Tier {currentTier} of {SEASON_TIERS.length}
          </span>
          <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
            {fmt(trophies)} trophies
          </span>
        </div>
        <ProgressBar
          value={currentTier}
          max={SEASON_TIERS.length}
          tone="gold"
          size="md"
        />
        {nextTier ? (
          <p className="mt-1.5 font-body text-[11px] font-semibold text-wood-mid">
            {fmt(nextTier.trophies - trophies)} more trophies for{" "}
            <span className="font-display">{nextTier.reward}</span>
          </p>
        ) : (
          <p className="mt-1.5 font-display text-sm text-wood-deep">
            Full track cleared. Legend behaviour.
          </p>
        )}
      </div>

      {/* --------------------------------------------------------- reward track */}
      <div className="relative flex flex-col gap-1.5">
        {/* vertical rail */}
        <span className="pointer-events-none absolute bottom-4 left-[26px] top-4 w-1 rounded-pill bg-wood-dark/20" />

        {SEASON_TIERS.map((t) => {
          const claimed = trophies >= t.trophies;
          const isNext = nextTier?.tier === t.tier;

          return (
            <div
              key={t.tier}
              className={cn(
                "relative flex items-center gap-3 rounded-chunk border-2 py-2 pl-1.5 pr-3",
                claimed
                  ? "border-gem-deep/45 bg-gem-base/12"
                  : isNext
                    ? "border-gold-deep/60 bg-gold-base/15"
                    : "border-wood-dark/20 bg-tan-light/55",
              )}
            >
              {/* tier node */}
              <span
                className={cn(
                  "relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[3px] text-lg",
                  claimed
                    ? "border-gem-deep bg-gem-gradient"
                    : isNext
                      ? "border-gold-deep bg-gold-gradient"
                      : "border-wood-dark/30 bg-tan-mid",
                )}
              >
                {t.emoji}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-ui text-[9px] font-black uppercase tracking-wider text-wood-mid">
                    Tier {t.tier}
                  </span>
                  {t.premium ? <Chip tone="elixir">Legend</Chip> : null}
                  {claimed ? <Chip tone="gem">Unlocked</Chip> : null}
                </div>
                <p
                  className={cn(
                    "truncate font-display text-sm sm:text-base",
                    claimed ? "text-wood-deep" : "text-wood-mid",
                  )}
                >
                  {t.reward}
                </p>
              </div>

              <span
                className={cn(
                  "shrink-0 font-ui text-[11px] font-black tabular-nums",
                  claimed ? "text-gem-dark" : "text-wood-mid/60",
                )}
              >
                {claimed ? "✓" : fmt(t.trophies)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center font-ui text-[10px] font-bold uppercase tracking-wider text-wood-mid/55">
        Every tier is cosmetic. Nothing on this track makes you stronger.
      </p>
    </Modal>
  );
}
