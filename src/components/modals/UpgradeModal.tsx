"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Badge";
import { BuildingArt, tierFor } from "@/components/art/Buildings";
import { GoldCoinSvg, ElixirFlaskSvg } from "@/components/art/ResourceIcons";
import { useGame } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import {
  BUILDINGS,
  upgradeCost,
  upgradeElixirCost,
  upgradeXpRequired,
} from "@/lib/game-config";
import { cn, fmt } from "@/lib/utils";
import { play } from "@/lib/audio";

/**
 * Building upgrade flow with a hammer-strike animation.
 *
 * The strike sequence is purely presentational — the store mutation happens
 * immediately, and the animation plays over the top so the reveal feels earned.
 */
export function UpgradeModal() {
  const modal = useUi((s) => s.modal);
  const target = useUi((s) => s.modalTarget);
  const closeModal = useUi((s) => s.closeModal);

  const building = useGame((s) =>
    target ? s.buildings.find((b) => b.type === target) : undefined,
  );
  const resources = useGame((s) => s.player.resources);
  const upgradeBuilding = useGame((s) => s.upgradeBuilding);
  const triggerShake = useGame((s) => s.triggerShake);

  const [striking, setStriking] = useState(false);
  const [justUpgraded, setJustUpgraded] = useState<number | null>(null);

  const open = modal === "upgrade" && Boolean(building);
  if (!building || !target) {
    return (
      <Modal open={false} onClose={closeModal} title="Upgrade">
        <span />
      </Modal>
    );
  }

  const meta = BUILDINGS[target];
  const maxed = building.level >= meta.maxLevel;
  const goldCost = upgradeCost(building.level);
  const elixirCost = upgradeElixirCost(building.level);
  const xpNeed = upgradeXpRequired(building.level);

  const shortGold = resources.gold < goldCost;
  const shortElixir = resources.elixir < elixirCost;
  const affordable = !shortGold && !shortElixir;

  const tierNow = tierFor(building.level);
  const tierNext = tierFor(building.level + 1);
  const visualChange = tierNext !== tierNow;

  const doUpgrade = () => {
    if (maxed || !affordable || striking) return;

    setStriking(true);
    play("hammer");
    window.setTimeout(() => play("hammer"), 210);
    window.setTimeout(() => play("hammer"), 420);

    window.setTimeout(() => {
      const ok = upgradeBuilding(target);
      if (ok) {
        play("upgrade");
        triggerShake();
        setJustUpgraded(building.level + 1);
      }
      setStriking(false);
    }, 660);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setJustUpgraded(null);
        closeModal();
      }}
      title={`Upgrade ${meta.name}`}
      subtitle={meta.domain}
      icon="🔨"
      size="sm"
      footer={
        maxed ? (
          <Button tone="stone" size="lg" fullWidth onClick={closeModal}>
            Maximum level reached
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button tone="stone" size="lg" onClick={closeModal} className="min-w-[92px]">
              Later
            </Button>
            <Button
              tone="gem"
              size="lg"
              sfx={null}
              fullWidth
              disabled={!affordable || striking}
              onClick={doUpgrade}
            >
              {striking ? "Building…" : affordable ? "🔨 Upgrade" : "Not enough"}
            </Button>
          </div>
        )
      }
    >
      {/* --------------------------------------------------- before / after */}
      <div className="relative flex items-center justify-center gap-3 rounded-chunk border-[3px] border-wood-dark/30 bg-[radial-gradient(ellipse_at_50%_20%,#F6E3C4,#D9AE79)] py-4">
        {/* current */}
        <div className="flex flex-col items-center gap-1">
          <BuildingArt type={target} level={building.level} width={104} />
          <span className="rounded-pill border-2 border-wood-dark/40 bg-tan-mid px-2 py-0.5 font-ui text-[10px] font-black uppercase tracking-wide text-wood-deep">
            Lv {building.level}
          </span>
        </div>

        {/* arrow / hammer */}
        <div className="relative flex w-12 shrink-0 flex-col items-center">
          {striking ? (
            <span className="origin-bottom animate-hammer-strike text-3xl">🔨</span>
          ) : (
            <span className="text-2xl text-wood-mid">→</span>
          )}
        </div>

        {/* next */}
        <div className="flex flex-col items-center gap-1">
          <div className={cn(!maxed && "animate-pulse-glow")}>
            <BuildingArt
              type={target}
              level={Math.min(meta.maxLevel, building.level + 1)}
              width={104}
              dim={!affordable && !maxed}
            />
          </div>
          <span className="rounded-pill border-2 border-gem-deep bg-gem-gradient px-2 py-0.5 font-ui text-[10px] font-black uppercase tracking-wide text-[#0C4A14]">
            Lv {Math.min(meta.maxLevel, building.level + 1)}
          </span>
        </div>

        {visualChange && !maxed ? (
          <span className="absolute right-2 top-2">
            <Chip tone="elixir">✨ New look</Chip>
          </span>
        ) : null}

        {/* strike sparks */}
        <AnimatePresence>
          {striking ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0"
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="absolute h-1.5 w-1.5 animate-float-up rounded-full bg-gold-light"
                  style={{
                    left: `${44 + (i % 3) * 6}%`,
                    top: "46%",
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------- stats */}
      <div className="mt-4 flex flex-col gap-2.5">
        {/* building xp toward the next level */}
        <div className="rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
              Building XP
            </span>
            <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
              {fmt(building.xp)} / {fmt(xpNeed)}
            </span>
          </div>
          <ProgressBar value={building.xp} max={xpNeed} tone="xp" size="sm" />
          <p className="mt-1.5 font-body text-[11px] font-semibold text-wood-mid">
            Completing {meta.name.toLowerCase()} quests also levels this up for free.
          </p>
        </div>

        {/* cost */}
        {!maxed ? (
          <div className="flex flex-col gap-2">
            <span className="font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
              Upgrade cost
            </span>
            <CostRow
              icon={<GoldCoinSvg size={18} />}
              label="Gold"
              cost={goldCost}
              have={resources.gold}
              short={shortGold}
            />
            {elixirCost > 0 ? (
              <CostRow
                icon={<ElixirFlaskSvg size={18} />}
                label="Elixir"
                cost={elixirCost}
                have={resources.elixir}
                short={shortElixir}
              />
            ) : null}
          </div>
        ) : null}

        <p className="font-body text-xs font-semibold leading-snug text-wood-mid">
          {meta.blurb}
        </p>
      </div>

      {/* ------------------------------------------------------ success flash */}
      <AnimatePresence>
        {justUpgraded !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 grid place-items-center bg-panel-ink/70 backdrop-blur-sm"
          >
            {/* Sibling scrim — see the note in QuestModal's RewardBurst. */}
            <div
              aria-hidden="true"
              onClick={() => setJustUpgraded(null)}
              className="absolute inset-0 cursor-default"
            />
            <motion.div
              initial={{ scale: 0.6, rotate: -4 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
              className="panel-wood relative w-[min(88%,320px)] p-5 text-center"
            >
              <p className="font-ui text-[11px] font-black uppercase tracking-[0.28em] text-wood-mid">
                Construction complete
              </p>
              <div className="my-3 flex justify-center">
                <BuildingArt type={target} level={justUpgraded} width={128} />
              </div>
              <h3 className="text-outline-sm text-2xl leading-tight">
                {meta.name}
              </h3>
              <p className="text-outline-xs mt-0.5 text-lg text-gold-light">
                Level {justUpgraded}
              </p>
              <div className="mt-4">
                <Button
                  tone="gold"
                  size="md"
                  fullWidth
                  onClick={() => setJustUpgraded(null)}
                >
                  Nice
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Modal>
  );
}

function CostRow({
  icon,
  label,
  cost,
  have,
  short,
}: {
  icon: React.ReactNode;
  label: string;
  cost: number;
  have: number;
  short: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-chunk border-2 px-3 py-2",
        short
          ? "border-danger/50 bg-danger/12"
          : "border-wood-dark/25 bg-tan-light/70",
      )}
    >
      {icon}
      <span className="flex-1 font-ui text-[11px] font-black uppercase tracking-wider text-wood-mid">
        {label}
      </span>
      <span
        className={cn(
          "font-display text-base tabular-nums",
          short ? "text-danger" : "text-wood-deep",
        )}
      >
        {fmt(cost)}
      </span>
      <span className="font-ui text-[10px] font-bold tabular-nums text-wood-mid/60">
        have {fmt(have)}
      </span>
    </div>
  );
}
