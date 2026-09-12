#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Apply the LifeClash SQL migrations to a Supabase (Postgres) database.
#
# Usage:
#   1. Grab your connection string from Supabase:
#        Project → Settings → Database → Connection string → URI
#        (use the "Session"/direct string; it contains your DB password)
#   2. Run:
#        DATABASE_URL="postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres" \
#          bash scripts/apply-migrations.sh
#
# The migrations are additive and idempotent, so re-running is safe.
# ---------------------------------------------------------------------------
set -euo pipefail

DB="${DATABASE_URL:-${SUPABASE_DB_URL:-}}"
if [ -z "$DB" ]; then
  echo "✗ Set DATABASE_URL (or SUPABASE_DB_URL) to your Supabase Postgres URI." >&2
  echo "  Settings → Database → Connection string → URI" >&2
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "✗ psql not found. Install the postgresql client, or paste the SQL files" >&2
  echo "  into the Supabase SQL Editor instead (supabase/migrations/*.sql in order)." >&2
  exit 1
fi

DIR="$(cd "$(dirname "$0")/../supabase/migrations" && pwd)"
for f in 0001_schema.sql 0002_functions.sql 0003_google_identity.sql; do
  echo "→ applying $f"
  psql "$DB" -v ON_ERROR_STOP=1 -q -f "$DIR/$f"
done

echo "✓ Migrations applied. Verifying…"
psql "$DB" -tc "select count(*) || ' tables' from information_schema.tables where table_schema='public';"
psql "$DB" -tc "select count(*) || ' lc_ functions' from information_schema.routines where routine_schema='public' and routine_name like 'lc_%';"
echo "✓ Done. Sign up in the app to create your first profile."
