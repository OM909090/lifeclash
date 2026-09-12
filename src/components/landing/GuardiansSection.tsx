"use client";

import { motion } from "framer-motion";
import { ArenaBackdrop } from "./SkyBackdrop";
import { GuardianArt } from "@/components/art/Guardians";
import { LevelBadge } from "@/components/ui/Badge";
import { GUARDIANS } from "@/lib/game-config";
import { BUILDINGS } from "@/lib/game-config";
import type { Guardian } from "@/types/game";
import { play } from "@/lib/audio";

/**
 * "Meet The Guardians" — a direct reskin of the hero-card gallery in
 * design-refs/ref-screen-2.png:
 *
 *   gold level badge on top → coloured name banner with element chip →
 *   character standing on a floating grass islet → light card body →
 *   blue footer with name + one-line description
 */
export function GuardiansSection() {
  return (
    <section
      id="guardians"
      className="relative isolate overflow-hidden py-20 sm:py-28"
    >
      <ArenaBackdrop />

      {/* ghosted display watermark, like the reference composition */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] leading-none text-white/[.035]"
      >
        GUARDIANS
      </span>

      <div className="relative mx-auto max-w-7xl px-4">
        <header className="mb-12 text-center sm:mb-16">
          <p className="mb-3 font-ui text-xs font-black uppercase tracking-[0.3em] text-sky-mid">
            Four pillars · four champions
          </p>
          <h2 className="text-outline-ink text-section-title">
            Meet The Guardians
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-base font-semibold text-sky-pale/80 sm:text-lg">
            Each Guardian watches over one part of your life. Choose your pillars
            and they&apos;ll fight beside you all season.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GUARDIANS.map((g, i) => (
            <GuardianCard key={g.id} guardian={g} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GuardianCard({
  guardian,
  index,
}: {
  guardian: Guardian;
  index: number;
}) {
  const building = BUILDINGS[guardian.building];

  return (
    <motion.article
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: index * 0.09, type: "spring", stiffness: 84, damping: 15 }}
      whileHover={{ y: -10 }}
      onMouseEnter={() => play("hover")}
      className="group relative flex flex-col overflow-hidden rounded-[1.6rem] border-[5px] border-panel-ink bg-tan-light shadow-panel-lift"
    >
      {/* ------------------------------------------------------- name banner */}
      <div
        className="relative px-4 pb-3 pt-7"
        style={{
          background: `linear-gradient(180deg, ${guardian.banner} 0%, ${guardian.bannerDark} 100%)`,
        }}
      >
        {/* gloss */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.32) 0%, rgba(255,255,255,0) 100%)",
          }}
        />

        {/* level badge, top-left, overlapping the banner edge */}
        <div className="absolute -top-1 left-3 z-10">
          <LevelBadge level={guardian.level} size="md" />
        </div>

        {/* element chip, top-right */}
        <div className="absolute right-3 top-2 z-10 flex items-center gap-1 rounded-pill border-2 border-panel-ink/60 bg-panel-ink/55 px-2 py-1 backdrop-blur-sm">
          <span className="text-xs leading-none">{guardian.elementEmoji}</span>
          <span className="font-ui text-[9px] font-black uppercase tracking-wider text-cream">
            {guardian.element}
          </span>
        </div>

        <h3 className="text-outline-xs relative mt-3 text-center text-xl leading-tight sm:text-2xl">
          {guardian.name}
        </h3>
      </div>

      {/* ------------------------------------------------------- portrait bay */}
      <div
        className="relative flex h-56 items-end justify-center overflow-hidden sm:h-64"
        style={{
          background: `radial-gradient(ellipse at 50% 22%, ${guardian.banner}33 0%, #F6E3C4 62%, #D9AE79 100%)`,
        }}
      >
        {/* radiating spotlight */}
        <span
          className="pointer-events-none absolute left-1/2 top-0 h-full w-[130%] -translate-x-1/2 opacity-45"
          style={{
            background: `conic-gradient(from 200deg at 50% 0%, transparent 0deg, ${guardian.accent}55 18deg, transparent 36deg, transparent 60deg, ${guardian.accent}44 78deg, transparent 96deg)`,
          }}
        />

        {/* the guardian */}
        <div className="relative z-10 transition-transform duration-300 group-hover:scale-[1.06]">
          <GuardianArt
            id={guardian.id}
            width={240}
            shadow={false}
            className="h-auto w-[190px] drop-shadow-chunk sm:w-[210px]"
          />
        </div>

        {/* floating grass islet under the feet */}
        <div className="absolute bottom-2 left-1/2 z-0 h-14 w-40 -translate-x-1/2">
          <div className="h-8 w-full rounded-[50%] border-[4px] border-wood-dark bg-grass-gradient" />
          <div className="mx-auto -mt-1 h-6 w-3/4 rounded-b-[60%] border-x-[4px] border-b-[4px] border-wood-dark bg-[linear-gradient(180deg,#8A6A46,#4E3A22)]" />
        </div>
      </div>

      {/* ---------------------------------------------------------- card body */}
      <div className="flex flex-1 flex-col gap-2 bg-tan-light px-4 py-4">
        <p className="font-ui text-[10px] font-black uppercase tracking-[0.16em] text-wood-mid">
          {guardian.pillar}
        </p>
        <p className="font-body text-sm font-semibold leading-snug text-wood-deep">
          {guardian.blurb}
        </p>
        <div className="mt-auto flex items-center gap-1.5 pt-2">
          <span className="rounded-pill border-2 border-wood-dark/40 bg-tan-mid px-2 py-0.5 font-ui text-[9px] font-black uppercase tracking-wide text-wood-deep">
            🏛 {building.name}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- footer */}
      <div
        className="relative border-t-[4px] border-panel-ink px-4 py-3"
        style={{
          background: `linear-gradient(180deg, ${guardian.banner} 0%, ${guardian.bannerDark} 100%)`,
        }}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,.26) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
        <p className="relative font-ui text-[11px] font-black uppercase tracking-wider text-cream/90">
          {guardian.title}
        </p>
      </div>
    </motion.article>
  );
}
