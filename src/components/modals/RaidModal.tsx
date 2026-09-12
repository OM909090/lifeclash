"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Badge";
import { DragonSvg } from "@/components/art/Dragon";
import { GemSvg, TrophySvg } from "@/components/art/ResourceIcons";
import { useGame } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import { MOCK_CLAN } from "@/lib/mock-social";
import { cn, fmt, pct, timeUntil } from "@/lib/utils";
import { play } from "@/lib/audio";

/**
 * The weekly co-op raid on the Procrastination Dragon.
 *
 * Per LIFECLASH-SPEC.md §FR-5.7 there is no "attack" button that grants damage
 * directly — damage is derived from completed quests, which is what makes the
 * boss a real-life pressure device rather than a tap-to-win. The CTA therefore
 * routes to the quest board.
 */
export function RaidModal() {
  const modal = useUi((s) => s.modal);
  const closeModal = useUi((s) => s.closeModal);
  const openModal = useUi((s) => s.openModal);

  const raid = useGame((s) => s.raid);
  const quests = useGame((s) => s.quests);
  const player = useGame((s) => s.player);

  const [hurt, setHurt] = useState(false);

  const open = modal === "raid";
  const hpPct = pct(raid.currentHp, raid.maxHp);
  const defeated = raid.currentHp <= 0;
  const pending = quests.filter((q) => q.status !== "COMPLETED");
  const potential = pending.reduce((sum, q) => sum + q.damage, 0);

  // Contribution board: the live player against mock clanmates.
  const contributors = [
    { name: "Aarav", crest: "🐉", damage: 9_840 },
    { name: "Ishita", crest: "🦉", damage: 8_120 },
    { name: player.displayName || "You", crest: player.crest, damage: raid.yourDamage, isYou: true },
    { name: "Kabir", crest: "🦅", damage: 6_450 },
    { name: "Meera", crest: "🐺", damage: 5_210 },
    { name: "Sana", crest: "🐝", damage: 3_980 },
  ].sort((a, b) => b.damage - a.damage);

  return (
    <Modal
      open={open}
      onClose={closeModal}
      title={defeated ? "Dragon Defeated" : raid.name}
      subtitle={
        defeated
          ? "The realm breathes easier. A new beast wakes next week."
          : `Weekly raid · ends in ${timeUntil(raid.endsAt)}`
      }
      icon="⚔️"
      size="md"
      tone="dark"
      footer={
        <div className="flex gap-2">
          <Button tone="stone" size="lg" onClick={closeModal} className="min-w-[92px]">
            Close
          </Button>
          <Button
            tone="gold"
            size="lg"
            fullWidth
            onClick={() => openModal("quests")}
          >
            📜 Attack with a quest
          </Button>
        </div>
      }
    >
      {/* ---------------------------------------------------------- the beast */}
      <div className="relative overflow-hidden rounded-chunk border-[3px] border-panel-ink bg-[radial-gradient(ellipse_at_50%_15%,#4A3466_0%,#241539_55%,#150B24_100%)] p-4">
        {/* smoke haze */}
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute left-1/2 top-1/3 h-48 w-72 -translate-x-1/2 rounded-full bg-dragon-accent/20 blur-3xl" />
        </div>

        <div className="relative flex justify-center">
          <button
            onClick={() => {
              play("dragonRoar");
              setHurt(true);
              window.setTimeout(() => setHurt(false), 620);
            }}
            aria-label="Provoke the dragon"
            className="transition-transform hover:scale-[1.03]"
          >
            <div className={cn(!defeated && "animate-bob-slow")}>
              <DragonSvg width={300} hurt={hurt} defeated={defeated} />
            </div>
          </button>
        </div>

        <p className="relative mt-1 text-center font-body text-xs font-semibold italic text-cream/60">
          {defeated ? "“…fine. You win. This week.”" : `“${raid.title}”`}
        </p>

        {/* HP bar */}
        <div className="relative mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-elixir-light">
              Boss health
            </span>
            <span className="font-ui text-[11px] font-black tabular-nums text-cream/80">
              {fmt(Math.max(0, raid.currentHp))} / {fmt(raid.maxHp)}
            </span>
          </div>
          <ProgressBar
            value={Math.max(0, raid.currentHp)}
            max={raid.maxHp}
            tone="hp"
            size="lg"
            label={`${Math.round(hpPct)}%`}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatTile
          label="Your damage"
          value={fmt(raid.yourDamage)}
          tone="gold"
        />
        <StatTile label="Clan damage" value={fmt(raid.clanDamage)} tone="elixir" />
        <StatTile
          label="Pending swings"
          value={fmt(potential)}
          tone="gem"
          hint={`${pending.length} quests`}
        />
      </div>

      {/* ------------------------------------------------- how damage works */}
      <div className="mt-3 rounded-chunk border-2 border-white/10 bg-white/[0.04] p-3">
        <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-gold-light">
          How you deal damage
        </p>
        <p className="mt-1 font-body text-xs font-semibold leading-snug text-cream/70 sm:text-sm">
          There is no attack button. Every quest you finish in real life lands a
          hit — harder quests hit harder. Your whole clan chips at the same health
          bar, so a day you can&apos;t show up is a day someone else carries it.
        </p>
      </div>

      {/* ------------------------------------------------------ contribution */}
      <div className="mt-4">
        <p className="mb-2 font-ui text-[10px] font-black uppercase tracking-[0.2em] text-cream/60">
          {MOCK_CLAN.name} · damage board
        </p>
        <div className="flex flex-col gap-1.5">
          {contributors.map((c, i) => (
            <div
              key={c.name}
              className={cn(
                "flex items-center gap-2.5 rounded-chunk border-2 px-2.5 py-1.5",
                c.isYou
                  ? "border-gold-deep bg-gold-base/20"
                  : "border-panel-ink/60 bg-panel-ink/40",
              )}
            >
              <span className="w-5 text-center font-display text-sm text-cream/60 tabular-nums">
                {i + 1}
              </span>
              <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-panel-ink bg-tan-gradient text-base">
                {c.crest}
              </span>
              <span className="min-w-0 flex-1 truncate font-ui text-sm font-black text-cream">
                {c.name}
                {c.isYou ? (
                  <span className="ml-1.5 font-ui text-[9px] font-black uppercase text-gold-light">
                    you
                  </span>
                ) : null}
              </span>
              <span className="font-ui text-xs font-black tabular-nums text-[#FF8A7A]">
                {fmt(c.damage)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------- rewards */}
      <div className="mt-4 rounded-chunk border-2 border-gem-deep/40 bg-gem-base/10 p-3">
        <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-gem-light">
          Defeat rewards
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip tone="gem">
            <GemSvg size={12} /> 250 Gems
          </Chip>
          <Chip tone="gold">🪙 4,000 Gold</Chip>
          <Chip tone="ink">
            <TrophySvg size={12} /> 120 Trophies
          </Chip>
          <Chip tone="elixir">🗿 Dragonbone Decoration</Chip>
        </div>
      </div>
    </Modal>
  );
}

function StatTile({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: "gold" | "elixir" | "gem";
  hint?: string;
}) {
  const color = {
    gold: "border-gold-deep/40 bg-gold-base/15 text-gold-light",
    elixir: "border-elixir-deep/50 bg-elixir-base/15 text-elixir-light",
    gem: "border-gem-deep/45 bg-gem-base/12 text-gem-light",
  }[tone];

  return (
    <div className={cn("rounded-chunk border-2 px-2.5 py-2 text-center", color)}>
      <p className="font-ui text-[9px] font-black uppercase leading-tight tracking-wider opacity-75">
        {label}
      </p>
      <p className="font-display text-lg leading-tight tabular-nums sm:text-xl">
        {value}
      </p>
      {hint ? (
        <p className="font-ui text-[9px] font-bold opacity-55">{hint}</p>
      ) : null}
    </div>
  );
}
