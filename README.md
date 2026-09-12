# LifeClash

A gamified Life RPG. Real habits build a real-feeling world: complete a quest in
your actual life, and your village levels up, your league climbs, and the
Procrastination Dragon takes damage.

Built for the IIT Bhubaneswar Web Hackathon.

**All characters, buildings, icons, and sound effects are original work created
for this project.** The visual language is inspired by the village-builder genre;
no third-party game assets, logos, or audio are used.

---

## Full-stack at a glance

- **Frontend** — Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion, Zustand.
- **Backend** — Supabase: Postgres + Row-Level Security + **server-authoritative
  `SECURITY DEFINER` functions**, Supabase Auth (email/password) with SSR cookie
  sessions, exposed through a Next.js `/api/v1` route-handler layer.
- **Persistence** — every bit of progress (profile, buildings, quests, ledger,
  streaks, clan raid) lives in Postgres and survives a refresh and a new device.
- **Anti-cheat** — the client posts *what it did* (a quest id), never *what it
  earned*. All XP / currency / level maths runs in Postgres; the browser can't
  grant itself anything. Verified: an attempt to collect 999,999 gold is clamped
  to 500 server-side.

The app also runs in a **local-play** fallback with no Supabase env (state in
`localStorage`) so it never crashes without credentials — but the deployed
submission must be configured (see below), because localStorage-only
persistence does not meet the brief.

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in Supabase values (see "Backend setup")
npm run dev                    # http://localhost:3000
```

| Script            | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Dev server with hot reload                |
| `npm run build`   | Production build                          |
| `npm start`       | Serve the production build                |
| `npm run lint`    | ESLint (next/core-web-vitals)             |
| `npm run typecheck` | `tsc --noEmit`                          |

> Stop the dev server before running `npm run build` — both write to `.next/`,
> and running them together leaves the dev server serving 404s for its client
> chunks.

### Routes

| Route              | What it is                                                     |
| ------------------ | -------------------------------------------------------------- |
| `/`                | Landing page — hero, Guardians, features, leaderboard, footer   |
| `/login`, `/register` | Auth (Supabase email/password)                              |
| `/onboarding`      | The 8-step "Start Your Journey" wizard (seeds the realm)        |
| `/village`         | The game: isometric board, HUDs, quests, raid, clan, leagues    |
| `/api/v1/*`        | Backend API (see "API surface")                                 |

`/village` and `/onboarding` require a session when Supabase is configured;
middleware redirects to `/login` otherwise.

`/village` redirects to `/onboarding` if no realm has been created yet.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict)
- **Tailwind CSS 3** — all design tokens in `tailwind.config.ts`
- **Framer Motion** — transitions, spring physics, presence
- **Zustand** (+ `persist`) — client state
- **Web Audio API** — every sound effect is synthesised at runtime; no audio files

---

## Project layout

```
src/
├── app/
│   ├── layout.tsx            Fonts, metadata, store hydration
│   ├── globals.css           Design-system component classes
│   ├── page.tsx              Landing
│   ├── onboarding/page.tsx   Wizard
│   └── village/page.tsx      Game shell
│
├── components/
│   ├── ui/         Button · Panel · Modal · ProgressBar · Badge
│   ├── landing/    NavPill · Hero · Guardians · Features · Leaderboard · Footer
│   ├── onboarding/ Wizard + 8 steps (incl. the Forge and the world reveal)
│   ├── village/    VillageCanvas · RadialMenu · ResourceBubble · GameShell
│   ├── hud/        TopHUD · BottomHUD
│   ├── modals/     Quest · Upgrade · Raid · Clan · Info · Shop · Settings ·
│   │               Leaderboard · Season · Profile
│   ├── art/        Guardians · Dragon · Buildings · Scenery · icons · badges
│   └── fx/         FxLayer (floating rewards, level-up) · Confetti
│
├── lib/
│   ├── game-config.ts  Buildings, pillars, Guardians, leagues, quests, seasons
│   ├── rewards.ts      Client reward preview (authoritative copy lives in SQL)
│   ├── iso.ts          Isometric projection maths
│   ├── audio.ts        Web Audio synthesiser (19 patches)
│   ├── mock-social.ts  Clan roster fixtures for visual density
│   ├── supabase/       Browser + server clients, session middleware, env switch
│   ├── api/            Browser API client + server route helpers + serializers
│   ├── auth/           useSession hook
│   └── utils.ts
│
├── app/api/v1/     Backend route handlers (auth → RPC)
├── store/          game-store · onboarding-store · ui-store
└── types/game.ts   Domain types, mirroring the DB schema

supabase/
└── migrations/
    ├── 0001_schema.sql     Tables, RLS, triggers, seed clan/raid
    └── 0002_functions.sql  Server-authoritative game logic (RPCs)
```

---

## Design system

Tokens live in `tailwind.config.ts`; the reusable component classes live in
`src/app/globals.css`.

- **`.btn3d` + `.btn3d-{gold,elixir,gem,stone,wood,danger}`** — the signature
  chunky button. The bottom border *is* the extruded face; pressing collapses it
  and drops the cap by the same distance, so the button physically sinks.
- **`.panel-{wood,stone,dark}`** — tactile plates with a dark rounded border, a
  top gloss highlight, and a drop shadow.
- **`.text-outline{,-md,-sm,-xs,-ink}`** — cream display type with a heavy brown
  stroke. This carries most of the art direction.
- **`.counter`, `.well`, `.nav-pill`, `.sheen`** — HUD capsules, recessed
  progress tracks, the glossy nav bar, and the animated highlight sweep.

Fonts: **Lilita One** (display), **Luckiest Guy** (logotype), **Baloo 2** (body),
**Nunito** (numerals and dense UI).

### Accessibility

- The village canvas has a screen-reader alternative: a building list in
  `GameShell`, plus the full roster in the profile modal.
- Every building, radial action, and HUD control has an `aria-label`.
- Modals trap focus, close on `Escape`, and lock background scroll.
- The wizard is fully keyboard-driven (`Enter` advances, `Escape` goes back).
- `prefers-reduced-motion` disables all ambient animation loops.

---

## Backend setup (Supabase)

The whole backend is two SQL files plus environment variables — no separate
server to run.

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is
   fine). Grab, from Project Settings → API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, optional)

2. **Run the migrations** (in order): `0001_schema.sql`, `0002_functions.sql`,
   `0003_google_identity.sql`. Any of:
   - **SQL Editor** — paste each file and run.
   - **One command** — grab the Postgres URI (Settings → Database → Connection
     string → URI) and run:
     ```bash
     DATABASE_URL="postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres" \
       bash scripts/apply-migrations.sh
     ```
   - **CLI** — `supabase link --project-ref <ref>` then `supabase db push`.

   They're additive and idempotent, so re-running is safe.

3. **Auth settings.** Authentication → Providers → Email is on by default. For a
   frictionless demo, turn **"Confirm email" off** (Authentication → Providers →
   Email) so signup logs straight in. Add your deployed origin under
   Authentication → URL Configuration → Redirect URLs.

   **Google sign-in** (optional but supported): in Google Cloud Console create
   an OAuth 2.0 client, set the authorized redirect URI to
   `https://<your-project-ref>.supabase.co/auth/v1/callback`, then paste the
   client ID + secret into Supabase → Authentication → Providers → Google and
   enable it. Also add your app origin(s) to the Redirect URLs list. The
   "Continue with Google" button then works with no code changes — the new-user
   trigger captures the Google name, email, and avatar into the profile.

4. **Env.** Copy `.env.example` to `.env.local` and fill in the values. Restart
   `npm run dev`. The app auto-switches from local-play to server mode.

That's it — sign up, and a profile + default-clan membership are created by a
Postgres trigger; onboarding seeds your realm; every quest completion persists.

### How it stays cheat-proof

`supabase/migrations/0002_functions.sql` holds the only code that grants
anything. Each function is `SECURITY DEFINER` and scoped to `auth.uid()`:

- **`lc_complete_quest`** — atomic + idempotent. Non-linear level roll-up,
  streak (consecutive-day) logic, building XP, raid damage, clan XP, and an
  `economy_ledger` audit row, all in one transaction. A replayed
  `idempotency_key` returns the original result and pays nothing extra.
- **`lc_upgrade_building`, `lc_purchase_item`** — costs/prices live in SQL; the
  client only names the target. `CHECK (gold >= 0)` is the last-ditch guard.
- **`lc_collect_resource`** — amount clamped to `[1, 500]` server-side.
- **`lc_create_quest`** — reward is computed from difficulty server-side, never
  accepted from the client.
- **RLS** scopes every table to the owner; clans/raids are read-only shared.

These maths mirror `src/lib/rewards.ts` / `src/lib/game-config.ts` exactly, so
the optimistic UI and the authoritative server result always agree.

### API surface (`/api/v1`)

Route handlers authenticate the session cookie and forward to the RPCs, mapping
raised error tokens to HTTP status codes.

| Method | Path                          | RPC                    |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/state`                      | `lc_get_state`         |
| POST   | `/onboarding`                 | `lc_seed_realm`        |
| POST   | `/quests`                     | `lc_create_quest`      |
| PATCH  | `/quests/:id`                 | `lc_update_quest`      |
| DELETE | `/quests/:id`                 | `lc_delete_quest`      |
| POST   | `/quests/complete`            | `lc_complete_quest`    |
| POST   | `/buildings/upgrade`          | `lc_upgrade_building`  |
| POST   | `/resources/collect`          | `lc_collect_resource`  |
| POST   | `/shop/purchase`              | `lc_purchase_item`     |

### Data flow

`StoreHydrator` picks the mode on load. In server mode the Zustand store
hydrates from `GET /api/v1/state`; each mutation applies an optimistic update
(using the server-authored reward already on the quest), fires the API call, and
reconciles with the authoritative snapshot the RPC returns. Errors surface as a
toast and trigger a state reload, so the UI can never drift from the DB.

### Meets the brief

- **Auth & security** — Supabase Auth + RLS; a user only sees/edits their own data.
- **CRUD** — quests are fully create/read/update/delete (the "add your own quest"
  button on the board), plus generated dailies/weeklies.
- **Non-linear leveling** — `xp_for_level = round(420 · 1.18^(level-1))`.
- **Streaks** — consecutive-day tracking on the profile.
- **Attributes** — each quest category feeds a building (Academy = Intellect,
  Training Grounds = Strength, …).
- **Economy** — gold/elixir/gems earned from quests, spent in the shop and on
  upgrades, every change audited in `economy_ledger`.

---

## Deploying (Vercel + Supabase)

1. Push this repo to GitHub (the brief requires a public repo with ≥3 commits).
2. Import it into [Vercel](https://vercel.com). Framework preset: Next.js.
3. Add the env vars from `.env.example` in Vercel → Settings → Environment
   Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   optionally `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`).
4. In Supabase → Authentication → URL Configuration, add the Vercel URL to
   Redirect URLs and Site URL.
5. Deploy. The migrations must already be applied to the Supabase project.

---

## Verification

**Backend logic** was validated end-to-end against a real Postgres instance with
Supabase-compatible shims (`auth.users`, `auth.uid()`): signup trigger → realm
seed → quest completion → idempotent replay → ledger → raid damage → custom
quest → upgrade → the anti-cheat clamp → shop purchase all pass. The state shape
returned by `lc_get_state` matches the client serializer exactly.

**Frontend** — three Playwright scripts drive the real UI and screenshot every
beat into `.screens/` (gitignored). They need the dev server running.

```bash
node scripts/flow.mjs      # onboarding 1→8, then into the village
node scripts/modals.mjs    # radial menu + all 10 modals + quest + upgrade flows
node scripts/mobile.mjs    # 390×844 pass, checks for horizontal overflow
```

`flow.mjs` writes `.screens/seed.json`, which the other scripts reuse to jump
straight to a seeded realm.

> End-to-end **server mode** (auth cookies + live PostgREST) requires a real
> Supabase project — it can't run against a bare local Postgres. The SQL logic
> and the API/serializer contracts are verified as above; connect a project per
> "Backend setup" to exercise the full round trip.
