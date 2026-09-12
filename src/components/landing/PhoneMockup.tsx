"use client";

import { cn, fmtCompact } from "@/lib/utils";
import {
  GoldCoinSvg,
  ElixirFlaskSvg,
  GemSvg,
  FlameSvg,
} from "@/components/art/ResourceIcons";
import {
  TownHallSvg,
  AcademySvg,
  TrainingGroundsSvg,
  TreasurySvg,
  DefenseTowerSvg,
} from "@/components/art/Buildings";
import { TreeSvg, RockSvg } from "@/components/art/Scenery";
import { DragonHeadIcon } from "@/components/art/Dragon";

/**
 * Marketing phone mockup showing the live village, mirroring the device shot in
 * design-refs/ref-screen-3.png. This is a static composition — the interactive
 * board lives in components/village/VillageCanvas.tsx.
 */
export function PhoneMockup({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* device body */}
      <div className="relative w-[290px] rounded-[2.6rem] border-[6px] border-panel-ink bg-panel-base p-2.5 shadow-panel-lift sm:w-[320px]">
        {/* side buttons */}
        <span className="absolute -right-[9px] top-28 h-16 w-[5px] rounded-r bg-panel-ink" />
        <span className="absolute -left-[9px] top-24 h-10 w-[5px] rounded-l bg-panel-ink" />
        <span className="absolute -left-[9px] top-40 h-10 w-[5px] rounded-l bg-panel-ink" />

        {/* screen */}
        <div className="relative aspect-[9/17.5] w-full overflow-hidden rounded-[2.1rem] bg-sky-gradient">
          {/* notch */}
          <div className="absolute left-1/2 top-1.5 z-30 h-4 w-20 -translate-x-1/2 rounded-pill bg-panel-ink" />

          {/* ---------------------------------------------------- top HUD */}
          <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-1 px-1.5 pt-6">
            <div className="flex items-center gap-1">
              {/* level shield */}
              <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-wood-dark bg-gold-gradient">
                <span
                  className="text-outline-xs text-[11px] leading-none"
                  style={{ WebkitTextStroke: "1.2px #4D2815" }}
                >
                  12
                </span>
              </div>
              {/* xp bar */}
              <div className="well h-3 flex-1 overflow-hidden">
                <div className="h-full w-[68%] rounded-pill bg-[linear-gradient(180deg,#C9F79B,#7BD84A_50%,#4E9E28)]" />
              </div>
              {/* streak */}
              <div className="counter shrink-0 gap-1 px-1.5 py-0.5 text-[10px]">
                <FlameSvg size={11} />
                12
              </div>
            </div>

            <div className="flex items-center gap-1">
              <MiniCounter icon={<GoldCoinSvg size={11} />} value={8420} />
              <MiniCounter icon={<ElixirFlaskSvg size={11} />} value={6230} />
              <MiniCounter icon={<GemSvg size={11} />} value={140} />
            </div>
          </div>

          {/* ------------------------------------------------------ village */}
          <div className="absolute inset-0 flex items-center justify-center pt-10">
            {/* ground plate */}
            <div className="relative h-[300px] w-[300px]">
              {/* isometric grass diamond */}
              <div
                className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[26px] border-[5px] border-grass-deep bg-grass-gradient grid-checker"
                style={{ ["--grid-tile" as string]: "34px" }}
              />
              {/* stone path cross */}
              <div className="absolute left-1/2 top-1/2 h-[214px] w-[30px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[linear-gradient(180deg,#C9CFCC,#8D9395)] opacity-80" />
              <div className="absolute left-1/2 top-1/2 h-[30px] w-[214px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[linear-gradient(180deg,#C9CFCC,#8D9395)] opacity-80" />

              {/* buildings, painter-ordered back → front */}
              <AcademySvg level={6} width={78} className="absolute left-[26px] top-[74px]" />
              <TrainingGroundsSvg level={5} width={82} className="absolute right-[20px] top-[70px]" />
              <TownHallSvg level={12} width={104} className="absolute left-1/2 top-[104px] -translate-x-1/2" />
              <DefenseTowerSvg level={7} width={66} className="absolute left-[16px] top-[150px]" />
              <TreasurySvg level={4} width={76} className="absolute right-[14px] top-[156px]" />

              {/* perimeter scenery */}
              <TreeSvg width={30} variant={0} className="absolute left-[104px] top-[26px]" />
              <TreeSvg width={26} variant={1} className="absolute right-[76px] top-[36px]" />
              <TreeSvg width={28} variant={2} className="absolute left-[52px] top-[212px]" />
              <TreeSvg width={26} variant={0} className="absolute right-[54px] top-[218px]" />
              <RockSvg width={24} className="absolute left-[152px] top-[240px]" />

              {/* collectible bubbles */}
              <div className="absolute left-[70px] top-[128px] animate-bob">
                <Bubble>
                  <GoldCoinSvg size={16} />
                </Bubble>
              </div>
              <div
                className="absolute right-[62px] top-[142px] animate-bob"
                style={{ animationDelay: "-1.6s" }}
              >
                <Bubble>
                  <ElixirFlaskSvg size={16} />
                </Bubble>
              </div>

              {/* floating reward text */}
              <span className="absolute left-1/2 top-[86px] -translate-x-1/2 font-display text-[13px] text-xp drop-shadow-[0_2px_0_rgba(0,0,0,.6)]">
                +100 XP
              </span>
            </div>
          </div>

          {/* --------------------------------------------------- bottom HUD */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-1 px-1.5 pb-2">
            {[
              { icon: <DragonHeadIcon size={16} />, label: "Raid", tone: "btn3d-elixir" },
              { icon: "📜", label: "Quests", tone: "btn3d-gold" },
              { icon: "🛡️", label: "Clan", tone: "btn3d-stone" },
              { icon: "🔨", label: "Shop", tone: "btn3d-wood" },
              { icon: "⚙️", label: "Set", tone: "btn3d-stone" },
            ].map((b) => (
              <div
                key={b.label}
                className={cn(
                  "btn3d flex-1 flex-col gap-0 rounded-lg border-b-[4px] px-0 py-1 text-[9px]",
                  b.tone,
                )}
              >
                <span className="grid h-4 place-items-center text-[13px] leading-none">
                  {b.icon}
                </span>
                <span
                  className="font-ui text-[7px] font-black uppercase tracking-wide"
                  style={{ WebkitTextStroke: "0px" }}
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* glow under the device */}
      <div className="pointer-events-none absolute -bottom-8 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-[50%] bg-black/35 blur-2xl" />
    </div>
  );
}

function MiniCounter({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: number;
}) {
  return (
    <div className="counter flex-1 justify-center gap-1 px-1 py-0.5 text-[9px]">
      {icon}
      {fmtCompact(value)}
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-white/70 bg-white/35 shadow-glow-gold backdrop-blur-sm">
      {children}
    </span>
  );
}
