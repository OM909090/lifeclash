"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LeagueBadge } from "@/components/art/LeagueBadge";
import { TrophySvg, FlameSvg } from "@/components/art/ResourceIcons";
import { useGame } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import { buildLeaderboard } from "@/lib/mock-social";
import { LEAGUES, leagueFor, nextLeague } from "@/lib/game-config";
import { cn, fmt } from "@/lib/utils";
import { play } from "@/lib/audio";
import type { LeaderboardScope } from "@/types/game";

/** Global / Friends / Clan boards plus the league ladder. */
export function LeaderboardModal() {
  const modal = useUi((s) => s.modal);
  const closeModal = useUi((s) => s.closeModal);
  const openModal = useUi((s) => s.openModal);

  const player = useGame((s) => s.player);
  const clan = useGame((s) => s.clan);

  const [scope, setScope] = useState<LeaderboardScope>("GLOBAL");
  const [view, setView] = useState<"board" | "ladder">("board");

  const you = useMemo(
    () => ({
      name: player.displayName || "You",
      crest: player.crest,
      level: player.level,
      weeklyXp: clan.members.find((m) => m.isYou)?.weeklyXp ?? 0,
      trophies: player.trophies,
      streak: player.streak,
    }),
    [player, clan],
  );

  const rows = useMemo(() => buildLeaderboard(scope, you), [scope, you]);
  const yourRow = rows.find((r) => r.isYou);
  const league = leagueFor(player.trophies);
  const up = nextLeague(player.trophies);

  const podium = [rows[1], rows[0], rows[2]].filter(Boolean);

  return (
    <Modal
      open={modal === "leaderboard"}
      onClose={closeModal}
      title="Leaderboard"
      subtitle="Ranked by XP earned this week. Resets Monday."
      icon="🏆"
      size="md"
      tone="dark"
      footer={
        <div className="flex gap-2">
          <Button tone="stone" size="lg" onClick={closeModal} className="min-w-[92px]">
            Close
          </Button>
          <Button tone="gold" size="lg" fullWidth onClick={() => openModal("season")}>
            ★ Season track
          </Button>
        </div>
      }
    >
      {/* -------------------------------------------------------- view toggle */}
      <div className="mb-3 flex gap-1.5">
        {(
          [
            ["board", "Rankings"],
            ["ladder", "League ladder"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              play("tap");
              setView(id);
            }}
            className={cn(
              "flex-1 rounded-chunk border-[3px] px-3 py-1.5 font-display text-xs uppercase tracking-wide transition-all",
              view === id
                ? "-translate-y-0.5 border-wood-dark bg-gold-gradient text-wood-deep shadow-btn-gold-sm"
                : "border-white/10 bg-white/5 text-cream/60 hover:bg-white/10",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "board" ? (
        <>
          {/* ------------------------------------------------------- scope tabs */}
          <div className="mb-4 flex gap-1.5">
            {(["GLOBAL", "FRIENDS", "CLAN"] as LeaderboardScope[]).map((s) => (
              <button
                key={s}
                onClick={() => {
                  play("tap");
                  setScope(s);
                }}
                className={cn(
                  "flex-1 rounded-chunk border-2 px-2.5 py-1.5 font-ui text-[10px] font-black uppercase tracking-wider transition-colors sm:text-xs",
                  scope === s
                    ? "border-gold-deep bg-gold-base/25 text-gold-light"
                    : "border-white/10 bg-white/[0.03] text-cream/50 hover:text-cream/80",
                )}
              >
                {s === "GLOBAL" ? "🌍 Global" : s === "FRIENDS" ? "👥 Friends" : "🛡️ Clan"}
              </button>
            ))}
          </div>

          {/* ---------------------------------------------------------- podium */}
          <div className="mb-4 grid grid-cols-3 items-end gap-2">
            {podium.map((row, i) => {
              const place = i === 1 ? 1 : i === 0 ? 2 : 3;
              const h = place === 1 ? "h-24" : place === 2 ? "h-[74px]" : "h-14";
              return (
                <motion.div
                  key={`${row.name}-${place}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex flex-col items-center"
                >
                  <span className="mb-0.5 text-xl">
                    {place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉"}
                  </span>
                  <span
                    className={cn(
                      "mb-1 grid h-10 w-10 place-items-center rounded-xl border-[3px] bg-tan-gradient text-lg",
                      row.isYou ? "border-gold-light" : "border-panel-ink",
                    )}
                  >
                    {row.crest}
                  </span>
                  <span className="mb-1 max-w-full truncate font-display text-xs text-cream">
                    {row.name}
                  </span>
                  <div
                    className={cn(
                      "flex w-full flex-col items-center justify-center rounded-t-chunk border-x-2 border-t-2 border-panel-ink pt-1.5",
                      h,
                      place === 1
                        ? "bg-gold-gradient"
                        : place === 2
                          ? "bg-stone-gradient"
                          : "bg-wood-gradient",
                    )}
                  >
                    <span
                      className="text-outline-xs text-xl leading-none"
                      style={{ WebkitTextStroke: "2px #2A1608" }}
                    >
                      {place}
                    </span>
                    <span className="font-ui text-[9px] font-black tabular-nums text-panel-ink/75">
                      {fmt(row.weeklyXp)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ------------------------------------------------------------ rows */}
          <div className="flex flex-col gap-1.5">
            {rows.map((row) => (
              <div
                key={`${row.name}-${row.rank}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-chunk border-2 px-2.5 py-2",
                  row.isYou
                    ? "border-gold-deep bg-gold-base/20"
                    : "border-panel-ink/60 bg-panel-ink/40",
                )}
              >
                <span className="w-6 text-center font-display text-sm tabular-nums text-cream/65">
                  {row.rank}
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-panel-ink bg-tan-gradient text-base">
                  {row.crest}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-ui text-sm font-black text-cream">
                    {row.name}
                    {row.isYou ? (
                      <span className="ml-1.5 font-ui text-[9px] font-black uppercase text-gold-light">
                        you
                      </span>
                    ) : null}
                  </p>
                  <p className="font-ui text-[9px] font-bold uppercase tracking-wide text-cream/45">
                    Level {row.level}
                  </p>
                </div>
                <LeagueBadge league={row.league} size={22} className="hidden sm:flex" />
                <span className="hidden items-center gap-0.5 sm:flex">
                  <FlameSvg size={12} lit={row.streak > 0} />
                  <span className="font-ui text-[11px] font-black tabular-nums text-warn">
                    {row.streak}
                  </span>
                </span>
                <span className="flex items-center gap-0.5">
                  <TrophySvg size={12} />
                  <span className="font-ui text-[11px] font-black tabular-nums text-gold-light">
                    {fmt(row.trophies)}
                  </span>
                </span>
                <span className="w-14 text-right font-ui text-xs font-black tabular-nums text-xp">
                  {fmt(row.weeklyXp)}
                </span>
              </div>
            ))}
          </div>

          {yourRow ? (
            <p className="mt-3 text-center font-ui text-[11px] font-bold uppercase tracking-wider text-cream/50">
              You&apos;re #{yourRow.rank} of {rows.length} ·{" "}
              {fmt(yourRow.weeklyXp)} XP this week
            </p>
          ) : null}
        </>
      ) : (
        /* ------------------------------------------------------ league ladder */
        <div className="flex flex-col gap-3">
          <div className="rounded-chunk border-2 border-gold-deep/40 bg-gold-base/12 p-3">
            <div className="flex items-center gap-3">
              <LeagueBadge league={league.id} size={52} />
              <div className="min-w-0 flex-1">
                <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-gold-light">
                  Current league
                </p>
                <p className="text-outline-xs text-lg">{league.name}</p>
                <p className="font-ui text-[11px] font-bold tabular-nums text-cream/65">
                  {fmt(player.trophies)} Consistency Trophies
                </p>
              </div>
            </div>

            {up ? (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-ui text-[10px] font-black uppercase tracking-wider text-cream/60">
                    To {up.name}
                  </span>
                  <span className="font-ui text-[11px] font-black tabular-nums text-cream/80">
                    {fmt(Math.max(0, up.minTrophies - player.trophies))} to go
                  </span>
                </div>
                <ProgressBar
                  value={player.trophies - league.minTrophies}
                  max={up.minTrophies - league.minTrophies}
                  tone="gold"
                  size="md"
                />
              </div>
            ) : (
              <p className="mt-2 font-display text-sm text-gold-light">
                Top of the ladder. Nothing above you.
              </p>
            )}
          </div>

          {/* full ladder, highest first */}
          <div className="flex flex-col gap-1.5">
            {LEAGUES.slice()
              .reverse()
              .map((l) => {
                const current = l.id === league.id;
                const reached = player.trophies >= l.minTrophies;
                return (
                  <div
                    key={l.id}
                    className={cn(
                      "flex items-center gap-3 rounded-chunk border-2 px-2.5 py-2",
                      current
                        ? "border-gold-deep bg-gold-base/20"
                        : reached
                          ? "border-gem-deep/40 bg-gem-base/8"
                          : "border-panel-ink/60 bg-panel-ink/35",
                    )}
                  >
                    <LeagueBadge league={l.id} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm text-cream sm:text-base">
                        {l.name} League
                      </p>
                      <p className="font-ui text-[10px] font-bold tabular-nums text-cream/50">
                        {fmt(l.minTrophies)}+ trophies
                      </p>
                    </div>
                    {current ? (
                      <span className="rounded-pill border-2 border-gold-deep bg-gold-base px-2 py-0.5 font-ui text-[9px] font-black uppercase text-wood-deep">
                        You
                      </span>
                    ) : reached ? (
                      <span className="font-ui text-sm font-black text-gem-light">✓</span>
                    ) : (
                      <span className="font-ui text-sm text-cream/25">🔒</span>
                    )}
                  </div>
                );
              })}
          </div>

          <p className="rounded-chunk border-2 border-white/10 bg-white/[0.04] p-3 font-body text-xs font-semibold leading-snug text-cream/70">
            Consistency Trophies come from streaks and completed quests, not from
            grinding hours. Promotion and demotion happen at the weekly reset — a bad
            week costs you trophies, never your buildings.
          </p>
        </div>
      )}
    </Modal>
  );
}
