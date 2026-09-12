"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArenaBackdrop } from "./SkyBackdrop";
import { LeagueBadge } from "@/components/art/LeagueBadge";
import { TrophySvg, FlameSvg } from "@/components/art/ResourceIcons";
import { Button } from "@/components/ui/Button";
import { buildLeaderboard } from "@/lib/mock-social";
import { cn, fmt } from "@/lib/utils";

/** Static top-10 preview with podium styling — the competitive hook. */
export function LeaderboardPreview() {
  const rows = buildLeaderboard("GLOBAL", {
    name: "You",
    crest: "🦁",
    level: 1,
    weeklyXp: 0,
    trophies: 40,
    streak: 0,
  })
    .filter((r) => !r.isYou)
    .slice(0, 8);

  const podium = [rows[1], rows[0], rows[2]];

  return (
    <section
      id="leaderboard"
      className="relative isolate overflow-hidden py-20 sm:py-28"
    >
      <ArenaBackdrop />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 select-none whitespace-nowrap font-display text-[20vw] leading-none text-white/[.03]"
      >
        LEAGUES
      </span>

      <div className="relative mx-auto max-w-5xl px-4">
        <header className="mb-12 text-center">
          <p className="mb-3 font-ui text-xs font-black uppercase tracking-[0.3em] text-sky-mid">
            This week · global
          </p>
          <h2 className="text-outline-ink text-section-title">
            Climb The Leaderboard
          </h2>
        </header>

        {/* ------------------------------------------------------------ podium */}
        <div className="mb-10 grid grid-cols-3 items-end gap-2 sm:gap-5">
          {podium.map((row, i) => {
            const place = i === 1 ? 1 : i === 0 ? 2 : 3;
            const height =
              place === 1 ? "h-28 sm:h-36" : place === 2 ? "h-24 sm:h-28" : "h-20 sm:h-24";
            const medal = place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉";
            return (
              <motion.div
                key={row.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 90, damping: 15 }}
                className="flex flex-col items-center"
              >
                <span className="mb-1 text-2xl sm:text-3xl">{medal}</span>
                <span className="mb-1 grid h-11 w-11 place-items-center rounded-xl border-[3px] border-panel-ink bg-tan-gradient text-xl shadow-panel sm:h-14 sm:w-14 sm:text-2xl">
                  {row.crest}
                </span>
                <span className="text-outline-xs mb-1 text-center text-xs sm:text-base">
                  {row.name}
                </span>
                <LeagueBadge league={row.league} size={26} />

                {/* plinth */}
                <div
                  className={cn(
                    "mt-2 flex w-full flex-col items-center justify-start gap-1 rounded-t-chunk border-x-[4px] border-t-[4px] border-panel-ink pt-3",
                    height,
                    place === 1
                      ? "bg-gold-gradient"
                      : place === 2
                        ? "bg-stone-gradient"
                        : "bg-wood-gradient",
                  )}
                >
                  <span
                    className="text-outline-xs text-2xl leading-none sm:text-4xl"
                    style={{ WebkitTextStroke: "2.5px #2A1608" }}
                  >
                    {place}
                  </span>
                  <span className="font-ui text-[10px] font-black tabular-nums text-panel-ink/80 sm:text-xs">
                    {fmt(row.weeklyXp)} XP
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* -------------------------------------------------------- rows 4-8 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="panel-dark overflow-hidden p-2 sm:p-3"
        >
          <div className="flex flex-col gap-1.5">
            {rows.slice(3).map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-2.5 rounded-chunk border-2 border-panel-ink/70 bg-panel-ink/45 px-2.5 py-2 sm:gap-3.5 sm:px-3.5"
              >
                <span className="w-6 text-center font-display text-base text-cream/70 tabular-nums sm:text-lg">
                  {row.rank}
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-panel-ink bg-tan-gradient text-base sm:text-lg">
                  {row.crest}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-ui text-sm font-black text-cream">
                    {row.name}
                  </p>
                  <p className="font-ui text-[10px] font-bold uppercase tracking-wide text-cream/55">
                    Level {row.level}
                  </p>
                </div>
                <span className="hidden items-center gap-1 sm:flex">
                  <FlameSvg size={14} />
                  <span className="font-ui text-xs font-black tabular-nums text-warn">
                    {row.streak}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <TrophySvg size={14} />
                  <span className="font-ui text-xs font-black tabular-nums text-gold-light">
                    {fmt(row.trophies)}
                  </span>
                </span>
                <span className="w-16 text-right font-ui text-xs font-black tabular-nums text-xp sm:w-20 sm:text-sm">
                  {fmt(row.weeklyXp)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-10 text-center">
          <Link href="/onboarding">
            <Button tone="gold" size="lg" sfx="whoosh">
              ⚔️ Claim Your Rank
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
