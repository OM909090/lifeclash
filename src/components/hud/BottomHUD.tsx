"use client";

import { useUi } from "@/store/ui-store";
import { useGame } from "@/store/game-store";
import { DragonHeadIcon } from "@/components/art/Dragon";
import { cn, pct } from "@/lib/utils";
import { play } from "@/lib/audio";
import type { ModalId } from "@/types/game";

interface HudButton {
  id: ModalId;
  label: string;
  icon: React.ReactNode;
  tone: string;
  /** Small count/alert bubble on the corner. */
  badge?: number;
}

/** The five chunky 3D action buttons across the bottom of the game view. */
export function BottomHUD() {
  const openModal = useUi((s) => s.openModal);
  const quests = useGame((s) => s.quests);
  const raid = useGame((s) => s.raid);
  const hydrated = useGame((s) => s.hydrated);

  const openQuests = quests.filter((q) => q.status !== "COMPLETED").length;
  const bossHp = pct(raid.currentHp, raid.maxHp);

  const buttons: HudButton[] = [
    {
      id: "raid",
      label: "Raid Boss",
      icon: <DragonHeadIcon size={26} />,
      tone: "btn3d-elixir",
    },
    {
      id: "quests",
      label: "Quests",
      icon: "📜",
      tone: "btn3d-gold",
      badge: hydrated ? openQuests : undefined,
    },
    { id: "clan", label: "Clan", icon: "🛡️", tone: "btn3d-stone" },
    { id: "shop", label: "Shop", icon: "🔨", tone: "btn3d-wood" },
    { id: "settings", label: "Settings", icon: "⚙️", tone: "btn3d-stone" },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[80] px-2 pb-2 sm:px-4 sm:pb-3">
      <div className="pointer-events-auto mx-auto max-w-2xl">
        {/* boss HP strip sits directly above the raid button */}
        <div className="mb-1.5 flex items-center gap-2 rounded-pill border-2 border-panel-ink bg-panel-base/85 px-2.5 py-1 backdrop-blur-sm">
          <DragonHeadIcon size={16} />
          <span className="shrink-0 font-ui text-[9px] font-black uppercase tracking-wider text-elixir-light">
            {raid.name}
          </span>
          <span className="well relative h-2.5 flex-1 overflow-hidden">
            <span
              className="block h-full rounded-pill bg-[linear-gradient(180deg,#FF9A8F,#E94B4B_48%,#A32020)] transition-[width] duration-500"
              style={{ width: `${hydrated ? bossHp : 100}%` }}
            />
          </span>
          <span className="shrink-0 font-ui text-[9px] font-black tabular-nums text-cream/70">
            {Math.round(hydrated ? bossHp : 100)}%
          </span>
        </div>

        {/* the five buttons */}
        <div className="flex items-stretch gap-1.5 sm:gap-2.5">
          {buttons.map((b) => (
            <button
              key={b.id}
              onMouseEnter={() => play("hover")}
              onClick={() => {
                play("open");
                openModal(b.id);
              }}
              aria-label={b.label}
              className={cn(
                "btn3d relative flex-1 flex-col gap-0.5 rounded-xl border-b-[6px] px-1 py-1.5 sm:py-2",
                b.tone,
              )}
            >
              <span className="grid h-6 place-items-center text-xl leading-none sm:h-7 sm:text-2xl">
                {b.icon}
              </span>
              <span
                className="font-ui text-[8px] font-black uppercase leading-none tracking-tight sm:text-[10px]"
                style={{ WebkitTextStroke: "0px" }}
              >
                {b.label}
              </span>

              {b.badge ? (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-pill border-2 border-panel-ink bg-danger px-1 font-ui text-[10px] font-black tabular-nums text-white">
                  {b.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
