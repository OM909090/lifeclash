"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GuardianArt } from "@/components/art/Guardians";
import { play } from "@/lib/audio";

const COLUMNS = [
  {
    title: "Game",
    links: ["Features", "Guardians", "Leaderboard", "Seasons", "Clans"],
  },
  {
    title: "Pillars",
    links: ["Mind", "Body", "Wealth", "Discipline", "Recovery", "Focus"],
  },
  {
    title: "About",
    links: ["Our story", "Roadmap", "Changelog", "Press kit"],
  },
];

export function Footer() {
  return (
    <footer
      id="about"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#1B2740_0%,#0E1626_100%)] pt-20"
    >
      {/* -------------------------------------------------------- final CTA */}
      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-outline-ink text-section-title">
          Your Realm Awaits
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-body text-base font-semibold text-sky-pale/75 sm:text-lg">
          Six questions, sixty seconds, and your world is built. Then it&apos;s just
          you versus the Dragon.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/onboarding">
            <Button tone="gold" size="xl" sfx="whoosh" className="px-10 sm:px-14">
              ⚔️ Start Your Journey
            </Button>
          </Link>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <StoreBadge icon="" label="iOS" note="Coming soon" />
            <StoreBadge icon="▶" label="Android" note="Coming soon" />
            <StoreBadge icon="🌐" label="Play in browser" note="Available now" live />
          </div>
        </div>
      </div>

      {/* guardians standing along the footer horizon */}
      <div className="pointer-events-none relative mt-12 flex items-end justify-center gap-2 opacity-90 sm:gap-10">
        <GuardianArt id="merchant" width={150} className="hidden h-auto w-[110px] sm:block" />
        <GuardianArt id="warrior" width={170} className="h-auto w-[100px] sm:w-[130px]" />
        <GuardianArt id="sentinel" width={170} className="h-auto w-[100px] sm:w-[130px]" />
        <GuardianArt id="scholar" width={150} className="hidden h-auto w-[110px] sm:block" />
      </div>

      {/* grass horizon */}
      <div className="relative h-8 bg-grass-gradient">
        <div className="h-1.5 w-full bg-grass-light/70" />
      </div>

      {/* ------------------------------------------------------------- links */}
      <div className="relative bg-panel-ink/80">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl border-2 border-gold-deep bg-gold-gradient text-lg">
                ⚡
              </span>
              <span className="font-logo text-xl text-cream">
                Life<span className="text-gold-light">Clash</span>
              </span>
            </div>
            <p className="max-w-xs font-body text-sm font-semibold leading-relaxed text-sky-pale/55">
              A life RPG where real habits build a real-feeling world. Original art,
              original audio, built for people who bounce off normal to-do lists.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 font-ui text-xs font-black uppercase tracking-[0.2em] text-gold-light">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <button
                      onClick={() => play("tap")}
                      className="font-body text-sm font-semibold text-sky-pale/60 transition-colors hover:text-cream"
                    >
                      {l}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row">
            <p className="font-ui text-[11px] font-bold text-sky-pale/45">
              © {new Date().getFullYear()} LifeClash. Built for the IIT Bhubaneswar Web
              Hackathon.
            </p>
            <p className="text-center font-ui text-[11px] font-bold text-sky-pale/35 sm:text-right">
              All characters, buildings, icons and sound effects are original work.
              Not affiliated with any existing game.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function StoreBadge({
  icon,
  label,
  note,
  live,
}: {
  icon: string;
  label: string;
  note: string;
  live?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-2 rounded-chunk border-2 px-3 py-1.5 ${
        live
          ? "border-gem-deep bg-gem-base/20"
          : "border-white/15 bg-white/5"
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="flex flex-col items-start leading-none">
        <span className="font-ui text-[11px] font-black text-cream">{label}</span>
        <span
          className={`font-ui text-[8px] font-bold uppercase tracking-wider ${
            live ? "text-gem-light" : "text-sky-pale/45"
          }`}
        >
          {note}
        </span>
      </span>
    </span>
  );
}
