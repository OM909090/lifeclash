"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useGame } from "@/store/game-store";
import { useOnboarding } from "@/store/onboarding-store";
import { useUi } from "@/store/ui-store";
import {
  getAudioState,
  play,
  setAudioEnabled,
  setVolume,
} from "@/lib/audio";
import { cn } from "@/lib/utils";

export function SettingsModal() {
  const router = useRouter();
  const modal = useUi((s) => s.modal);
  const closeModal = useUi((s) => s.closeModal);
  const resetGame = useGame((s) => s.resetGame);
  const resetOnboarding = useOnboarding((s) => s.reset);
  const player = useGame((s) => s.player);
  const mode = useGame((s) => s.mode);

  const [sound, setSound] = useState(true);
  const [vol, setVol] = useState(0.55);
  const [confirmReset, setConfirmReset] = useState(false);

  // Read the persisted audio prefs once the modal opens.
  useEffect(() => {
    if (!modal) return;
    const s = getAudioState();
    setSound(s.enabled);
    setVol(s.volume);
  }, [modal]);

  const startOver = () => {
    resetGame();
    resetOnboarding();
    closeModal();
    router.push("/onboarding");
  };

  const signOut = async () => {
    const { getBrowserClient } = await import("@/lib/supabase/client");
    await getBrowserClient()?.auth.signOut();
    closeModal();
    router.push("/");
    router.refresh();
  };

  return (
    <Modal
      open={modal === "settings"}
      onClose={() => {
        setConfirmReset(false);
        closeModal();
      }}
      title="Settings"
      subtitle={`${player.realmName} · ruled by ${player.displayName}`}
      icon="⚙️"
      size="sm"
    >
      <div className="flex flex-col gap-3">
        {/* ------------------------------------------------------------ sound */}
        <Section title="Sound">
          <Row
            label="Sound effects"
            hint="All audio is synthesised in-browser — no files, no samples."
          >
            <Toggle
              on={sound}
              onChange={(next) => {
                setSound(next);
                setAudioEnabled(next);
                if (next) play("tap");
              }}
            />
          </Row>

          <div className="px-3 pb-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="font-ui text-[10px] font-black uppercase tracking-wider text-wood-mid">
                Volume
              </span>
              <span className="font-ui text-[11px] font-black tabular-nums text-wood-deep">
                {Math.round(vol * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={vol}
              disabled={!sound}
              onChange={(e) => {
                const v = Number(e.target.value);
                setVol(v);
                setVolume(v);
              }}
              onMouseUp={() => sound && play("coin")}
              className="h-2 w-full cursor-pointer appearance-none rounded-pill bg-wood-dark/30 accent-gold-base disabled:opacity-40"
              aria-label="Volume"
            />
          </div>
        </Section>

        {/* --------------------------------------------------------- gameplay */}
        <Section title="Your realm">
          <Row label="Realm" hint="Set during onboarding">
            <span className="font-display text-sm text-wood-deep">
              {player.realmName}
            </span>
          </Row>
          <Row label="Guardian" hint="Follows your first chosen pillar">
            <span className="font-display text-sm capitalize text-wood-deep">
              {player.guardian}
            </span>
          </Row>
          <Row label="Daily budget" hint="Scales quest size and rewards">
            <span className="font-display text-sm text-wood-deep">
              {player.timeBudget}
            </span>
          </Row>
          {mode === "server" ? (
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar avatarUrl={player.avatarUrl} crest={player.crest} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm text-wood-deep">
                  {player.email || player.displayName}
                </p>
                <p className="font-body text-[11px] font-semibold text-wood-mid">
                  {player.authProvider === "google"
                    ? "Signed in with Google · syncs across devices"
                    : "Saved to Supabase · syncs across devices"}
                </p>
              </div>
              <Button tone="stone" size="sm" onClick={signOut} className="shrink-0">
                Sign out
              </Button>
            </div>
          ) : null}
        </Section>

        {/* ---------------------------------------------------------- privacy */}
        <Section title="Privacy">
          <p className="px-3 py-2.5 font-body text-xs font-semibold leading-snug text-wood-mid">
            Finance quests are private by design and never appear on leaderboards or
            in another player&apos;s village view. Only your level, league, streak and
            weekly XP are public.
          </p>
        </Section>

        {/* ------------------------------------------------------------ danger */}
        <Section title="Danger zone" tone="danger">
          {confirmReset ? (
            <div className="flex flex-col gap-2 p-3">
              <p className="font-body text-xs font-bold leading-snug text-danger">
                This wipes your realm, quests, resources and league progress, then
                restarts onboarding. It cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  tone="stone"
                  size="sm"
                  fullWidth
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </Button>
                <Button tone="danger" size="sm" fullWidth onClick={startOver}>
                  Yes, wipe it
                </Button>
              </div>
            </div>
          ) : (
            <Row label="Start a new realm" hint="Resets all local progress">
              <Button
                tone="danger"
                size="sm"
                onClick={() => setConfirmReset(true)}
              >
                Reset
              </Button>
            </Row>
          )}
        </Section>

        <p className="text-center font-ui text-[10px] font-bold uppercase tracking-wider text-wood-mid/55">
          Progress is stored in this browser. Accounts arrive with the backend.
        </p>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */

function Section({
  title,
  children,
  tone = "normal",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "normal" | "danger";
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-chunk border-2",
        tone === "danger"
          ? "border-danger/40 bg-danger/8"
          : "border-wood-dark/25 bg-tan-light/70",
      )}
    >
      <p
        className={cn(
          "border-b-2 px-3 py-1.5 font-ui text-[10px] font-black uppercase tracking-[0.2em]",
          tone === "danger"
            ? "border-danger/25 text-danger"
            : "border-wood-dark/15 text-wood-mid",
        )}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm text-wood-deep">{label}</p>
        {hint ? (
          <p className="font-body text-[11px] font-semibold leading-snug text-wood-mid">
            {hint}
          </p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-8 w-14 rounded-pill border-[3px] transition-colors",
        on
          ? "border-gem-deep bg-gem-gradient"
          : "border-stone-dark bg-stone-gradient",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full border-2 border-wood-dark bg-cream transition-all",
          on ? "left-[26px]" : "left-0.5",
        )}
      />
    </button>
  );
}
