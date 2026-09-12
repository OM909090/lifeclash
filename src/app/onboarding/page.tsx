import type { Metadata } from "next";
import { Wizard } from "@/components/onboarding/Wizard";

export const metadata: Metadata = {
  title: "Start Your Journey — LifeClash",
  description:
    "Six questions and sixty seconds. Name your realm, choose your pillars, and we'll build your world.",
};

export default function OnboardingPage() {
  return <Wizard />;
}
