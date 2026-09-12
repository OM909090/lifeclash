"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { play } from "@/lib/audio";
import { PanelHeader } from "./Panel";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  /** Extra controls in the header, left of the close button. */
  headerRight?: React.ReactNode;
  /** Sticky footer strip — action buttons live here. */
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "wood" | "stone" | "dark";
  children: React.ReactNode;
}

const WIDTH = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
} as const;

/**
 * Game-styled modal: scrim + spring-in wood plate.
 * Handles Escape, focus capture, and background scroll lock.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  headerRight,
  footer,
  size = "md",
  tone = "wood",
  children,
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        play("close");
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog so Escape/Tab behave predictably.
    const raf = window.requestAnimationFrame(() => cardRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.cancelAnimationFrame(raf);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Scrim. Deliberately not a <button>: the header already exposes a
              real Close control and Escape works, so a second focusable
              "Close" would just add a confusing stop in the tab order. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 cursor-default bg-panel-ink/72 backdrop-blur-[3px]"
            onClick={() => {
              play("close");
              onClose();
            }}
          />

          <motion.div
            ref={cardRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "relative flex max-h-[92vh] w-full flex-col overflow-hidden outline-none",
              WIDTH[size],
              tone === "wood"
                ? "panel-wood"
                : tone === "stone"
                  ? "panel-stone"
                  : "panel-dark",
            )}
            initial={{ y: 44, scale: 0.94, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 26, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <PanelHeader
              title={title}
              subtitle={subtitle}
              icon={icon}
              right={
                <div className="flex items-center gap-2">
                  {headerRight}
                  <button
                    aria-label="Close"
                    onClick={() => {
                      play("close");
                      onClose();
                    }}
                    className="btn3d btn3d-danger h-8 w-8 rounded-lg border-b-[4px] p-0 text-sm leading-none"
                  >
                    ✕
                  </button>
                </div>
              }
            />

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {children}
            </div>

            {footer ? (
              <div className="border-t-[4px] border-wood-dark/60 bg-tan-mid/70 px-4 py-3">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
