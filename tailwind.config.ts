import type { Config } from "tailwindcss";

/**
 * LifeClash design tokens.
 *
 * Sourced from design-refs/ref-landing-desktop.png + KIRO-DESIGN-BRIEF.md §1.
 * The palette is deliberately high-chroma and high-contrast: bright sky above,
 * saturated grass below, and warm gold/wood UI furniture on top of both.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        /* ---------------------------------------------------------------- sky */
        sky: {
          deep: "#2FA8E0",
          base: "#5FC7F5",
          mid: "#8FDAFA",
          pale: "#BFE9FF",
          wash: "#E4F6FF",
        },

        /* -------------------------------------------------------------- grass */
        grass: {
          light: "#8FD34A",
          base: "#74BD3D",
          mid: "#55A537",
          dark: "#3E812F",
          deep: "#245B28",
        },

        /* --------------------------------------------------------------- gold */
        gold: {
          glow: "#FFF078",
          light: "#FFD447",
          base: "#F5B01E",
          dark: "#C88712",
          bevel: "#B9760F",
          deep: "#75430A",
          shadow: "#63380C",
        },

        /* ------------------------------------------------------------- elixir */
        elixir: {
          light: "#FFB8FF",
          base: "#D95CFF",
          mid: "#E765FF",
          dark: "#9E28CA",
          bevel: "#7A1BA0",
          deep: "#4E0F68",
        },

        /* ---------------------------------------------------------------- gem */
        gem: {
          light: "#9CFFA8",
          base: "#5CE86B",
          mid: "#33CC45",
          dark: "#1E9E2C",
          bevel: "#15761F",
          deep: "#0C4A14",
        },

        /* --------------------------------------------------------------- wood */
        wood: {
          light: "#C47A3C",
          base: "#8B5228",
          mid: "#6E401F",
          dark: "#4D2815",
          deep: "#33190C",
        },

        /* --------------------------------------------------------------- tan */
        tan: {
          light: "#F6E3C4",
          base: "#E9C79A",
          mid: "#D9AE79",
          dark: "#BC8C5A",
        },

        /* -------------------------------------------------------------- stone */
        stone: {
          light: "#CBD0CE",
          base: "#8D9395",
          mid: "#6C7375",
          dark: "#4E5558",
          deep: "#333A3D",
        },

        /* -------------------------------------------------------------- panel */
        panel: {
          light: "#344044",
          base: "#20282B",
          dark: "#15221D",
          ink: "#0E1517",
        },

        /* ------------------------------------------------------------- accent */
        xp: "#7BD84A",
        danger: "#E94B4B",
        warn: "#FF9F32",
        cream: "#FFF7D6",

        /* ------------------------------------------------- guardian identities */
        scholar: { base: "#5B6BE1", dark: "#2E3A9E", accent: "#5FE8FF" },
        warrior: { base: "#E0453F", dark: "#96211D", accent: "#D7DEE3" },
        merchant: { base: "#F0B429", dark: "#A8720C", accent: "#2FBF71" },
        sentinel: { base: "#3E8BE0", dark: "#1E4E8F", accent: "#FF9A3C" },
        dragon: { base: "#8C4BD6", dark: "#4A1E7D", accent: "#C79BFF" },
      },

      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        logo: ["var(--font-logo)", "var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
      },

      fontSize: {
        hero: ["clamp(2.75rem, 7.5vw, 6.5rem)", { lineHeight: "0.94" }],
        "section-title": ["clamp(2rem, 4.5vw, 3.75rem)", { lineHeight: "1" }],
      },

      boxShadow: {
        /* Signature chunky button bevels — the bottom border is the 3D face. */
        "btn-gold":
          "0 6px 0 #B9760F, 0 9px 14px rgba(0,0,0,.34), inset 0 2px 0 rgba(255,255,255,.45)",
        "btn-gold-sm":
          "0 4px 0 #B9760F, 0 6px 10px rgba(0,0,0,.3), inset 0 2px 0 rgba(255,255,255,.45)",
        "btn-elixir":
          "0 6px 0 #7A1BA0, 0 9px 14px rgba(0,0,0,.34), inset 0 2px 0 rgba(255,255,255,.38)",
        "btn-gem":
          "0 6px 0 #15761F, 0 9px 14px rgba(0,0,0,.34), inset 0 2px 0 rgba(255,255,255,.38)",
        "btn-stone":
          "0 6px 0 #4E5558, 0 9px 14px rgba(0,0,0,.34), inset 0 2px 0 rgba(255,255,255,.3)",
        "btn-wood":
          "0 6px 0 #4D2815, 0 9px 14px rgba(0,0,0,.34), inset 0 2px 0 rgba(255,255,255,.22)",
        "btn-danger":
          "0 6px 0 #8E2020, 0 9px 14px rgba(0,0,0,.34), inset 0 2px 0 rgba(255,255,255,.32)",

        /* Panels / cards */
        panel: "0 6px 0 rgba(0,0,0,.28), 0 14px 30px rgba(0,0,0,.32)",
        "panel-lift": "0 10px 0 rgba(0,0,0,.26), 0 22px 44px rgba(0,0,0,.38)",
        inset: "inset 0 3px 8px rgba(0,0,0,.45)",
        "inset-soft": "inset 0 2px 5px rgba(0,0,0,.3)",

        /* Glows */
        "glow-gold": "0 0 28px rgba(255,196,66,.7)",
        "glow-gem": "0 0 26px rgba(92,232,107,.65)",
        "glow-elixir": "0 0 26px rgba(217,92,255,.65)",
        "glow-sky": "0 0 40px rgba(120,220,255,.6)",
        nav: "0 10px 30px rgba(6,26,44,.45), inset 0 1px 0 rgba(255,255,255,.14)",
      },

      backgroundImage: {
        "sky-gradient":
          "linear-gradient(180deg, #2FA8E0 0%, #5FC7F5 34%, #8FDAFA 66%, #BFE9FF 100%)",
        "grass-gradient":
          "linear-gradient(145deg, #8FD34A 0%, #74BD3D 42%, #3E812F 100%)",
        "gold-gradient":
          "linear-gradient(180deg, #FFF078 0%, #FFD447 40%, #F5B01E 68%, #DC990E 100%)",
        "elixir-gradient":
          "linear-gradient(180deg, #FFB8FF 0%, #E765FF 42%, #9E28CA 100%)",
        "gem-gradient":
          "linear-gradient(180deg, #C6FFCE 0%, #5CE86B 44%, #1E9E2C 100%)",
        "stone-gradient":
          "linear-gradient(180deg, #E1E5E3 0%, #969D9F 45%, #555D60 100%)",
        "wood-gradient":
          "linear-gradient(180deg, #C47A3C 0%, #8A4D26 48%, #512913 100%)",
        "tan-gradient":
          "linear-gradient(180deg, #F6E3C4 0%, #E9C79A 52%, #C99B6B 100%)",
        "panel-gradient":
          "linear-gradient(180deg, #3A464A 0%, #20282B 55%, #15221D 100%)",
        "xp-gradient":
          "linear-gradient(180deg, #B6F585 0%, #7BD84A 50%, #4E9E28 100%)",
        gloss:
          "linear-gradient(180deg, rgba(255,255,255,.42) 0%, rgba(255,255,255,.06) 48%, rgba(255,255,255,0) 100%)",
      },

      borderRadius: {
        panel: "1.25rem",
        chunk: "0.875rem",
        pill: "999px",
      },

      keyframes: {
        /* Ambient sky life — floating XP orbs, coins, sprites. */
        drift: {
          "0%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(18px,-14px,0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
        "drift-across": {
          "0%": { transform: "translateX(-8vw) translateY(0)", opacity: "0" },
          "8%": { opacity: "1" },
          "92%": { opacity: "1" },
          "100%": {
            transform: "translateX(108vw) translateY(-40px)",
            opacity: "0",
          },
        },
        bob: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "bob-slow": {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(1.5deg)" },
        },
        sway: {
          "0%,100%": { transform: "rotate(-2.5deg)" },
          "50%": { transform: "rotate(2.5deg)" },
        },

        /* Feedback */
        "pulse-glow": {
          "0%,100%": { filter: "brightness(1)", opacity: "0.85" },
          "50%": { filter: "brightness(1.35)", opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%) skewX(-18deg)" },
          "100%": { transform: "translateX(320%) skewX(-18deg)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) scale(.7)", opacity: "0" },
          "18%": { transform: "translateY(-14px) scale(1.12)", opacity: "1" },
          "100%": { transform: "translateY(-92px) scale(1)", opacity: "0" },
        },
        "coin-pop": {
          "0%": { transform: "scale(.4) translateY(0)", opacity: "0" },
          "35%": { transform: "scale(1.2) translateY(-18px)", opacity: "1" },
          "100%": { transform: "scale(.85) translateY(-52px)", opacity: "0" },
        },
        shake: {
          "0%,100%": { transform: "translate(0,0) rotate(0deg)" },
          "15%": { transform: "translate(-7px,4px) rotate(-.6deg)" },
          "30%": { transform: "translate(6px,-4px) rotate(.6deg)" },
          "45%": { transform: "translate(-5px,-3px) rotate(-.4deg)" },
          "60%": { transform: "translate(5px,3px) rotate(.4deg)" },
          "80%": { transform: "translate(-2px,1px) rotate(-.2deg)" },
        },
        "hammer-strike": {
          "0%": { transform: "rotate(-58deg) translateY(-6px)" },
          "42%": { transform: "rotate(16deg) translateY(2px)" },
          "58%": { transform: "rotate(10deg) translateY(0)" },
          "100%": { transform: "rotate(-58deg) translateY(-6px)" },
        },
        "flame-flicker": {
          "0%,100%": { transform: "scaleY(1) scaleX(1)", opacity: ".92" },
          "40%": { transform: "scaleY(1.16) scaleX(.93)", opacity: "1" },
          "70%": { transform: "scaleY(.94) scaleX(1.05)", opacity: ".86" },
        },
        "ring-out": {
          "0%": { transform: "scale(.4)", opacity: ".85" },
          "100%": { transform: "scale(2.1)", opacity: "0" },
        },
        "cloud-pan": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-12vh) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(108vh) rotate(720deg)", opacity: "0" },
        },
      },

      animation: {
        drift: "drift 7s ease-in-out infinite",
        "drift-across": "drift-across linear infinite",
        bob: "bob 3.4s ease-in-out infinite",
        "bob-slow": "bob-slow 6s ease-in-out infinite",
        sway: "sway 4.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.2s ease-in-out infinite",
        shimmer: "shimmer 2.6s ease-in-out infinite",
        "float-up": "float-up 1.15s ease-out forwards",
        "coin-pop": "coin-pop .9s ease-out forwards",
        shake: "shake .55s ease-in-out",
        "hammer-strike": "hammer-strike .62s ease-in-out infinite",
        "flame-flicker": "flame-flicker 1.1s ease-in-out infinite",
        "ring-out": "ring-out .7s ease-out forwards",
        "cloud-pan": "cloud-pan 90s linear infinite",
        "confetti-fall": "confetti-fall linear forwards",
      },
    },
  },
  plugins: [],
};

export default config;
