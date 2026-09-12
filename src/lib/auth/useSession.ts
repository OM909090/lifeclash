"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";

export interface SessionState {
  user: User | null;
  loading: boolean;
  configured: boolean;
}

/**
 * Reactive auth state. When Supabase isn't configured this resolves
 * immediately to `{ user: null, configured: false }` so local-play UI renders
 * without waiting on a network round trip.
 */
export function useSession(): SessionState {
  const configured = supabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) return;
    const supabase = getBrowserClient();
    if (!supabase) return;

    let active = true;
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (active) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_e: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [configured]);

  return { user, loading, configured };
}
