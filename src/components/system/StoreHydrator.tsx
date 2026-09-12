"use client";

import { useEffect } from "react";
import { useGame } from "@/store/game-store";
import { useOnboarding } from "@/store/onboarding-store";
import { loadAudioPrefs } from "@/lib/audio";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getBrowserClient } from "@/lib/supabase/client";
import { api } from "@/lib/api/client";

/**
 * Decides where the game reads its state from, once, on the client:
 *
 *  - **Supabase configured** → server mode. If a session exists, pull the
 *    authoritative snapshot from the DB; otherwise leave the store empty
 *    (route guards send the user to /login). localStorage is NOT read, so a
 *    stale local realm never shadows the real account.
 *
 *  - **Not configured** → local-play mode. Rehydrate the persisted Zustand
 *    stores as before.
 *
 * Either way `hydrated` flips so gated UI can render, with a timeout backstop
 * so the app is never permanently stuck on a loader.
 */
export function StoreHydrator() {
  useEffect(() => {
    loadAudioPrefs();

    const finish = () => {
      if (!useGame.getState().hydrated) useGame.setState({ hydrated: true });
    };

    const run = async () => {
      if (supabaseConfigured()) {
        useGame.setState({ mode: "server" });
        const supabase = getBrowserClient();
        try {
          const {
            data: { user },
          } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
          if (user) {
            const state = await api.getState();
            useGame.getState().applyServerState(state);
          }
        } catch {
          /* not signed in / offline — guards handle redirects */
        }
        finish();
        return;
      }

      // Local-play mode: restore persisted stores.
      await Promise.all([
        useGame.persist.rehydrate(),
        useOnboarding.persist.rehydrate(),
      ]).catch(() => {});
      finish();
    };

    void run();
    const backstop = window.setTimeout(finish, 2500);
    return () => window.clearTimeout(backstop);
  }, []);

  return null;
}
