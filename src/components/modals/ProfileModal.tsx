"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Chip } from "@/components/ui/Badge";
import { LeagueBadge } from "@/components/art/LeagueBadge";
import { GuardianArt } from "@/components/art/Guardians";
import { BuildingArt } from "@/components/art/Buildings";
import {
  GoldCoinSvg,
  ElixirFlaskSvg,
  GemSvg,
  TrophySvg,
  FlameSvg,
} from "@/components/art/ResourceIcons";
import { Avatar } from "@/components/ui/Avatar";
import { useGame } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import {
  BUILDINGS,
  guardianById,
  leagueFor,
  nextLeague,
  xpForLevel,
  PILLARS,
} from "@/lib/game-config";
import { fmt, pct } from "@/lib/utils";

/** Player profile: identity, league standing, resources, and realm roster. */
export function ProfileModal() {
  const modal = useUi((s) => s.modal);
  const closeModal = useUi((s) => s.closeModal);
  const openModal = useUi((s) => s.openModal);

  const player = useGame((s) => s.player);
  const buildings = useGame((s) => s.buildings);

  const guardian = guardianById(player.guardian);
  const league = leagueFor(player.trophies);
  const up = nextLeague(player.trophies);
  const needed = xpForLevel(player.level);

  return (
    <Modal
      open={modal === "profile"}
      onClose={closeModal}
      title={player.realmName}
      subtitle={`Ruled by ${player.displayName}`}
      icon={player.crest}
      size="md"
      footer={
        <div className="flex gap-2">
          <Button tone="stone" size="lg" onClick={closeModal} className="min-w-[92px]">
            Close
          </Button>
          <Button
            tone="gold"
            size="lg"
            fullWidth
            onClick={() => openModal("leaderboard")}
          >
            🏆 Leaderboard
          </Button>
        </div>
      }
    >
      {/* ------------------------------------------------------ identity card */}
      <div className="mb-3 flex items-center gap-3 rounded-chunk border-[3px] border-wood-dark/30 bg-tan-light/80 p-3">
        <Avatar avatarUrl={player.avatarUrl} crest={player.crest} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg text-wood-deep">
            {player.displayName}
          </p>
          {player.email ? (
            <p className="truncate font-body text-xs font-semibold text-wood-mid">
              {player.email}
            </p>
          ) : (
            <p className="font-body text-xs font-semibold text-wood-mid">
              Ruler of {player.realmName}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {player.authProvider === "google" ? (
              <Chip tone="stone">Google account</Chip>
            ) : player.email ? (
              <Chip tone="stone">Email account</Chip>
            ) : (
              <Chip tone="wood">Local play</Chip>
            )}
            {player.memberSince ? (
              <span className="font-ui text-[10px] font-bold uppercase tracking-wide text-wood-mid/70">
                Since {new Date(player.memberSince).toLocaleDateString()}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------- banner */}
      <div className="relative flex items-end gap-3 overflow-hidden rounded-chunk border-[3px] border-wood-dark/35 bg-[radial-gradient(ellipse_at_50%_15%,#F6E3C4,#C99B6B)] px-4 pb-2 pt-4">
        <GuardianArt id={player.guardian} width={126} className="shrink-0" />

        <div className="min-w-0 flex-1 pb-2">
          <div className="flex items-center gap-2">
            <LeagueBadge league={league.id} size={42} />
            <div className="min-w-0">
              <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-wood-mid">
                {league.name} League
              </p>
              <p className="text-outline-xs truncate text-lg">Level {player.level}</p>
            </div>
          </div>

          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-ui text-[10px] font-black uppercase tracking-wider text-wood-mid">
                Experience
              </span>
              <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
                {fmt(player.xp)} / {fmt(needed)}
              </span>
            </div>
            <ProgressBar value={player.xp} max={needed} tone="xp" size="sm" />
          </div>
        </div>

        <span className="absolute right-2 top-2 text-3xl">{player.crest}</span>
      </div>

      {/* --------------------------------------------------------------- stats */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat
          icon={<TrophySvg size={18} />}
          label="Trophies"
          value={fmt(player.trophies)}
        />
        <Stat
          icon={<FlameSvg size={18} lit={player.streak > 0} />}
          label="Streak"
          value={`${player.streak}d`}
        />
        <Stat
          icon={<GoldCoinSvg size={18} />}
          label="Gold"
          value={fmt(player.resources.gold)}
        />
        <Stat
          icon={<ElixirFlaskSvg size={18} />}
          label="Elixir"
          value={fmt(player.resources.elixir)}
        />
      </div>

      {/* --------------------------------------------------------- league climb */}
      {up ? (
        <div className="mt-3 rounded-chunk border-2 border-gold-deep/40 bg-gold-base/12 p-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
              Climb to {up.name}
            </span>
            <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
              {fmt(Math.max(0, up.minTrophies - player.trophies))} trophies to go
            </span>
          </div>
          <ProgressBar
            value={player.trophies - league.minTrophies}
            max={up.minTrophies - league.minTrophies}
            tone="gold"
            size="sm"
          />
        </div>
      ) : null}

      {/* ---------------------------------------------------------- guardian */}
      <div className="mt-3 rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 p-3">
        <p className="font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
          Your Guardian
        </p>
        <p className="text-outline-xs mt-0.5 text-base">{guardian.name}</p>
        <p className="mt-0.5 font-body text-xs font-semibold text-wood-mid">
          {guardian.title} · {guardian.pillar}
        </p>
      </div>

      {/* ------------------------------------------------------------ pillars */}
      <div className="mt-3">
        <p className="mb-2 font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
          Pillars you&apos;re building
        </p>
        <div className="flex flex-wrap gap-1.5">
          {player.pillars.map((p) => {
            const pillar = PILLARS.find((x) => x.id === p);
            return (
              <Chip key={p} tone="wood">
                {pillar?.emoji} {pillar?.label}
              </Chip>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------- realm */}
      <div className="mt-3">
        <p className="mb-2 font-ui text-[10px] font-black uppercase tracking-[0.18em] text-wood-mid">
          Your realm
        </p>
        {/* Doubles as the accessible list alternative to the village canvas. */}
        <ul className="flex flex-col gap-1.5">
          {buildings.map((b) => {
            const meta = BUILDINGS[b.type];
            const locked = b.status === "LOCKED";
            return (
              <li
                key={b.id}
                className="flex items-center gap-3 rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 px-2.5 py-1.5"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center">
                  <BuildingArt type={b.type} level={b.level} width={44} dim={locked} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm text-wood-deep">
                    {meta.name}
                  </p>
                  <p className="font-ui text-[10px] font-bold uppercase tracking-wide text-wood-mid/70">
                    {locked ? "Locked until level 5" : meta.domain}
                  </p>
                </div>
                {locked ? (
                  <span className="font-ui text-sm text-wood-mid/40">🔒</span>
                ) : (
                  <>
                    <span className="w-16 shrink-0">
                      <ProgressBar
                        value={pct(b.xp, Math.max(1, b.xp + 100))}
                        max={100}
                        tone="xp"
                        size="xs"
                        shine={false}
                      />
                    </span>
                    <span className="shrink-0 rounded-pill border-2 border-wood-dark/35 bg-tan-mid px-2 py-0.5 font-ui text-[10px] font-black tabular-nums text-wood-deep">
                      Lv {b.level}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-chunk border-2 border-gem-deep/35 bg-gem-base/10 px-3 py-2">
        <GemSvg size={18} />
        <p className="font-body text-[11px] font-semibold leading-snug text-wood-deep">
          Finance quests stay private — they never appear here for other players.
        </p>
      </div>
    </Modal>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-chunk border-2 border-wood-dark/25 bg-tan-light/70 px-2.5 py-2">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 leading-none">
        <span className="block font-ui text-[9px] font-black uppercase tracking-wider text-wood-mid">
          {label}
        </span>
        <span className="block font-display text-base tabular-nums text-wood-deep">
          {value}
        </span>
      </span>
    </div>
  );
}
