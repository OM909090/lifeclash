import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Server Supabase client for route handlers and server components. Bound to the
 * request's auth cookies, so `auth.uid()` inside our SECURITY DEFINER functions
 * resolves to the signed-in user.
 *
 * Returns `null` when Supabase isn't configured.
 */
export function getServerClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In pure server components Next disallows cookie writes; the try/catch
        // keeps reads working there while middleware handles the refresh.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* called from a server component — middleware refreshes instead */
        }
      },
    },
  });
}
