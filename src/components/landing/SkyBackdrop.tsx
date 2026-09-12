"use client";

import { Cloud } from "@/components/art/Scenery";
import { GoldCoinSvg, GemSvg, TrophySvg } from "@/components/art/ResourceIcons";
import { cn, seeded } from "@/lib/utils";

/**
 * The bright sky world behind everything: vertical gradient, layered volumetric
 * clouds, a sun bloom, and ambient life drifting across the frame.
 *
 * All positions are derived deterministically from the sprite index (never
 * Math.random) so server and client markup match exactly.
 */

const CLOUD_ROWS = [
  { top: "6%", width: 380, opacity: 0.95, duration: 96, delay: 0 },
  { top: "16%", width: 260, opacity: 0.8, duration: 132, delay: -30 },
  { top: "34%", width: 460, opacity: 0.7, duration: 168, delay: -70 },
  { top: "58%", width: 300, opacity: 0.55, duration: 148, delay: -50 },
];

/** Tiny life-pillar sprites that float through the sky. */
const SPRITES = [
  { kind: "coin", size: 26 },
  { kind: "xp", size: 22 },
  { kind: "book", size: 24 },
  { kind: "gem", size: 22 },
  { kind: "dumbbell", size: 26 },
  { kind: "coin", size: 20 },
  { kind: "trophy", size: 24 },
  { kind: "xp", size: 18 },
  { kind: "book", size: 20 },
  { kind: "coin", size: 24 },
] as const;

function Sprite({ kind, size }: { kind: string; size: number }) {
  switch (kind) {
    case "coin":
      return <GoldCoinSvg size={size} className="drop-shadow-sprite" />;
    case "gem":
      return <GemSvg size={size} className="drop-shadow-sprite" />;
    case "trophy":
      return <TrophySvg size={size} className="drop-shadow-sprite" />;
    case "xp":
      return (
        <span
          className="grid place-items-center rounded-full border-2 border-[#3C7A1E] bg-[radial-gradient(circle_at_35%_30%,#D6FBA8,#7BD84A_55%,#4E9E28)] font-ui font-black text-[#1B3A0C] shadow-glow-gem"
          style={{ width: size, height: size, fontSize: size * 0.42 }}
        >
          XP
        </span>
      );
    case "book":
      return <BookSprite size={size} />;
    case "dumbbell":
      return <DumbbellSprite size={size} />;
    default:
      return null;
  }
}

/* Drawn rather than typed: emoji glyphs vary wildly across platforms and some
   Linux setups have no colour emoji font at all. */

function BookSprite({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 28 24"
      width={size}
      height={(size * 24) / 28}
      className="drop-shadow-sprite"
    >
      <path d="M2 3h24v18H2z" fill="#5A3417" stroke="#2A1608" strokeWidth="2" />
      <path d="M4 5h9v14H4z" fill="#FFF7D6" />
      <path d="M15 5h9v14h-9z" fill="#F1E4BE" />
      <path d="M12.6 3h2.8v18h-2.8z" fill="#3B220E" />
      <g stroke="#5B6BE1" strokeWidth="1.4" strokeLinecap="round">
        <path d="M6 9h5M6 12h5M17 9h5M17 12h5" />
      </g>
    </svg>
  );
}

function DumbbellSprite({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 30 20"
      width={size}
      height={(size * 20) / 30}
      className="drop-shadow-sprite"
    >
      <rect x="9" y="8" width="12" height="4" rx="2" fill="#D7DEE3" stroke="#2A1608" strokeWidth="1.8" />
      <rect x="3" y="4" width="6" height="12" rx="2.5" fill="#3B4245" stroke="#2A1608" strokeWidth="1.8" />
      <rect x="21" y="4" width="6" height="12" rx="2.5" fill="#3B4245" stroke="#2A1608" strokeWidth="1.8" />
      <rect x="4.2" y="5.6" width="1.6" height="8" rx="0.8" fill="#7C8B94" />
    </svg>
  );
}

export function SkyBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-sky-gradient",
        className,
      )}
      aria-hidden="true"
    >
      {/* sun bloom, upper right */}
      <div
        className="absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,248,214,.95) 0%, rgba(255,229,140,.5) 40%, rgba(255,229,140,0) 72%)",
        }}
      />

      {/* horizon haze */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-sky-wash/85 to-transparent" />

      {/* cloud bands — each is a doubled strip panning left forever */}
      {CLOUD_ROWS.map((row, i) => (
        <div
          key={i}
          className="absolute left-0 flex w-[200%] animate-cloud-pan items-center"
          style={{
            top: row.top,
            animationDuration: `${row.duration}s`,
            animationDelay: `${row.delay}s`,
          }}
        >
          {[0, 1].map((half) => (
            <div key={half} className="flex w-1/2 shrink-0 justify-around">
              {[0, 1, 2].map((n) => (
                <Cloud
                  key={n}
                  // Rounded: raw Math.sin output differs in the last FP digit
                  // between Node and the browser, which trips hydration.
                  width={Math.round(row.width * (0.72 + seeded(i * 7 + n) * 0.6))}
                  opacity={row.opacity}
                  className="shrink-0"
                />
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* ambient sprites drifting across */}
      {SPRITES.map((s, i) => {
        const top = 8 + seeded(i * 3.1) * 76;
        const duration = 26 + seeded(i * 5.7) * 30;
        const delay = -seeded(i * 9.3) * duration;
        return (
          <div
            key={i}
            className="absolute animate-drift-across"
            style={{
              top: `${top}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          >
            <span
              className="block animate-bob"
              style={{ animationDuration: `${2.6 + seeded(i) * 2.4}s` }}
            >
              <Sprite kind={s.kind} size={s.size} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Dark starry variant used behind the "Meet The Guardians" arena section. */
export function ArenaBackdrop({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,#3A4C6E_0%,#1B2740_45%,#0E1626_100%)]" />
      {/* spotlight wash from above */}
      <div
        className="absolute left-1/2 top-0 h-[520px] w-[860px] -translate-x-1/2 opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(120,200,255,.55) 0%, rgba(120,200,255,0) 70%)",
        }}
      />
      {/* stars */}
      {Array.from({ length: 46 }, (_, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-pulse-glow"
          style={{
            left: `${seeded(i * 1.7) * 100}%`,
            top: `${seeded(i * 2.9) * 100}%`,
            width: 1 + seeded(i * 4.3) * 2.4,
            height: 1 + seeded(i * 4.3) * 2.4,
            opacity: 0.25 + seeded(i * 6.1) * 0.65,
            animationDuration: `${2 + seeded(i * 8.9) * 3}s`,
          }}
        />
      ))}
    </div>
  );
}
