"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Badge";
import { ClanMonumentSvg } from "@/components/art/Buildings";
import { LeagueBadge } from "@/components/art/LeagueBadge";
import { TrophySvg, FlameSvg } from "@/components/art/ResourceIcons";
import { useGame } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import { CLAN_FEED } from "@/lib/mock-social";
import { leagueFor } from "@/lib/game-config";
import { cn, fmt } from "@/lib/utils";
import { play } from "@/lib/audio";

const ROLE_TONE = {
  OWNER: "gold",
  LEADER: "elixir",
  OFFICER: "gem",
  MEMBER: "stone",
} as const;

/** Clan hub: the Monument, weekly goal, member roster, and activity feed. */
export function ClanModal() {
  const modal = useUi((s) => s.modal);
  const closeModal = useUi((s) => s.closeModal);
  const openModal = useUi((s) => s.openModal);

  const clan = useGame((s) => s.clan);
  const player = useGame((s) => s.player);

  const [tab, setTab] = useState<"monument" | "members" | "feed">("monument");
  const open = modal === "clan";

  // Splice the live player into the roster so their XP updates as they play.
  const members = clan.members
    .map((m) =>
      m.isYou
        ? {
            ...m,
            name: player.displayName || "You",
            crest: player.crest,
            level: player.level,
            trophies: player.trophies,
            streak: player.streak,
          }
        : m,
    )
    .sort((a, b) => b.weeklyXp - a.weeklyXp);

  return (
    <Modal
      open={open}
      onClose={closeModal}
      title={clan.name}
      subtitle={`${clan.tag} · ${members.length} members`}
      icon="🛡️"
      size="md"
      footer={
        <div className="flex gap-2">
          <Button tone="stone" size="lg" onClick={closeModal} className="min-w-[92px]">
            Close
          </Button>
          <Button tone="elixir" size="lg" fullWidth onClick={() => openModal("raid")}>
            ⚔️ Clan raid
          </Button>
        </div>
      }
    >
      {/* ------------------------------------------------------------- tabs */}
      <div className="mb-4 flex gap-1.5">
        {(
          [
            ["monument", "Monument"],
            ["members", "Members"],
            ["feed", "Activity"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              play("tap");
              setTab(id);
            }}
            className={cn(
              "flex-1 rounded-chunk border-[3px] px-3 py-2 font-display text-xs uppercase tracking-wide transition-all sm:text-sm",
              tab === id
                ? "-translate-y-0.5 border-wood-dark bg-gold-gradient text-wood-deep shadow-btn-gold-sm"
                : "border-wood-dark/30 bg-tan-light/60 text-wood-mid hover:bg-tan-light",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------- monument */}
      {tab === "monument" ? (
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center gap-4 overflow-hidden rounded-chunk border-[3px] border-wood-dark/30 bg-[radial-gradient(ellipse_at_50%_15%,#F6E3C4,#C99B6B)] p-4">
            <ClanMonumentSvg level={clan.monumentLevel} width={116} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <Chip tone="gem">Level {clan.monumentLevel}</Chip>
              <h3 className="text-outline-xs mt-1.5 text-lg leading-tight sm:text-xl">
                Clan Monument
              </h3>
              <p className="mt-0.5 font-body text-xs font-semibold text-wood-mid">
                Raised by everyone. Collective XP carves the next ring of stone.
              </p>
              <div className="mt-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-ui text-[10px] font-black uppercase tracking-wider text-wood-mid">
                    Monument XP
                  </span>
                  <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
                    {fmt(clan.monumentXp)} / {fmt(clan.monumentTarget)}
                  </span>
                </div>
                <ProgressBar
                  value={clan.monumentXp}
                  max={clan.monumentTarget}
                  tone="gem"
                  size="md"
                />
              </div>
            </div>
          </div>

          {/* weekly goal */}
          <div className="rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
                Weekly clan goal
              </span>
              <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
                {fmt(clan.weeklyXp)} / {fmt(clan.weeklyGoal)} XP
              </span>
            </div>
            <ProgressBar value={clan.weeklyXp} max={clan.weeklyGoal} tone="xp" size="md" />
            <p className="mt-1.5 font-body text-[11px] font-semibold text-wood-mid">
              {clan.weeklyXp >= clan.weeklyGoal
                ? "Goal cleared — rewards unlock at reset."
                : `${fmt(clan.weeklyGoal - clan.weeklyXp)} XP to go. Every quest counts.`}
            </p>
          </div>

          <p className="font-body text-xs font-semibold italic leading-snug text-wood-mid">
            {clan.description}
          </p>

          {/* unlocks */}
          <div className="rounded-chunk border-2 border-elixir-deep/30 bg-elixir-base/10 p-3">
            <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-elixir-dark">
              Next monument unlock
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip tone="elixir">🚩 Clan banner slot</Chip>
              <Chip tone="gold">🎨 Building skin: Stonecut</Chip>
              <Chip tone="gem">😄 Two new emotes</Chip>
            </div>
          </div>
        </div>
      ) : null}

      {/* --------------------------------------------------------- members */}
      {tab === "members" ? (
        <div className="flex flex-col gap-1.5">
          {members.map((m, i) => (
            <div
              key={m.id}
              className={cn(
                "flex items-center gap-2.5 rounded-chunk border-2 px-2.5 py-2",
                m.isYou
                  ? "border-gold-deep bg-gold-base/25"
                  : "border-wood-dark/25 bg-tan-light/70",
              )}
            >
              <span className="w-5 text-center font-display text-sm tabular-nums text-wood-mid">
                {i + 1}
              </span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-wood-dark/40 bg-tan-gradient text-lg">
                {m.crest}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm text-wood-deep sm:text-base">
                  {m.name}
                  {m.isYou ? (
                    <span className="ml-1.5 font-ui text-[9px] font-black uppercase text-gold-dark">
                      you
                    </span>
                  ) : null}
                </p>
                <div className="flex items-center gap-1.5">
                  <Chip tone={ROLE_TONE[m.role]} className="scale-90">
                    {m.role}
                  </Chip>
                  <span className="font-ui text-[10px] font-bold text-wood-mid">
                    Lv {m.level}
                  </span>
                </div>
              </div>
              <LeagueBadge league={leagueFor(m.trophies).id} size={24} className="hidden sm:flex" />
              <span className="hidden items-center gap-0.5 sm:flex">
                <FlameSvg size={13} lit={m.streak > 0} />
                <span className="font-ui text-[11px] font-black tabular-nums text-warn">
                  {m.streak}
                </span>
              </span>
              <span className="flex items-center gap-0.5">
                <TrophySvg size={13} />
                <span className="font-ui text-[11px] font-black tabular-nums text-gold-dark">
                  {fmt(m.trophies)}
                </span>
              </span>
              <span className="w-14 text-right font-ui text-xs font-black tabular-nums text-[#3C7A1E]">
                {fmt(m.weeklyXp)}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {/* ------------------------------------------------------------ feed */}
      {tab === "feed" ? (
        <div className="flex flex-col gap-1.5">
          {CLAN_FEED.map((f) => (
            <div
              key={f.id}
              className="flex items-start gap-2.5 rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 px-3 py-2"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-wood-dark/35 bg-tan-gradient text-base">
                {f.crest}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-body text-xs font-bold leading-snug text-wood-deep sm:text-sm">
                  <span className="font-display text-sm">{f.who}</span> {f.text}
                </p>
                <p className="font-ui text-[9px] font-bold uppercase tracking-wider text-wood-mid/60">
                  {f.when}
                </p>
              </div>
              {f.xp ? (
                <span className="shrink-0 rounded-pill border-2 border-[#3C7A1E]/40 bg-xp/20 px-1.5 py-0.5 font-ui text-[10px] font-black tabular-nums text-[#356E1A]">
                  +{f.xp} XP
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
