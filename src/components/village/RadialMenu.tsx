"use client";

import { motion, AnimatePresence } from "framer-motion";
import { play } from "@/lib/audio";
import { cn } from "@/lib/utils";

export interface RadialAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  tone: "gold" | "elixir" | "gem" | "stone";
  disabled?: boolean;
  onSelect: () => void;
}

const TONE: Record<RadialAction["tone"], string> = {
  gold: "btn3d-gold",
  elixir: "btn3d-elixir",
  gem: "btn3d-gem",
  stone: "btn3d-stone",
};

/**
 * Circular action ring that fans out from the base of a selected building.
 *
 * Buttons are laid out on an arc above the building so they never cover it.
 * The arc spans 200°→340° (up and outward) which keeps every button clear of
 * the footprint and readable at phone width.
 */
export function RadialMenu({
  open,
  actions,
  radius = 74,
}: {
  open: boolean;
  actions: RadialAction[];
  radius?: number;
}) {
  const count = actions.length;
  // Fan across the top arc, centred straight up (-90°).
  const spread = Math.min(150, 46 * (count - 1));
  const start = -90 - spread / 2;

  return (
    <AnimatePresence>
      {open ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[60] h-0 w-0">
          {/* selection pulse ring */}
          <motion.span
            initial={{ scale: 0.4, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0.35 }}
            exit={{ scale: 0.4, opacity: 0 }}
            className="absolute -left-14 -top-7 h-14 w-28 rounded-[50%] border-[3px] border-gold-light"
            style={{ boxShadow: "0 0 22px rgba(255,212,71,.6)" }}
          />

          {actions.map((a, i) => {
            const angle =
              count === 1 ? -90 : start + (spread / (count - 1)) * i;
            const rad = (angle * Math.PI) / 180;
            // Squash vertically to match the isometric perspective.
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius * 0.82;

            return (
              <motion.button
                key={a.id}
                initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                animate={{ x, y, scale: 1, opacity: 1 }}
                exit={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 24,
                  delay: i * 0.035,
                }}
                data-interactive
                aria-label={a.label}
                title={a.label}
                disabled={a.disabled}
                onMouseEnter={() => !a.disabled && play("hover")}
                onClick={(e) => {
                  e.stopPropagation();
                  if (a.disabled) {
                    play("error");
                    return;
                  }
                  play("tap");
                  a.onSelect();
                }}
                className={cn(
                  "btn3d pointer-events-auto absolute -ml-[26px] -mt-[26px] h-[52px] w-[52px] flex-col gap-0 rounded-full border-b-[5px] p-0",
                  TONE[a.tone],
                  a.disabled && "opacity-45 saturate-50",
                )}
              >
                <span className="grid h-5 place-items-center text-base leading-none">
                  {a.icon}
                </span>
                <span
                  className="font-ui text-[7.5px] font-black uppercase leading-none tracking-tight"
                  style={{ WebkitTextStroke: "0px" }}
                >
                  {a.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      ) : null}
    </AnimatePresence>
  );
}
