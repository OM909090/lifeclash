"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SkyBackdrop } from "./SkyBackdrop";
import { FloatingIsland } from "@/components/art/Scenery";
import { WarriorSvg, ScholarSvg } from "@/components/art/Guardians";
import { Button } from "@/components/ui/Button";
import { GoldCoinSvg, TrophySvg, FlameSvg } from "@/components/art/ResourceIcons";
import {
  TownHallSvg,
  AcademySvg,
  DefenseTowerSvg,
} from "@/components/art/Buildings";
import { TreeSvg } from "@/components/art/Scenery";

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      type: "spring" as const,
      stiffness: 90,
      damping: 16,
    },
  }),
};

/**
 * Hero composition (mirrors design-refs/ref-landing-desktop.png):
 *
 *   ── clear sky ──────────────  headline · subline · CTA · stats
 *   ── floating realm ────────   island with a live village on it
 *   ── grass horizon ─────────   two Guardians standing in front
 *
 * The island deliberately starts *below* the CTA so every piece of copy sits on
 * open sky and stays legible.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pb-0 pt-28 sm:pt-32">
      <SkyBackdrop />

      {/* ------------------------------------------------------------ content */}
      <div className="relative z-30 mx-auto max-w-6xl px-4 text-center">
        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={0}
          className="mx-auto mb-5 inline-flex items-center gap-2 rounded-pill border-2 border-panel-ink/70 bg-panel-base/85 px-4 py-1.5 shadow-nav backdrop-blur-sm"
        >
          <FlameSvg size={16} />
          <span className="font-ui text-[10px] font-black uppercase tracking-widest text-cream sm:text-xs">
            Season 1 · Rise of the Realm — live now
          </span>
        </motion.div>

        <motion.h1
          variants={rise}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-outline text-hero"
        >
          <span className="block">Build the Life</span>
          <span className="block text-gold-light">You Want</span>
        </motion.h1>

        <motion.p
          variants={rise}
          initial="hidden"
          animate="show"
          custom={2}
          className="mx-auto mt-5 max-w-xl font-body text-lg font-extrabold leading-snug text-panel-ink sm:text-2xl"
          style={{ textShadow: "0 2px 0 rgba(255,255,255,.75)" }}
        >
          Turn real habits into a thriving world.
          <br className="hidden sm:block" /> Level up your life like a game.
        </motion.p>

        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-7 flex flex-col items-center gap-3.5"
        >
          <Link href="/onboarding">
            <Button
              tone="gold"
              size="xl"
              sfx="whoosh"
              className="px-9 text-xl shadow-[0_10px_0_#B9760F,0_18px_34px_rgba(0,0,0,.4),inset_0_3px_0_rgba(255,255,255,.5)] sm:px-14 sm:text-3xl"
            >
              ⚔️ Start Your Journey
            </Button>
          </Link>
          <span
            className="font-ui text-[11px] font-black uppercase tracking-widest text-panel-ink/70"
            style={{ textShadow: "0 1px 0 rgba(255,255,255,.6)" }}
          >
            Free forever · No credit card · 60-second setup
          </span>
        </motion.div>

        <motion.div
          variants={rise}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4"
        >
          <Stat icon={<TrophySvg size={18} />} value="12,480" label="Realms built" />
          <Stat icon={<GoldCoinSvg size={18} />} value="1.4M" label="Quests cleared" />
          <Stat icon="🐉" value="318" label="Dragons slain" />
        </motion.div>
      </div>

      {/* ------------------------------------------------- the floating realm */}
      {/* Sits behind the characters, cropped by the grass horizon below. */}
      <div className="relative z-10 mt-6 h-[300px] sm:mt-10 sm:h-[380px]">
        {/* Centring lives on this wrapper: Framer Motion writes its own
            `transform`, which would otherwise clobber -translate-x-1/2. */}
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 46 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
          {/* The CSS bob lives on its own element — a keyframed transform would
              take cascade priority over Framer's inline transform otherwise. */}
          <div className="relative animate-bob-slow">
            <FloatingIsland
              width={760}
              id="heroIsle"
              className="w-[min(92vw,760px)] drop-shadow-chunk"
            />

            {/* A live village on the island — this is the product, on screen.
                Percentages are tuned so each footprint lands on the grass cap
                (which spans roughly 19%–50% of the island artwork's height). */}
            <div className="pointer-events-none absolute inset-0">
              <AcademySvg
                level={7}
                width={128}
                className="absolute left-[16%] top-[17%] w-[17%]"
              />
              <DefenseTowerSvg
                level={8}
                width={104}
                className="absolute right-[15%] top-[15%] w-[14%]"
              />
              <TownHallSvg
                level={11}
                width={186}
                className="absolute left-1/2 top-[20%] w-[25%] -translate-x-1/2"
              />
              <TreeSvg width={46} variant={0} className="absolute left-[9%] top-[27%] w-[6%]" />
              <TreeSvg width={40} variant={1} className="absolute right-[7%] top-[29%] w-[5.5%]" />
              <TreeSvg width={36} variant={2} className="absolute left-[34%] top-[33%] w-[5%]" />
            </div>
          </div>
          </motion.div>
        </div>

        {/* satellite islet, far left — small and low so it reads as depth */}
        <div
          className="absolute left-[2%] top-[54%] hidden animate-bob opacity-80 lg:block"
          style={{ animationDelay: "-2.2s" }}
        >
          <FloatingIsland width={170} waterfall={false} id="heroIsleL" />
        </div>
        <div
          className="absolute right-[3%] top-[62%] hidden animate-bob opacity-70 lg:block"
          style={{ animationDelay: "-4s" }}
        >
          <FloatingIsland width={130} waterfall={false} id="heroIsleR" />
        </div>
      </div>

      {/* -------------------------------------------------------- characters */}
      <motion.div
        initial={{ opacity: 0, x: -70, y: 30 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.35, duration: 0.8, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-0 left-0 z-20 w-[30vw] min-w-[150px] max-w-[360px] translate-y-2 sm:-left-4 md:left-4"
      >
        <div className="animate-bob-slow">
          <WarriorSvg width={360} className="h-auto w-full drop-shadow-chunk" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 70, y: 30 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 0.48, duration: 0.8, ease: "easeOut" }}
        className="pointer-events-none absolute bottom-0 right-0 z-20 w-[28vw] min-w-[140px] max-w-[340px] translate-y-3 sm:-right-2 md:right-4"
      >
        <div className="animate-bob-slow" style={{ animationDelay: "-2.4s" }}>
          <ScholarSvg width={340} className="h-auto w-full drop-shadow-chunk" />
        </div>
      </motion.div>

      {/* ---------------------------------------------------- grass horizon */}
      <div className="relative z-[15] h-28 overflow-hidden bg-grass-gradient sm:h-32">
        {/* lip highlight along the crest */}
        <div className="h-2.5 w-full bg-grass-light/70" />
        {/* faint mown stripes for texture */}
        <div
          className="absolute inset-0 opacity-[.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,.6) 0 54px, transparent 54px 108px)",
          }}
        />
        {/* deepen toward the fold so it reads as ground, not a flat band */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-grass-deep/70 to-transparent" />
      </div>
    </section>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="counter gap-2 px-3 py-1.5">
      <span className="grid place-items-center text-base leading-none">{icon}</span>
      <span className="flex flex-col items-start leading-none">
        <span className="text-sm font-black tabular-nums text-cream">{value}</span>
        <span className="font-ui text-[9px] font-bold uppercase tracking-wider text-cream/65">
          {label}
        </span>
      </span>
    </div>
  );
}
