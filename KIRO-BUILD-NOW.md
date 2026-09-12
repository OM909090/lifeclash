You are the lead engineer building "LifeClash" — a gamified Life RPG web app with an authentic Clash of Clans village look/feel — for a 24h hackathon. Work in this folder: /home/om/Desktop/webhack-ps

## STEP 0 — STUDY FIRST (do this before writing any code, then summarize back to me what you understood)
Read these files in full and internalize them:
1. design-refs/ref-landing-desktop.png  (the hero landing look)
2. design-refs/ref-screen-2.png          (the "Meet The Heroes" hero-card gallery)
3. design-refs/ref-screen-3.png          (full composition + isometric village phone mockup)
4. KIRO-DESIGN-BRIEF.md                    (character reskin, onboarding wizard, competitive systems — the source of truth for UX)
5. LIFECLASH-SPEC.md                       (full SRS: schema, API contracts, anti-cheat, game rules)
6. LIFECLASH-FRONTEND-CODE.md              (starter component/code architecture)
After reading, give me a short confirmation of the plan and the file/folder structure you will create. Then proceed automatically — do not wait.

## STEP 1 — SCAFFOLD
Create a Next.js 14 (App Router) + TypeScript + Tailwind CSS project in this folder. Add Framer Motion + Zustand. Set up Google Fonts: Lilita One / Luckiest Guy (display) and Baloo 2 / Nunito (body).

## STEP 2 — DESIGN SYSTEM (match the reference exactly)
Build tailwind.config.ts with the CoC tokens from the brief: sky-blue gradient background, grass greens, gold/amber, elixir magenta, gem green, stone/wood browns. Build the signature 3D gold button (chunky, border-b-4 bevel, cream text + brown outline, press = translate-y-1). Build reusable wood/stone panel + card components with top gloss and drop shadow.

## STEP 3 — BUILD THE FRONTEND END TO END (this is the priority — polish wins the demo)
Build in this order, each fully working and responsive:
1. LANDING PAGE — reskin of ref-landing-desktop.png: glossy dark nav pill (logo + Features/Guardians/Leaderboard/About + gold "Play Free"), hero "Build the Life You Want" with two Guardian characters + floating sky-island realm, giant gold "⚔️ Start Your Journey" CTA, "Meet The Guardians" 4-card section, "Build. Battle. Grow." feature section, phone mockup of the village, footer. Floating ambient sprites (XP orbs, coins) drifting in the sky.
2. ONBOARDING WIZARD — the 8-step "Start Your Journey" flow from the brief (name realm → pick pillars → current consistency → biggest enemy → daily time budget → season goal → "Forging your world…" staged planning animation → camera fly-in + Guardian tutorial). Full-screen island background, gold progress bar, Framer Motion slide transitions, answers held in Zustand.
3. VILLAGE — interactive 2.5D isometric canvas: green checkerboard tiles, stone paths, perimeter trees, 6 building plots (Town Hall, Academy, Training Grounds, Treasury, Defense Tower, Clan Monument). Hover highlight + click selection + circular radial action menu (Info / Upgrade / Quest). Floating collectible resource bubbles.
4. HUDs — Top HUD (XP level shield + progress bar, builders free/busy, gold/elixir/gem beveled counters) and Bottom HUD (⚔️ Raid Boss, 📜 Quests, 🛡️ Clan, 🔨 Shop, ⚙️ Settings) as chunky 3D buttons.
5. MODALS — Quest modal (daily/study/workout quests → XP/Gold/Elixir), Upgrade modal (hammer-strike animation), Raid Boss "The Procrastination Dragon" (HP bar, quests deal damage), Clan Monument (collective progress).
6. CHARACTER ART — original SVG Guardians (Scholar, Warrior, Merchant, Sentinel) + the Procrastination Dragon + building SVGs at multiple levels. Original art only, no Supercell assets.
7. JUICE — Web Audio API SFX (tap, coin collect, upgrade hammer, level-up fanfare), floating "+100 XP" particles, screen-shake + confetti on level-up.

## STEP 4 — COMPETITIVE LAYER (frontend)
Leagues with Consistency Trophies (Wood→Legend + badge on HUD/profile), Global/Friends/Clan leaderboards with podium styling, Clan page + Clan Monument, weekly Raid Boss, Seasons reward track.

## RULES
- Frontend first and exceptionally polished; wire mock/local state now, real backend (Postgres/Prisma, server-authoritative rewards, anti-cheat) after the UI feels great — follow LIFECLASH-SPEC.md for schema + API contracts.
- Keep it fully responsive (desktop landing mirrors the ref; app view mirrors the phone mockup).
- Run the dev server and fix any build/lint errors before telling me a section is done.
- Work autonomously through all steps; don't stop to ask permission between steps. Report progress as you complete each numbered item.

Start with STEP 0 now.
