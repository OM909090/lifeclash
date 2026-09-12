"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoldCoinSvg, ElixirFlaskSvg } from "@/components/art/ResourceIcons";
import { useGame } from "@/store/game-store";
import { cn } from "@/lib/utils";

/**
 * Floating collectible that hovers over a building. Tapping it banks the
 * resource, fires the matching SFX, and spawns a floating "+N" particle.
 */
export function ResourceBubble({
  kind,
  amount,
  className,
  delay = 0,
}: {
  kind: "gold" | "elixir";
  amount: number;
  className?: string;
  delay?: number;
}) {
  const collectBubble = useGame((s) => s.collectBubble);
  const pushFx = useGame((s) => s.pushFx);
  const [taken, setTaken] = useState(false);

  const collect = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (taken) return;
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    pushFx({
      label: `+${amount}`,
      x: rect.left + rect.width / 2,
      y: rect.top,
      tone: kind,
    });

    collectBubble(kind, amount);
    setTaken(true);
  };

  return (
    <AnimatePresence>
      {!taken ? (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.7, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 18, delay }}
          onClick={collect}
          aria-label={`Collect ${amount} ${kind}`}
          className={cn("group absolute z-[55] cursor-pointer", className)}
        >
          <span
            className="block animate-bob"
            style={{ animationDelay: `${-delay * 2}s` }}
          >
            <span
              className={cn(
                "relative grid h-10 w-10 place-items-center rounded-full border-[3px] border-white/75 backdrop-blur-sm transition-transform group-hover:scale-110",
                kind === "gold"
                  ? "bg-gold-light/35 shadow-glow-gold"
                  : "bg-elixir-base/30 shadow-glow-elixir",
              )}
            >
              {/* glass highlight */}
              <span className="pointer-events-none absolute left-1.5 top-1 h-2.5 w-3.5 rounded-full bg-white/70 blur-[1px]" />
              {kind === "gold" ? (
                <GoldCoinSvg size={22} />
              ) : (
                <ElixirFlaskSvg size={22} />
              )}
            </span>
          </span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
