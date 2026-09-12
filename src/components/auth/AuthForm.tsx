"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SkyBackdrop } from "@/components/landing/SkyBackdrop";
import { Button } from "@/components/ui/Button";
import { getBrowserClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/env";
import { play } from "@/lib/audio";

type Mode = "login" | "register";

/**
 * Shared login / register card. Uses the Supabase browser client directly
 * (session is written to cookies by @supabase/ssr so the server sees it).
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/village";
  const configured = supabaseConfigured();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isRegister = mode === "register";

  const signInWithGoogle = async () => {
    setError(null);
    const supabase = getBrowserClient();
    if (!supabase) return;
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (err) throw err;
      // On success the browser is redirected to Google; nothing else to do.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
      play("error");
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!configured) {
      // No backend available — fall through to local play so the app still runs.
      play("whoosh");
      router.push("/onboarding");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      play("error");
      return;
    }

    const supabase = getBrowserClient();
    if (!supabase) return;

    setBusy(true);
    try {
      if (isRegister) {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim() || "Chieftain" },
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
                : undefined,
          },
        });
        if (err) throw err;
        play("levelUp");
        // If email confirmation is on there's no session yet.
        if (!data.session) {
          setInfo("Check your email to confirm your account, then sign in.");
          setBusy(false);
          return;
        }
        router.push(next);
        router.refresh();
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        play("whoosh");
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      play("error");
      setBusy(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      <SkyBackdrop />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-grass-gradient">
        <div className="h-2 w-full bg-grass-light/70" />
      </div>

      <Link
        href="/"
        onClick={() => play("back")}
        className="relative z-10 mb-6 flex items-center gap-2 rounded-pill border-2 border-panel-ink/60 bg-panel-base/80 px-4 py-2 backdrop-blur-sm"
      >
        <span className="grid h-7 w-7 place-items-center rounded-lg border-2 border-gold-deep bg-gold-gradient text-sm">
          ⚡
        </span>
        <span className="font-logo text-lg text-cream">
          Life<span className="text-gold-light">Clash</span>
        </span>
      </Link>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="panel-wood relative z-10 w-full max-w-md overflow-hidden"
      >
        <div className="relative border-b-[5px] border-wood-dark bg-wood-gradient px-6 py-5 text-center">
          <span
            className="pointer-events-none absolute inset-x-2 top-1 h-5 rounded-t-xl"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,.34) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
          <p className="relative font-ui text-[10px] font-black uppercase tracking-[0.26em] text-gold-light">
            {isRegister ? "New chieftain" : "Welcome back"}
          </p>
          <h1 className="text-outline-sm relative mt-1.5 text-3xl">
            {isRegister ? "Create your account" : "Sign in"}
          </h1>
        </div>

        <div className="flex flex-col gap-3.5 px-6 py-6">
          {!configured ? (
            <div className="rounded-chunk border-2 border-warn/50 bg-warn/15 px-3 py-2.5 font-body text-xs font-bold text-wood-deep">
              Supabase isn&apos;t configured, so accounts are disabled. You can still
              explore in local-play mode — progress won&apos;t be saved.
            </div>
          ) : null}

          {/* ---------------------------------------------- Google OAuth */}
          {configured ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={signInWithGoogle}
                className="btn3d btn3d-stone flex w-full items-center justify-center gap-2.5 border-b-[5px] bg-[linear-gradient(180deg,#FFFFFF,#EDEFF2)] py-3 text-wood-deep disabled:opacity-60"
                style={{ WebkitTextStroke: "0px" }}
              >
                <GoogleGlyph />
                <span className="font-display text-sm normal-case tracking-normal text-[#3C4043]">
                  Continue with Google
                </span>
              </button>

              <div className="my-1 flex items-center gap-3">
                <span className="h-0.5 flex-1 rounded bg-wood-dark/20" />
                <span className="font-ui text-[10px] font-black uppercase tracking-widest text-wood-mid/70">
                  or {isRegister ? "sign up" : "sign in"} with email
                </span>
                <span className="h-0.5 flex-1 rounded bg-wood-dark/20" />
              </div>
            </>
          ) : null}

          {isRegister ? (
            <Field label="Display name">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Chieftain"
                maxLength={20}
                className="auth-input"
              />
            </Field>
          ) : null}

          <Field label="Email">
            <input
              type="email"
              required={configured}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="auth-input"
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              required={configured}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="auth-input"
            />
          </Field>

          {error ? (
            <p className="rounded-chunk border-2 border-danger/50 bg-danger/12 px-3 py-2 font-body text-xs font-bold text-danger">
              {error}
            </p>
          ) : null}
          {info ? (
            <p className="rounded-chunk border-2 border-gem-deep/50 bg-gem-base/15 px-3 py-2 font-body text-xs font-bold text-[#0C4A14]">
              {info}
            </p>
          ) : null}

          <Button
            type="submit"
            tone="gold"
            size="lg"
            fullWidth
            sfx={null}
            disabled={busy}
            className="mt-1"
          >
            {busy
              ? "One moment…"
              : !configured
                ? "Explore in local mode →"
                : isRegister
                  ? "⚔️ Begin your journey"
                  : "Enter your realm"}
          </Button>

          <p className="text-center font-body text-sm font-semibold text-wood-mid">
            {isRegister ? "Already have a realm?" : "New here?"}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              onClick={() => play("tap")}
              className="font-display text-wood-deep underline decoration-gold-base decoration-2 underline-offset-2"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </motion.form>
    </main>
  );
}

/** The four-colour Google 'G'. */
function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-ui text-[11px] font-black uppercase tracking-[0.18em] text-wood-mid">
        {label}
      </span>
      {children}
    </label>
  );
}
