"use client";

import { motion } from "framer-motion";
import { PhoneMockup } from "./PhoneMockup";
import { DragonSvg } from "@/components/art/Dragon";
import { FloatingIsland, Cloud } from "@/components/art/Scenery";
import { LeagueBadge } from "@/components/art/LeagueBadge";
import { TownHallSvg, AcademySvg } from "@/components/art/Buildings";
import { LEAGUES } from "@/lib/game-config";
import { cn } from "@/lib/utils";

/**
 * "Build. Battle. Grow." — the three-block feature section from
 * design-refs/ref-screen-3.png, each with its own art panel.
 */
export function FeaturesSection() {
  return (
    <section id="features" className="relative isolate overflow-hidden bg-sky-wash">
      {/* soft sky wash + clouds bleeding in from the hero */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#BFE9FF_0%,#E4F6FF_38%,#F6E3C4_100%)]" />
        <Cloud width={340} className="absolute -left-16 top-10 opacity-70" />
        <Cloud width={260} className="absolute right-0 top-40 opacity-55" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
        <header className="mb-14 text-center sm:mb-20">
          <p className="mb-3 font-ui text-xs font-black uppercase tracking-[0.3em] text-wood-mid">
            The loop that actually sticks
          </p>
          <h2 className="text-outline text-section-title">
            Build. Battle. Grow.
          </h2>
        </header>

        <div className="flex flex-col gap-16 sm:gap-24">
          {/* -------------------------------------------------------- BUILD */}
          <FeatureRow
            eyebrow="01 · Build"
            title="Build your realm"
            body="Every pillar of your life becomes a building. Study and your Academy rises. Train and the Colosseum fills. Save and the Treasury overflows. Your progress stops being a checklist and becomes a place."
            bullets={[
              "Six buildings, one per life pillar",
              "Buildings visibly level up as you show up",
              "Fixed isometric board — always readable",
            ]}
            art={<PhoneMockup />}
          />

          {/* ------------------------------------------------------- BATTLE */}
          <FeatureRow
            reverse
            eyebrow="02 · Battle"
            title="Slay the Procrastination Dragon"
            body="Every quest you finish in real life lands damage on the weekly raid boss. Your whole clan chips at the same health bar, so the day you don't feel like it is the day someone else carries the swing."
            bullets={[
              "Weekly co-op raid, no real-time combat",
              "Quest difficulty scales the damage",
              "Boss flavour matches your biggest weakness",
            ]}
            art={
              <div className="relative">
                <div className="animate-bob-slow">
                  <DragonSvg width={420} className="h-auto w-[min(82vw,420px)] drop-shadow-chunk" />
                </div>
                {/* HP bar under the dragon */}
                <div className="panel-dark mx-auto mt-2 w-[min(78vw,340px)] p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-ui text-[10px] font-black uppercase tracking-widest text-elixir-light">
                      Raid Boss
                    </span>
                    <span className="font-ui text-[10px] font-black tabular-nums text-cream/80">
                      72,450 / 120,000
                    </span>
                  </div>
                  <div className="well h-4 overflow-hidden">
                    <div className="h-full w-[60%] rounded-pill bg-[linear-gradient(180deg,#FF9A8F,#E94B4B_48%,#A32020)]">
                      <span className="sheen rounded-pill" />
                    </div>
                  </div>
                </div>
              </div>
            }
          />

          {/* --------------------------------------------------------- GROW */}
          <FeatureRow
            eyebrow="03 · Grow"
            title="Rise up the leagues"
            body="Consistency Trophies come from streaks and completed quests — not from grinding. Climb from Wood to Legend, get promoted weekly, and see exactly where you stand against your friends and your clan."
            bullets={[
              "Seven leagues, weekly promotion",
              "Global · Friends · Clan leaderboards",
              "Season reward track with cosmetics",
            ]}
            art={
              <div className="relative flex flex-col items-center gap-4">
                {/* league ladder */}
                <div className="panel-wood w-[min(84vw,380px)] p-4">
                  <p className="text-outline-xs mb-3 text-center text-base">
                    Consistency Trophies
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {LEAGUES.slice()
                      .reverse()
                      .slice(0, 5)
                      .map((l, i) => (
                        <div
                          key={l.id}
                          className={cn(
                            "flex items-center gap-2.5 rounded-chunk border-2 px-2.5 py-1.5",
                            i === 2
                              ? "border-gold-deep bg-gold-base/35"
                              : "border-wood-dark/30 bg-tan-light/60",
                          )}
                        >
                          <LeagueBadge league={l.id} size={30} />
                          <span className="text-outline-xs flex-1 text-left text-sm">
                            {l.name}
                          </span>
                          <span className="font-ui text-[11px] font-black tabular-nums text-wood-mid">
                            {l.minTrophies}+
                          </span>
                          {i === 2 ? (
                            <span className="rounded-pill border-2 border-gold-deep bg-gold-base px-1.5 py-0.5 font-ui text-[8px] font-black uppercase text-wood-deep">
                              You
                            </span>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </div>

                {/* floating island with two buildings for flavour */}
                <div className="relative -mt-2 hidden sm:block">
                  <FloatingIsland width={320} id="growIsle" waterfall={false} />
                  <TownHallSvg level={9} width={90} className="absolute left-[86px] top-[26px]" />
                  <AcademySvg level={7} width={64} className="absolute left-[26px] top-[52px]" />
                </div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  eyebrow,
  title,
  body,
  bullets,
  art,
  reverse,
}: {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  art: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
        reverse && "lg:[&>*:first-child]:order-2",
      )}
    >
      <motion.div
        initial={{ opacity: 0, x: reverse ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <p className="mb-2 font-ui text-xs font-black uppercase tracking-[0.28em] text-wood-mid">
          {eyebrow}
        </p>
        <h3 className="text-outline-md text-3xl sm:text-5xl">{title}</h3>
        <p className="mt-5 max-w-xl font-body text-base font-semibold leading-relaxed text-wood-deep sm:text-lg">
          {body}
        </p>
        <ul className="mt-6 flex flex-col gap-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 border-gem-deep bg-gem-gradient text-[10px] font-black text-[#0C4A14]">
                ✓
              </span>
              <span className="font-body text-sm font-bold text-wood-mid sm:text-base">
                {b}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 44, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex justify-center"
      >
        {art}
      </motion.div>
    </div>
  );
}
