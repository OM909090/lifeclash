"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Badge";
import { GoldCoinSvg, GemSvg } from "@/components/art/ResourceIcons";
import { TreeSvg, RockSvg, BannerSvg } from "@/components/art/Scenery";
import { useGame } from "@/store/game-store";
import { useUi } from "@/store/ui-store";
import { cn, fmt } from "@/lib/utils";
import { play } from "@/lib/audio";

interface ShopItem {
  id: string;
  name: string;
  blurb: string;
  cost: number;
  currency: "gold" | "gems";
  art: React.ReactNode;
}

/**
 * Cosmetics-only shop. Deliberately no power for sale — LIFECLASH-SPEC.md §13
 * Principle 1: real money must never buy competitive advantage.
 */
const ITEMS: ShopItem[] = [
  {
    id: "oak",
    name: "Ancient Oak",
    blurb: "A broad-canopy tree for your perimeter.",
    cost: 800,
    currency: "gold",
    art: <TreeSvg width={54} variant={0} />,
  },
  {
    id: "pine",
    name: "Frostpine",
    blurb: "Tall and sharp. Looks good in winter skins.",
    cost: 1_200,
    currency: "gold",
    art: <TreeSvg width={50} variant={1} />,
  },
  {
    id: "bush",
    name: "Hedgerow",
    blurb: "Twin bushes to soften a path edge.",
    cost: 500,
    currency: "gold",
    art: <TreeSvg width={52} variant={2} />,
  },
  {
    id: "cairn",
    name: "Standing Cairn",
    blurb: "Stone cluster. Quietly ominous.",
    cost: 650,
    currency: "gold",
    art: <RockSvg width={48} />,
  },
  {
    id: "banner-blue",
    name: "Azure Banner",
    blurb: "Fly your crest in Sentinel blue.",
    cost: 60,
    currency: "gems",
    art: <BannerSvg width={40} color="#3E8BE0" crest="🦁" />,
  },
  {
    id: "banner-red",
    name: "Crimson Banner",
    blurb: "Fly your crest in Warrior red.",
    cost: 60,
    currency: "gems",
    art: <BannerSvg width={40} color="#E0453F" crest="🐉" />,
  },
];

export function ShopModal() {
  const modal = useUi((s) => s.modal);
  const closeModal = useUi((s) => s.closeModal);
  const resources = useGame((s) => s.player.resources);
  const purchaseItem = useGame((s) => s.purchaseItem);
  const mode = useGame((s) => s.mode);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <Modal
      open={modal === "shop"}
      onClose={closeModal}
      title="Builder's Market"
      subtitle="Decorations and skins only — nothing here makes you stronger."
      icon="🔨"
      size="md"
      headerRight={
        <span className="hidden items-center gap-2 sm:flex">
          <span className="counter px-2 py-0.5 text-[11px]">
            <GoldCoinSvg size={14} />
            {fmt(resources.gold)}
          </span>
          <span className="counter px-2 py-0.5 text-[11px]">
            <GemSvg size={14} />
            {fmt(resources.gems)}
          </span>
        </span>
      }
    >
      <div className="mb-3 rounded-chunk border-2 border-gem-deep/40 bg-gem-base/12 p-3">
        <p className="font-ui text-[10px] font-black uppercase tracking-[0.2em] text-gem-dark">
          No pay-to-win
        </p>
        <p className="mt-1 font-body text-xs font-semibold leading-snug text-wood-deep">
          Gems are earned by clearing quests and beating the Dragon. They buy looks,
          never advantages — and there is nothing to purchase with real money.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const have = item.currency === "gold" ? resources.gold : resources.gems;
          const affordable = have >= item.cost;
          const isOwned = owned.has(item.id);

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-chunk border-[3px] border-wood-dark/30 bg-tan-light/80 p-3"
            >
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-chunk border-2 border-wood-dark/25 bg-[radial-gradient(ellipse_at_50%_25%,#F6E3C4,#D9AE79)]">
                {item.art}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base leading-tight text-wood-deep">
                  {item.name}
                </p>
                <p className="mt-0.5 font-body text-[11px] font-semibold leading-snug text-wood-mid">
                  {item.blurb}
                </p>
                <div className="mt-1.5">
                  <Chip tone={item.currency === "gold" ? "gold" : "gem"}>
                    {item.currency === "gold" ? (
                      <GoldCoinSvg size={11} />
                    ) : (
                      <GemSvg size={11} />
                    )}
                    {fmt(item.cost)}
                  </Chip>
                </div>
              </div>
              <Button
                tone={isOwned ? "stone" : affordable ? "gem" : "stone"}
                size="sm"
                sfx={null}
                disabled={isOwned || !affordable || busy === item.id}
                onClick={async () => {
                  if (!affordable) {
                    play("error");
                    return;
                  }
                  setBusy(item.id);
                  const ok = await purchaseItem(item.id);
                  if (ok) setOwned((s) => new Set(s).add(item.id));
                  setBusy(null);
                }}
                className={cn("shrink-0", !affordable && !isOwned && "opacity-60")}
              >
                {isOwned
                  ? "Owned"
                  : busy === item.id
                    ? "…"
                    : affordable
                      ? "Buy"
                      : "Short"}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center font-ui text-[10px] font-bold uppercase tracking-wider text-wood-mid/55">
        {mode === "server"
          ? "Purchases persist to your account and deduct real currency."
          : "Sign in to save purchases — local play is a preview."}
      </p>
    </Modal>
  );
}
