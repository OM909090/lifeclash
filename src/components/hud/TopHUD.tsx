"use client";

import { motion } from "framer-motion";
import { useGame } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import {
  GoldCoinSvg,
  ElixirFlaskSvg,
  GemSvg,
  BuilderIconSvg,
  FlameSvg,
} from "@/components/art/ResourceIcons";
import { LeagueBadge } from "@/components/art/LeagueBadge";
import { Avatar } from "@/components/ui/Avatar";
import { leagueFor, nextLeague, xpForLevel } from "@/lib/game-config";
import { cn, fmt, fmtCompact, pct } from "@/lib/utils";
import { play } from "@/lib/audio";

/**
 * Persistent top HUD: level shield + XP meter, builder count, league badge,
 * streak, and the three beveled currency counters.
 */
export function TopHUD() {
  const player = useGame((s) => s.player);
  const hydrated = useGame((s) => s.hydrated);
  const openModal = useUi((s) => s.openModal);

  const needed = xpForLevel(player.level);
  const league = leagueFor(player.trophies);
  const up = nextLeague(player.trophies);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[80] px-2 pt-2 sm:px-4 sm:pt-3">
      <div className="pointer-events-auto mx-auto flex max-w-6xl flex-col gap-1.5">
        {/* ------------------------------------------------------------ row 1 */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* avatar + level shield + XP meter */}
          <button
            onClick={() => {
              play("open");
              openModal("profile");
            }}
            className="group flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2"
            aria-label={`${player.displayName}, level ${player.level}. ${fmt(player.xp)} of ${fmt(needed)} XP. Open profile.`}
          >
            {/* account avatar */}
            <Avatar
              avatarUrl={player.avatarUrl}
              crest={player.crest}
              size={34}
              className="transition-transform group-hover:scale-105"
            />
            {/* shield */}
            <span className="relative grid h-11 w-10 shrink-0 place-items-center transition-transform group-hover:scale-105 sm:h-12 sm:w-11">
              <svg viewBox="0 0 44 50" className="absolute inset-0 h-full w-full">
                <path
                  d="M22 1.5 42 6v20.5C42 37.4 33.4 45 22 48.5 10.6 45 2 37.4 2 26.5V6z"
                  fill="#4D2815"
                />
                <path
                  d="M22 4.6 38.9 8.4v18.1c0 9-7 15.4-16.9 18.5C12.1 41.9 5.1 35.5 5.1 26.5V8.4z"
                  fill="url(#shieldFace)"
                />
                <path
                  d="M22 4.6 38.9 8.4v5.7C33.2 11.6 27.8 10.4 22 10.4s-11.2 1.2-16.9 3.7V8.4z"
                  fill="#FFFFFF"
                  opacity=".38"
                />
                <defs>
                  <linearGradient id="shieldFace" x1="0" y1="0" x2="0.3" y2="1">
                    <stop offset="0%" stopColor="#FFF078" />
                    <stop offset="46%" stopColor="#FFD447" />
                    <stop offset="100%" stopColor="#DC990E" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="relative flex flex-col items-center leading-none">
                <span className="font-ui text-[6px] font-black uppercase tracking-widest text-wood-deep/75">
                  lvl
                </span>
                <span
                  className="text-outline-xs text-base tabular-nums sm:text-lg"
                  style={{ WebkitTextStroke: "1.6px #4D2815" }}
                >
                  {hydrated ? player.level : "—"}
                </span>
              </span>
            </span>

            {/* XP meter */}
            <span className="min-w-0 flex-1">
              <span className="well relative flex h-5 overflow-hidden sm:h-6">
                <motion.span
                  className="relative h-full rounded-pill bg-[linear-gradient(180deg,#C9F79B_0%,#7BD84A_48%,#4E9E28_100%)]"
                  initial={false}
                  animate={{ width: `${pct(player.xp, needed)}%` }}
                  transition={{ type: "spring", stiffness: 140, damping: 20 }}
                >
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-pill"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 100%)",
                    }}
                  />
                </motion.span>
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center font-ui text-[10px] font-black tabular-nums text-cream sm:text-[11px]"
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,.9)" }}
                >
                  {hydrated ? `${fmt(player.xp)} / ${fmt(needed)} XP` : "—"}
                </span>
              </span>
            </span>
          </button>

          {/* builders */}
          <div
            className="counter shrink-0 px-2 py-1"
            title={`${player.buildersTotal - player.buildersBusy} of ${player.buildersTotal} builders free`}
          >
            <BuilderIconSvg size={18} busy={player.buildersBusy > 0} />
            <span className="text-[11px] sm:text-xs">
              {player.buildersTotal - player.buildersBusy}/{player.buildersTotal}
            </span>
          </div>

          {/* streak */}
          <div
            className={cn("counter shrink-0 px-2 py-1", player.streak === 0 && "opacity-70")}
            title={`${player.streak} day streak`}
          >
            <FlameSvg size={16} lit={player.streak > 0} />
            <span className="text-[11px] tabular-nums sm:text-xs">{player.streak}</span>
          </div>
        </div>

        {/* ------------------------------------------------------------ row 2 */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* league badge */}
          <button
            onClick={() => {
              play("open");
              openModal("leaderboard");
            }}
            className="counter shrink-0 gap-1.5 py-0.5 pl-1 pr-2.5 transition-transform hover:-translate-y-0.5"
            aria-label={`${league.name} League, ${fmt(player.trophies)} trophies. Open leaderboard.`}
          >
            <LeagueBadge league={league.id} size={26} />
            <span className="flex flex-col items-start leading-none">
              <span className="font-ui text-[9px] font-black uppercase tracking-wider text-cream/70">
                {league.name}
              </span>
              <span className="text-[11px] tabular-nums">
                {hydrated ? fmt(player.trophies) : "—"}
                {up ? (
                  <span className="ml-1 font-ui text-[9px] font-bold text-cream/45">
                    /{fmt(up.minTrophies)}
                  </span>
                ) : null}
              </span>
            </span>
          </button>

          <div className="flex-1" />

          {/* currencies */}
          <Currency
            icon={<GoldCoinSvg size={17} />}
            value={player.resources.gold}
            hydrated={hydrated}
            label="Gold"
          />
          <Currency
            icon={<ElixirFlaskSvg size={17} />}
            value={player.resources.elixir}
            hydrated={hydrated}
            label="Elixir"
          />
          <Currency
            icon={<GemSvg size={17} />}
            value={player.resources.gems}
            hydrated={hydrated}
            label="Gems"
          />
        </div>
      </div>
    </div>
  );
}

function Currency({
  icon,
  value,
  hydrated,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  hydrated: boolean;
  label: string;
}) {
  return (
    <div
      className="counter min-w-[74px] justify-end gap-1 px-2 py-1 sm:min-w-[88px]"
      title={`${label}: ${fmt(value)}`}
    >
      {icon}
      <motion.span
        key={value}
        initial={{ scale: 1.24, color: "#FFF078" }}
        animate={{ scale: 1, color: "#FFF7D6" }}
        transition={{ duration: 0.32 }}
        className="text-[11px] sm:text-xs"
      >
        {hydrated ? fmtCompact(value) : "—"}
      </motion.span>
    </div>
  );
}
