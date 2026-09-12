"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

/**
 * Browser Supabase client. Session tokens are stored in cookies (by @supabase/ssr)
 * so the server — middleware, route handlers, server components — can read the
 * same session.
 *
 * Returns `null` when Supabase isn't configured, so callers can fall back to
 * local-play mode instead of throwing at import time.
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!supabaseConfigured()) return null;
  if (!cached) cached = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return cached;
}
