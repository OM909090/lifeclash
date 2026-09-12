import { NavPill } from "@/components/landing/NavPill";
import { Hero } from "@/components/landing/Hero";
import { GuardiansSection } from "@/components/landing/GuardiansSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { LeaderboardPreview } from "@/components/landing/LeaderboardPreview";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="relative overflow-x-hidden">
      <NavPill />
      <Hero />
      <GuardiansSection />
      <FeaturesSection />
      <LeaderboardPreview />
      <Footer />
    </main>
  );
}
