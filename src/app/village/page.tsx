import type { Metadata } from "next";
import { GameShell } from "@/components/village/GameShell";

export const metadata: Metadata = {
  title: "Your Realm — LifeClash",
  description:
    "Tap a building, open a quest, do it in real life, and watch your realm grow.",
};

export default function VillagePage() {
  return <GameShell />;
}
