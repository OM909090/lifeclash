# KIRO AGENT DIRECTIVE: LifeClash Full-Stack Frontend & Asset Engineering

## Context & Vision
We are building **LifeClash**, an exceptional Life RPG web application for the IIT Bhubaneswar Web Hackathon.
Theme: **Clash of Clans (CoC) online village development UI/UX look, feel, and sound.**
The complete engineering specification has been placed at: `/home/om/Desktop/webhack-ps/LIFECLASH-SPEC.md`.

## Immediate Objective: Flawless Frontend & Asset System
Your top priority is to build the interactive frontend with production-grade visual polish, responsive isometric rendering, and custom SVG game assets:

1. **Asset Generation (Pure Code / Vector SVGs):**
   - Create crisp, modular SVG assets in `/public/assets/buildings/`:
     - Town Hall (Levels 1 to 5: wooden chieftain tent -> stone fortress -> gilded castle with banner).
     - Academy (Levels 1 to 5: study scroll bench -> stone library with glowing arcane book).
     - Training Grounds (Levels 1 to 5: wooden combat dummy -> iron colosseum with barbells).
     - Treasury (Levels 1 to 5: small lockbox -> vaulted stone vault overflowing with gold coins).
     - Defense Tower (Levels 1 to 5: wooden watchtower -> fortified stone ballista with glowing blue flame streak).
     - Clan Monument (Levels 1 to 5: marble obelisk with clan crest).
     - Raid Boss: "The Procrastination Dragon" (menacing cartoon dragon sprite with health bar and attack effects).
   - Resources icons: 3D beveled Gold Coin (`gold.svg`), glowing Elixir Flask (`elixir.svg`), Gem Diamond (`gem.svg`), and Builder Helmet (`builder.svg`).

2. **Frontend UI/UX Implementation (Next.js 14 App Router + Tailwind CSS):**
   - **Top Persistent HUD:**
     - XP Level Badge (blue shield), animated progress bar with numbers.
     - Builder icon indicating available/busy status.
     - Gold, Elixir, and Gem pill containers with drop shadows, gloss highlights, and beveled stone borders.
   - **Interactive Isometric Village Canvas:**
     - 2.5D Isometric grid with green checkerboard grass tiles and cobblestone pathways.
     - Interactive building plots. Hovering over a building scales it slightly with an active highlight.
     - Clicking a building opens a circular radial action menu at its base (`Info`, `Upgrade`, `Add Quest`).
     - Ambient floating resource collection bubbles above buildings.
   - **Bottom HUD:**
     - Action buttons styled as CoC wooden/stone buttons: `⚔️ Raid Boss`, `📜 Quests`, `🛡️ Clan`, `🔨 Shop/Build`, `⚙️ Settings`.
   - **Juicy Micro-interactions & Audio:**
     - Floating particles (`+100 XP`, `+50 🪙`) ascending towards the top HUD upon task completion.
     - Screen shake on Town Hall level-up with confetti/burst effect.
     - Built-in Web Audio synthesis/triggers for button clicks, coin collect, and upgrade hammer strikes.

Refer to `/home/om/Desktop/webhack-ps/LIFECLASH-SPEC.md` for exact data contracts, state management, and schema. Let's make this win the hackathon!
