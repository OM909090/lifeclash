"use client";

import { useMemo } from "react";
import { seeded } from "@/lib/utils";

const COLORS = [
  "#FFD447",
  "#5CE86B",
  "#D95CFF",
  "#5FC7F5",
  "#FF9A3C",
  "#FFF7D6",
  "#E0453F",
];

/**
 * Pure-CSS confetti burst. Fixed overlay, pointer-events-none, self-clearing
 * because every piece runs its keyframe once with `forwards`.
 *
 * Positions come from the deterministic `seeded` helper rather than
 * Math.random so the markup is stable across a server render.
 */
export function Confetti({
  count = 80,
  duration = 3.2,
}: {
  count?: number;
  duration?: number;
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const isRibbon = seeded(i * 3.7) > 0.62;
        return {
          left: seeded(i * 1.3) * 100,
          delay: seeded(i * 2.1) * 1.1,
          dur: duration * (0.72 + seeded(i * 4.9) * 0.6),
          color: COLORS[Math.floor(seeded(i * 5.3) * COLORS.length)],
          w: isRibbon ? 5 : 8 + seeded(i * 6.7) * 5,
          h: isRibbon ? 14 + seeded(i * 7.1) * 8 : 8 + seeded(i * 6.7) * 5,
          round: !isRibbon && seeded(i * 8.3) > 0.55,
          drift: (seeded(i * 9.7) - 0.5) * 90,
        };
      }),
    [count, duration],
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[120] overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : 2,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            // Horizontal scatter without a second keyframe track.
            marginLeft: p.drift,
            boxShadow: "0 1px 2px rgba(0,0,0,.25)",
          }}
        />
      ))}
    </div>
  );
}
