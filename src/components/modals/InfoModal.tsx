"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Badge";
import { BuildingArt } from "@/components/art/Buildings";
import { GuardianArt } from "@/components/art/Guardians";
import { useGame } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import {
  BUILDINGS,
  guardianById,
  upgradeXpRequired,
  upgradeCost,
} from "@/lib/game-config";
import { fmt } from "@/lib/utils";

/** Building detail sheet — what it represents and how to grow it. */
export function InfoModal() {
  const modal = useUi((s) => s.modal);
  const target = useUi((s) => s.modalTarget);
  const closeModal = useUi((s) => s.closeModal);
  const openModal = useUi((s) => s.openModal);

  const building = useGame((s) =>
    target ? s.buildings.find((b) => b.type === target) : undefined,
  );
  const quests = useGame((s) => s.quests);
  const streak = useGame((s) => s.player.streak);

  if (!building || !target) {
    return (
      <Modal open={false} onClose={closeModal} title="Building">
        <span />
      </Modal>
    );
  }

  const meta = BUILDINGS[target];
  const guardian = meta.guardian ? guardianById(meta.guardian) : null;
  const related = quests.filter((q) => q.building === target);
  const openCount = related.filter((q) => q.status !== "COMPLETED").length;
  const xpNeed = upgradeXpRequired(building.level);

  return (
    <Modal
      open={modal === "info"}
      onClose={closeModal}
      title={meta.name}
      subtitle={meta.domain}
      icon="ℹ️"
      size="sm"
      footer={
        <div className="flex gap-2">
          <Button tone="stone" size="lg" onClick={closeModal} className="min-w-[92px]">
            Close
          </Button>
          <Button
            tone="gold"
            size="lg"
            fullWidth
            onClick={() => openModal("quests", target)}
          >
            📜 {openCount ? `${openCount} quests` : "View quests"}
          </Button>
        </div>
      }
    >
      {/* ------------------------------------------------------------ portrait */}
      <div className="relative flex items-end justify-center gap-2 overflow-hidden rounded-chunk border-[3px] border-wood-dark/30 bg-[radial-gradient(ellipse_at_50%_18%,#F6E3C4,#C99B6B)] pb-2 pt-4">
        <BuildingArt
          type={target}
          level={building.level}
          width={150}
          streakLit={streak > 0}
        />
        {guardian ? (
          <GuardianArt id={guardian.id} width={92} className="mb-1" />
        ) : null}
        <span className="absolute left-2 top-2">
          <Chip tone="gold">Level {building.level}</Chip>
        </span>
        <span className="absolute right-2 top-2">
          <Chip tone="stone">Max {meta.maxLevel}</Chip>
        </span>
      </div>

      {/* --------------------------------------------------------------- copy */}
      <p className="mt-3 font-body text-sm font-semibold leading-relaxed text-wood-deep">
        {meta.blurb}
      </p>

      {guardian ? (
        <div className="mt-3 rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 p-3">
          <p className="font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
            Guardian
          </p>
          <p className="text-outline-xs mt-0.5 text-base">{guardian.name}</p>
          <p className="mt-0.5 font-body text-xs font-semibold text-wood-mid">
            {guardian.blurb}
          </p>
        </div>
      ) : null}

      {/* -------------------------------------------------------------- stats */}
      <div className="mt-3 flex flex-col gap-2">
        <div className="rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 p-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
              Progress to level {building.level + 1}
            </span>
            <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
              {fmt(building.xp)} / {fmt(xpNeed)}
            </span>
          </div>
          <ProgressBar value={building.xp} max={xpNeed} tone="xp" size="sm" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MiniStat label="Open quests" value={String(openCount)} />
          <MiniStat label="Next upgrade" value={`${fmt(upgradeCost(building.level))} gold`} />
        </div>
      </div>

      {/* accessible position readout — useful with the canvas, per NFR-6 */}
      <p className="mt-3 font-ui text-[10px] font-bold uppercase tracking-wider text-wood-mid/55">
        Plot {building.x}, {building.y} · status {building.status.toLowerCase()}
      </p>
    </Modal>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 px-3 py-2 text-center">
      <p className="font-ui text-[9px] font-black uppercase tracking-wider text-wood-mid">
        {label}
      </p>
      <p className="font-display text-base tabular-nums text-wood-deep">{value}</p>
    </div>
  );
}
