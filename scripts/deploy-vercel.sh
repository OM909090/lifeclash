#!/usr/bin/env bash
# ===========================================================================
# LifeClash — one-command Vercel production deploy
# ===========================================================================
# What it does:
#   1. Preflight (repo root, .env.local present, git clean-ish, build sanity)
#   2. Ensures the Vercel CLI is available (global, else `npx vercel@latest`)
#   3. Ensures you're logged in (runs `vercel login` if not)
#   4. Links this folder to a Vercel project (default name: lifeclash)
#   5. Pushes the RUNTIME env vars from .env.local to Vercel (production)
#        - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
#        - SUPABASE_SERVICE_ROLE_KEY (only if present)
#        - DATABASE_URL is deliberately NOT pushed (migrations-only, unused at runtime)
#   6. Deploys to production, captures the URL
#   7. Sets NEXT_PUBLIC_SITE_URL to that URL and redeploys so auth redirects
#      point at the live domain (two-phase, because we can't know the URL first)
#   8. Prints the final URL + the one manual Supabase step you must do
#
# Usage:
#   bash scripts/deploy-vercel.sh                 # full deploy
#   bash scripts/deploy-vercel.sh --project myname# custom Vercel project name
#   bash scripts/deploy-vercel.sh --skip-site-url # don't rewrite NEXT_PUBLIC_SITE_URL
#   bash scripts/deploy-vercel.sh --help
#
# Safe to re-run: env vars are replaced (rm + add), deploys are idempotent.
# ===========================================================================
set -euo pipefail

# ---------------------------------------------------------------- pretty output
if [ -t 1 ]; then
  B=$'\033[1m'; G=$'\033[32m'; Y=$'\033[33m'; R=$'\033[31m'; C=$'\033[36m'; X=$'\033[0m'
else
  B=""; G=""; Y=""; R=""; C=""; X=""
fi
say()  { printf '%s\n' "${C}▸ ${1}${X}"; }
ok()   { printf '%s\n' "${G}  ✓ ${1}${X}"; }
warn() { printf '%s\n' "${Y}  ! ${1}${X}"; }
die()  { printf '%s\n' "${R}✗ ${1}${X}" >&2; exit 1; }

# --------------------------------------------------------------------- args
PROJECT_NAME="lifeclash"
SET_SITE_URL=1
while [ $# -gt 0 ]; do
  case "$1" in
    --project) PROJECT_NAME="${2:?--project needs a value}"; shift 2 ;;
    --skip-site-url) SET_SITE_URL=0; shift ;;
    --help|-h)
      sed -n '2,40p' "$0"; exit 0 ;;
    *) die "Unknown option: $1 (try --help)" ;;
  esac
done

# --------------------------------------------------------- repo root + env file
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
[ -f package.json ] || die "package.json not found — run from the LifeClash repo."
[ -f .env.local ]   || die ".env.local not found. It must hold your Supabase keys."

say "Deploying from: ${B}${ROOT}${X}"

# --------------------------------------------------------------- load env (safe)
# shellcheck disable=SC1091
set -a; . ./.env.local; set +a
: "${NEXT_PUBLIC_SUPABASE_URL:?NEXT_PUBLIC_SUPABASE_URL missing in .env.local}"
: "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?NEXT_PUBLIC_SUPABASE_ANON_KEY missing in .env.local}"
ok "Supabase project: $(printf '%s' "$NEXT_PUBLIC_SUPABASE_URL" | sed -E 's#https?://([^.]+)\..*#\1#')"

# --------------------------------------------------------------- git sanity note
if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
  if [ -n "$(git status --porcelain)" ]; then
    warn "Working tree has uncommitted changes — Vercel deploys the LOCAL folder,"
    warn "so those changes WILL ship. Commit/push first if you want git to match."
  else
    ok "Working tree clean."
  fi
fi

# ------------------------------------------------------------------ vercel CLI
if command -v vercel >/dev/null 2>&1; then
  VC=(vercel)
else
  warn "Vercel CLI not installed globally — using 'npx vercel@latest'."
  command -v npx >/dev/null 2>&1 || die "npx not found. Install Node.js (includes npx)."
  VC=(npx --yes vercel@latest)
fi

# --------------------------------------------------------------------- login
say "Checking Vercel auth…"
if ! "${VC[@]}" whoami >/dev/null 2>&1; then
  warn "Not logged in. Launching 'vercel login' (follow the browser prompt)…"
  "${VC[@]}" login || die "vercel login failed."
fi
ok "Logged in as: $("${VC[@]}" whoami 2>/dev/null || echo unknown)"

# ---------------------------------------------------------------------- link
# Links the current dir to a project (creates it if missing). --yes accepts
# the sensible defaults; first run may still ask which scope/team to use.
if [ ! -f .vercel/project.json ]; then
  say "Linking to Vercel project '${PROJECT_NAME}'…"
  "${VC[@]}" link --yes --project "$PROJECT_NAME" || die "vercel link failed."
fi
ok "Project linked."

# --------------------------------------------------------------- env var push
# Replaces (rm then add) so re-runs stay correct. Values are piped, never echoed.
put_env() {
  local name="$1" val="$2"
  [ -z "${val:-}" ] && { warn "$name empty — skipped."; return 0; }
  "${VC[@]}" env rm "$name" production --yes >/dev/null 2>&1 || true
  if printf '%s' "$val" | "${VC[@]}" env add "$name" production >/dev/null 2>&1; then
    ok "$name → production"
  else
    warn "$name failed to set (add it manually in the dashboard)."
  fi
}

say "Syncing runtime env vars to Vercel (production)…"
put_env NEXT_PUBLIC_SUPABASE_URL      "${NEXT_PUBLIC_SUPABASE_URL:-}"
put_env NEXT_PUBLIC_SUPABASE_ANON_KEY "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}"
put_env SUPABASE_SERVICE_ROLE_KEY     "${SUPABASE_SERVICE_ROLE_KEY:-}"   # optional
# NOTE: DATABASE_URL is intentionally NOT pushed — it's only for running
# migrations locally (scripts/apply-migrations.sh) and is never read at runtime.

# ------------------------------------------------------------ deploy (phase 1)
say "Building & deploying to production (phase 1)…"
LOG1="$(mktemp)"; trap 'rm -f "$LOG1" "${LOG2:-}"' EXIT
"${VC[@]}" deploy --prod --yes 2>&1 | tee "$LOG1"
DEPLOY_URL="$(grep -Eo 'https://[A-Za-z0-9.-]+\.vercel\.app' "$LOG1" | tail -n1)"
[ -n "$DEPLOY_URL" ] || die "Couldn't detect the deployment URL from Vercel output."
ok "Deployed: ${B}${DEPLOY_URL}${X}"

# ---------------------------------------- set NEXT_PUBLIC_SITE_URL + redeploy
if [ "$SET_SITE_URL" -eq 1 ]; then
  CURRENT_SITE="${NEXT_PUBLIC_SITE_URL:-}"
  if [ "$CURRENT_SITE" != "$DEPLOY_URL" ]; then
    say "Setting NEXT_PUBLIC_SITE_URL=${DEPLOY_URL} and redeploying (phase 2)…"
    put_env NEXT_PUBLIC_SITE_URL "$DEPLOY_URL"
    # NEXT_PUBLIC_* is inlined at build time, so a rebuild is required for it to take.
    LOG2="$(mktemp)"
    "${VC[@]}" deploy --prod --yes 2>&1 | tee "$LOG2"
    NEW_URL="$(grep -Eo 'https://[A-Za-z0-9.-]+\.vercel\.app' "$LOG2" | tail -n1)"
    [ -n "$NEW_URL" ] && DEPLOY_URL="$NEW_URL"
    ok "Redeployed with correct site URL."
  else
    ok "NEXT_PUBLIC_SITE_URL already matches — no redeploy needed."
  fi
fi

# ------------------------------------------------------------------- summary
PROJECT_REF="$(printf '%s' "$NEXT_PUBLIC_SUPABASE_URL" | sed -E 's#https?://([^.]+)\..*#\1#')"
cat <<EOF

${G}${B}✓ LIVE:${X} ${B}${DEPLOY_URL}${X}

${B}One required manual step${X} (auth/OAuth redirects break without it):
  Supabase dashboard → your project (${PROJECT_REF})
  → Authentication → URL Configuration
    • Site URL:       ${DEPLOY_URL}
    • Redirect URLs:  ${DEPLOY_URL}/**
  (If using Google sign-in, also enable the Google provider there.)

${B}For a smooth demo${X} (optional):
  Authentication → Providers → Email → turn OFF "Confirm email"
  so signups get a session instantly.

Re-run this script any time to ship a new production build.
EOF
