import type { Metadata, Viewport } from "next";
import { Lilita_One, Luckiest_Guy, Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { StoreHydrator } from "@/components/system/StoreHydrator";

/* ---------------------------------------------------------------- typography */

/** Headings and display type — thick, hand-drawn, comic. */
const display = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/** The logotype — even chunkier than the display face. */
const logo = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-logo",
  display: "swap",
});

/** Body copy — rounded and friendly, matches the game's warmth. */
const body = Baloo_2({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/** Numerals and dense UI — Nunito has excellent tabular figures. */
const ui = Nunito({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

/* ------------------------------------------------------------------ metadata */

export const metadata: Metadata = {
  title: "LifeClash — Build the Life You Want",
  description:
    "Turn real habits into a thriving world. Level up your life like a game: build your realm, slay the Procrastination Dragon, and rise up the leagues.",
  keywords: [
    "life RPG",
    "habit tracker",
    "gamified productivity",
    "streaks",
    "LifeClash",
  ],
  openGraph: {
    title: "LifeClash — Build the Life You Want",
    description:
      "Turn real habits into a thriving world. Level up your life like a game.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#5FC7F5",
  width: "device-width",
  initialScale: 1,
  // The village canvas handles its own zoom; page-level pinch zoom would fight it.
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${display.variable} ${logo.variable} ${body.variable} ${ui.variable} font-body`}
      >
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
