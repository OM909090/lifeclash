"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VillageCanvas } from "./VillageCanvas";
import { TopHUD } from "@/components/hud/TopHUD";
import { BottomHUD } from "@/components/hud/BottomHUD";
import { FxLayer, ShakeWrapper } from "@/components/fx/FxLayer";
import { QuestModal } from "@/components/modals/QuestModal";
import { UpgradeModal } from "@/components/modals/UpgradeModal";
import { RaidModal } from "@/components/modals/RaidModal";
import { ClanModal } from "@/components/modals/ClanModal";
import { InfoModal } from "@/components/modals/InfoModal";
import { ShopModal } from "@/components/modals/ShopModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { LeaderboardModal } from "@/components/modals/LeaderboardModal";
import { SeasonModal } from "@/components/modals/SeasonModal";
import { ProfileModal } from "@/components/modals/ProfileModal";
import { useGame } from "@/store/game-store";
import { BUILDINGS } from "@/lib/game-config";

/**
 * The full game view: board + HUDs + modal layer + FX.
 *
 * Sized to the viewport (dvh so mobile browser chrome doesn't clip the bottom
 * HUD) with the board filling the space between the two HUDs.
 */
export function GameShell() {
  const router = useRouter();
  const hydrated = useGame((s) => s.hydrated);
  const seeded = useGame((s) => s.seeded);
  const buildings = useGame((s) => s.buildings);

  /* If someone lands here without a realm, send them through onboarding. */
  useEffect(() => {
    if (hydrated && !seeded) router.replace("/onboarding");
  }, [hydrated, seeded, router]);

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-sky-base">
      {/* Screen-reader alternative to the canvas (LIFECLASH-SPEC.md NFR-6). */}
      <h1 className="sr-only">Your village</h1>
      <ul className="sr-only">
        {buildings.map((b) => (
          <li key={b.id}>
            {BUILDINGS[b.type].name}, level {b.level},{" "}
            {b.status === "LOCKED" ? "locked" : "active"} — {BUILDINGS[b.type].domain}
          </li>
        ))}
      </ul>

      <ShakeWrapper>
        <VillageCanvas />
      </ShakeWrapper>

      <TopHUD />
      <BottomHUD />

      {/* modal layer — only one is ever open at a time */}
      <QuestModal />
      <UpgradeModal />
      <RaidModal />
      <ClanModal />
      <InfoModal />
      <ShopModal />
      <SettingsModal />
      <LeaderboardModal />
      <SeasonModal />
      <ProfileModal />

      <FxLayer />
    </main>
  );
}
