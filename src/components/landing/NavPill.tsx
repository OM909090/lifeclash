"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { play } from "@/lib/audio";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Guardians", href: "#guardians" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "About", href: "#about" },
];

/** The glossy near-black nav pill from the reference art. */
export function NavPill() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-all duration-300 sm:px-6 sm:pt-5",
        scrolled && "pt-2 sm:pt-3",
      )}
    >
      <nav
        className={cn(
          "nav-pill mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 transition-all duration-300 sm:px-5 sm:py-2.5",
          scrolled && "shadow-[0_14px_38px_rgba(6,26,44,.55)]",
        )}
      >
        {/* ------------------------------------------------------------ logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2"
          onClick={() => play("tap")}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl border-2 border-gold-deep bg-gold-gradient text-lg shadow-btn-gold-sm transition-transform group-hover:scale-105 sm:h-10 sm:w-10">
            ⚡
          </span>
          <span className="font-logo text-lg leading-none text-cream sm:text-xl">
            Life
            <span className="text-gold-light">Clash</span>
          </span>
        </Link>

        {/* ----------------------------------------------------------- links */}
        <ul className="ml-4 hidden flex-1 items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onMouseEnter={() => play("hover")}
                onClick={() => play("tap")}
                className="rounded-pill px-3.5 py-2 font-ui text-sm font-extrabold text-cream/85 transition-colors hover:bg-white/10 hover:text-cream"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex-1 lg:hidden" />

        {/* ------------------------------------------------------------- CTA */}
        <Link href="/onboarding" className="shrink-0">
          <Button tone="gold" size="sm" className="sm:px-5 sm:py-2 sm:text-sm">
            Play Free
          </Button>
        </Link>

        {/* --------------------------------------------------- mobile toggle */}
        <button
          className="btn3d btn3d-stone h-9 w-9 rounded-lg border-b-[4px] p-0 text-base leading-none lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => {
            play("tap");
            setOpen((v) => !v);
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* --------------------------------------------------- mobile dropdown */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="nav-pill mx-auto mt-2 max-w-6xl overflow-hidden rounded-panel p-2 lg:hidden"
          >
            <ul className="flex flex-col">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => {
                      play("tap");
                      setOpen(false);
                    }}
                    className="block rounded-chunk px-4 py-3 font-ui text-sm font-extrabold text-cream/90 hover:bg-white/10"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
