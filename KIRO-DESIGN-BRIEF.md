# LifeClash — Frontend Design Brief for Kiro (v2, grounded on real CoC reference)

## 0. OPEN THESE REFERENCE IMAGES FIRST (they are the source of truth)
Do not guess the look — match these three saved screenshots pixel-for-vibe:
- `design-refs/ref-landing-desktop.png` — the hero LANDING PAGE ("Lead Your Clan to Glory")
- `design-refs/ref-screen-2.png` — the **"Meet The Heroes"** hero-card gallery
- `design-refs/ref-screen-3.png` — the full marketing composition (landing + phone mockup showing the isometric village + "Build. Battle." sections)

Source: Design Monks LLC — "Clash of Clans Game UI UX Design" (Dribbble shot 25657275). We are **recreating the visual language with our OWN original art and copy** — no Supercell logos, character art, or assets. Same feel, our characters.

---

## 1. VISUAL LANGUAGE TO COPY EXACTLY (from ref-landing-desktop.png)
- **Background:** bright sky-blue vertical gradient (`#5FC7F5` → `#BFE9FF`) with soft volumetric white clouds; floating grass/rock islands with waterfalls hanging in the sky.
- **Hero logotype + headings:** thick, hand-drawn **comic display font**, cream-white fill, dark-brown outline + drop shadow (use `Lilita One` / `Luckiest Guy` / `Baloo 2` as free stand-ins). Big, chunky, slightly arched.
- **Top nav bar:** rounded glossy near-black pill bar. Left = our logo. Center links = plain white bold. Right = **gold beveled CTA button**.
- **Primary buttons:** gold/amber (`#F5B01E` face, `#B9760F` bevel), thick bottom border (`border-b-4`), rounded, cream text with brown outline; press = `translate-y-1` + bevel collapses. This is the signature button — use it everywhere.
- **Cards & panels:** wood/stone plates — warm tan (`#E9C79A`) panels with dark-brown rounded borders (`4–6px`), inner gloss highlight at top, soft outer drop shadow. Everything looks tactile and slightly 3D.
- **Ambient life:** small floating creatures/props (in ref: dragons, balloons, bats). Ours = floating XP orbs, coins, tiny book/dumbbell/coin sprites drifting across the sky.

---

## 2. CHARACTER / ASSET RESKIN MAP (CoC → LifeClash)
Replace every Clash character with our four **Guardians** — one per life pillar. Keep the exact CoC hero-card layout from `ref-screen-2.png` (portrait on a floating grass island, level badge top-left, name banner, one-line description, heart/element chip).

| CoC element (reference) | LifeClash reskin | Pillar / building | Palette |
|---|---|---|---|
| Archer Queen | **The Scholar** — hooded sage holding a glowing rune-book | Academy · Learning/coding/reading | Indigo + arcane cyan |
| Barbarian King | **The Warrior** — armored champion with a warhammer/kettlebell | Training Grounds · Fitness/health | Crimson + steel |
| Grand Warden | **The Merchant** — golden-robed treasurer with coin-scales | Treasury · Finance/career | Gold + emerald |
| Royal Champion | **The Sentinel** — shield-and-torch watch-guardian | Defense Tower · Streaks/discipline/sleep | Blue + torch-orange |
| The purple dragon | **The Procrastination Dragon** — our villain/raid boss | (antagonist) | Violet + smoke |
| Floating village (phone) | **Your Realm** — our isometric life-village | Town Hall + pillars | CoC grass palette |

The four Guardians double as onboarding mentors and as the "Meet The Guardians" landing section (reskin of "Meet The Heroes").

---

## 3. LANDING PAGE SPEC (reskin of ref-landing-desktop.png)
1. **Nav:** `⚡ LifeClash` logo · links: *Features · Guardians · Leaderboard · About* · gold CTA **"Play Free"**.
2. **Hero:** headline **"Build the Life You Want"** / sub-line *"Turn real habits into a thriving world. Level up your life like a game."* → giant gold CTA **"⚔️ Start Your Journey"** (this is the button that launches the onboarding wizard in §4). Flanked by two Guardian characters + a floating island realm behind, exactly like the ref.
3. **"Meet The Guardians"** section: the 4 reskinned hero cards from `ref-screen-2.png`.
4. **"Build. Battle. Grow."** section (from ref-screen-3): 3 feature blocks — *Build your realm*, *Slay the Procrastination Dragon*, *Rise up the leagues* — each with a phone/island mockup.
5. **Phone mockup** showing the live isometric village (reuse the VillageCanvas we already specced).
6. Footer with app-store-style badges (can be "Coming soon" pills).

---

## 4. ⭐ THE ONBOARDING FLOW — "Start Your Journey" (the most important new piece)
Clicking **Start Your Journey** must NOT drop the user straight into the app. It opens a full-screen **character-creation wizard** on the sky/island background, one question per screen, with a CoC-style XP progress bar across the top and gold Next/Back buttons. Slide transitions (Framer Motion). Answers are collected in state, then sent to the backend which **generates the personalized village + starter quests + starting league**.

**Step 1 — Name your realm.** "What shall we call your realm?" → text input for village name + pick a banner/crest + optional display name. (Fun, low-friction opener.)

**Step 2 — Choose your pillars.** "Which parts of your life do you want to level up?" Multi-select tappable cards (each becomes a BUILDING in the village):
🧠 Mind (Learning) · 💪 Body (Fitness) · 💰 Wealth (Finance) · 🔥 Discipline (Consistency) · 😴 Recovery (Sleep) · 🎯 Focus (Deep work). Min 2, recommend 3–4.

**Step 3 — Your starting point.** "How consistent are you right now?" cards: *Just starting out · On and off · Pretty steady · Highly disciplined.* → sets starting **league tier** and quest difficulty so it feels fair.

**Step 4 — Your greatest enemy.** "What holds you back the most?" *Procrastination · Distraction · Low energy · No plan · Giving up too soon.* → personalizes the **Raid Boss** flavor and the coaching tips.

**Step 5 — Time budget.** "How much time can you invest each day?" *15 min · 30 min · 1 hr · 2 hr+.* → scales daily quest size/rewards.

**Step 6 — Your season goal.** "What's your #1 goal this season?" presets (*Get fit · Crack a placement · Save money · Ship a project · Fix my sleep*) + free text. → becomes the **Epic Quest / season objective** pinned in the Town Hall.

**Step 7 — THE FORGE (planning animation).** Full-screen "**Forging your world…**" with staged, satisfying status lines appearing one by one as buildings drop onto the grid with spring physics + sound:
`Placing your Academy…` → `Summoning your Guardian…` → `Generating your first quests…` → `Calibrating your league…` → `Waking the Procrastination Dragon…`
This is where "our system plans" — the backend seeds buildings from Step 2, quests from Steps 5–6, difficulty from Step 3, boss from Step 4, league from Step 3.

**Step 8 — Enter the world.** The isometric village reveals (camera fly-in), the chosen Guardian gives a 3-tooltip welcome tutorial ("Tap a building → open a quest → complete it in real life → watch your world grow"), and the first daily quest is ready. Confetti + fanfare.

Build the wizard as a multi-step form (Zustand for answers), full-screen island-background cards, gold progress bar, keyboard + mobile friendly. On finish: `POST /api/onboarding` → returns the seeded village → redirect to `/village`.

---

## 5. COMPETITIVE SYSTEMS (make it feel like a ranked online game)
- **Leagues & Consistency Trophies:** earn Consistency Points from streaks + quest completion. Tiers: **Wood → Stone → Bronze → Silver → Gold → Crystal → Legend**, each with a badge shown on the profile & top HUD. Weekly promotion/demotion, like CoC trophies. This directly answers "make it competitive."
- **Leaderboards:** Global · Friends · Clan — ranked by weekly XP / Consistency Points. Podium styling with the same gold/stone panels.
- **Clans:** join/create a clan, contribute to the shared **Clan Monument** (collective progress bar), clan chat-lite / activity feed, clan leaderboard.
- **Raid Boss — The Procrastination Dragon:** weekly collective boss with an HP bar; every completed quest by any clan member deals damage; defeating it drops rewards (gems, decorations). Personalized by the Step-4 answer.
- **Seasons & Season Pass:** 7-day or monthly seasons with a reward track (cosmetic building skins, banners, decorations, gems) to drive return visits.
- **Consistency Duels (stretch):** challenge a friend to a 7-day head-to-head — most quests/streak wins the week.

---

## 6. FRONTEND BUILD NOTES
- Stack (already chosen): Next.js 14 App Router + TypeScript + Tailwind + Framer Motion + Zustand; server-authoritative rewards (no client-side XP math).
- Reuse the components already specced: `tailwind.config.ts` CoC tokens, the building SVGs, `VillageCanvas.tsx`, `TopHUD`, `BottomHUD`, `audio.ts`.
- Fonts: `Lilita One`/`Luckiest Guy` for display, `Baloo 2`/`Nunito` for body (all Google Fonts, free).
- Priority order for the 24h build: (1) Landing + Start-Your-Journey wizard + Forge → Enter World, (2) Village canvas + quests + rewards, (3) Leagues + leaderboard, (4) Clan + Raid Boss, (5) polish/audio/season pass.
- Keep it fully responsive: desktop landing mirrors `ref-landing-desktop.png`; the app/village view mirrors the phone mockup in `ref-screen-3.png`.

**Deliver the frontend first, exceptionally polished — the landing, the onboarding wizard, and the living village are what win the demo.**
