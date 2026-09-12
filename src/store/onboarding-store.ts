"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ConsistencyId,
  NemesisId,
  OnboardingAnswers,
  PillarId,
  TimeBudgetId,
} from "@/types/game";

export const TOTAL_STEPS = 8;

interface OnboardingState extends OnboardingAnswers {
  step: number;
  completed: boolean;

  setRealmName: (v: string) => void;
  setDisplayName: (v: string) => void;
  setCrest: (v: string) => void;
  togglePillar: (id: PillarId) => void;
  setConsistency: (v: ConsistencyId) => void;
  setNemesis: (v: NemesisId) => void;
  setTimeBudget: (v: TimeBudgetId) => void;
  setSeasonGoal: (v: string) => void;

  next: () => void;
  back: () => void;
  goto: (step: number) => void;
  finish: () => void;
  reset: () => void;

  /** Whether the current step's requirements are satisfied. */
  canAdvance: () => boolean;
}

const initial: OnboardingAnswers & { step: number; completed: boolean } = {
  step: 1,
  completed: false,
  realmName: "",
  displayName: "",
  crest: "🦁",
  pillars: [],
  consistency: null,
  nemesis: null,
  timeBudget: null,
  seasonGoal: "",
};

type PersistedOnboarding = Omit<
  OnboardingAnswers,
  never
> & { completed: boolean };

export const useOnboarding = create<OnboardingState>()(
  persist<OnboardingState, [], [], PersistedOnboarding>(
    (set, get) => ({
      ...initial,

      setRealmName: (v) => set({ realmName: v.slice(0, 24) }),
      setDisplayName: (v) => set({ displayName: v.slice(0, 20) }),
      setCrest: (v) => set({ crest: v }),

      togglePillar: (id) =>
        set((s) => ({
          pillars: s.pillars.includes(id)
            ? s.pillars.filter((p) => p !== id)
            : [...s.pillars, id],
        })),

      setConsistency: (v) => set({ consistency: v }),
      setNemesis: (v) => set({ nemesis: v }),
      setTimeBudget: (v) => set({ timeBudget: v }),
      setSeasonGoal: (v) => set({ seasonGoal: v.slice(0, 60) }),

      next: () => set((s) => ({ step: Math.min(TOTAL_STEPS, s.step + 1) })),
      back: () => set((s) => ({ step: Math.max(1, s.step - 1) })),
      goto: (step) => set({ step: Math.min(TOTAL_STEPS, Math.max(1, step)) }),
      finish: () => set({ completed: true }),
      reset: () => set({ ...initial }),

      canAdvance: () => {
        const s = get();
        switch (s.step) {
          case 1:
            return s.realmName.trim().length >= 2;
          case 2:
            return s.pillars.length >= 2;
          case 3:
            return s.consistency !== null;
          case 4:
            return s.nemesis !== null;
          case 5:
            return s.timeBudget !== null;
          case 6:
            return s.seasonGoal.trim().length >= 2;
          default:
            return true;
        }
      },
    }),
    {
      name: "lifeclash.onboarding",
      version: 1,
      skipHydration: true,
      // Never persist the transient step pointer — resuming mid-wizard is
      // confusing; answers are what matter.
      partialize: (s) => ({
        realmName: s.realmName,
        displayName: s.displayName,
        crest: s.crest,
        pillars: s.pillars,
        consistency: s.consistency,
        nemesis: s.nemesis,
        timeBudget: s.timeBudget,
        seasonGoal: s.seasonGoal,
        completed: s.completed,
      }),
    },
  ),
);
