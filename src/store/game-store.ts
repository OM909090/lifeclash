"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Building,
  BuildingType,
  Clan,
  FloatingFx,
  OnboardingAnswers,
  Player,
  Quest,
  RaidBoss,
} from "@/types/game";
import {
  BUILDINGS,
  NEMESIS_OPTIONS,
  PILLARS,
  seedBuildings,
  upgradeCost,
  upgradeElixirCost,
  upgradeXpRequired,
  xpForLevel,
  leagueFor,
} from "@/lib/game-config";
import { generateQuests, makeEpicQuest, startingTrophies } from "@/lib/rewards";
import { MOCK_CLAN } from "@/lib/mock-social";
import { play } from "@/lib/audio";
import { uid } from "@/lib/utils";
import { api, ApiError } from "@/lib/api/client";
import {
  toBuilding,
  toClan,
  toPlayer,
  toQuest,
  toRaid,
  type ServerState,
} from "@/lib/api/serialize";

/* -------------------------------------------------------------------------- */
/* SHAPE                                                                       */
/* -------------------------------------------------------------------------- */

export interface QuestResult {
  quest: Quest;
  xp: number;
  gold: number;
  elixir: number;
  trophies: number;
  damage: number;
  leveledUp: boolean;
  newLevel: number;
  promoted: boolean;
  buildingLeveled: BuildingType | null;
}

/** Where the store reads and writes from. */
export type GameMode = "local" | "server";

export interface Notice {
  message: string;
  tone: "error" | "success";
}

interface GameState {
  hydrated: boolean;
  seeded: boolean;
  /**
   * "local" = Zustand + localStorage (no Supabase env).
   * "server" = authoritative Supabase state; mutations reconcile against it.
   */
  mode: GameMode;

  player: Player;
  buildings: Building[];
  quests: Quest[];
  epicQuest: Quest | null;
  raid: RaidBoss;
  clan: Clan;

  /** Transient reward particles rendered by <FxLayer/>. */
  fx: FloatingFx[];
  /** Screen-shake pulse counter — bumping it retriggers the animation. */
  shake: number;
  /** Level-up celebration payload. */
  celebration: { level: number; league: string | null } | null;
  /** Transient toast — surfaces server errors without blocking play. */
  notice: Notice | null;

  /* --------------------------------------------------------------- actions */
  setMode: (mode: GameMode) => void;
  /** Replace the whole world with an authoritative server snapshot. */
  applyServerState: (state: unknown) => void;
  seedFromOnboarding: (answers: OnboardingAnswers) => void;
  /** Server-aware seed used by the onboarding Forge step. */
  seedRealm: (answers: OnboardingAnswers) => Promise<void>;
  resetGame: () => void;

  completeQuest: (questId: string) => QuestResult | null;
  upgradeBuilding: (type: BuildingType) => boolean;
  collectBubble: (kind: "gold" | "elixir", amount: number) => void;
  purchaseItem: (itemId: string) => Promise<boolean>;

  /* custom-quest CRUD (the "add a task" the checklist requires) */
  createCustomQuest: (input: {
    title: string;
    category: Quest["category"];
    difficulty: number;
    type?: Quest["type"];
    targetValue?: number | null;
    unit?: string | null;
    description?: string;
  }) => Promise<boolean>;
  deleteCustomQuest: (questId: string) => Promise<void>;

  pushFx: (fx: Omit<FloatingFx, "id">) => void;
  clearFx: (id: string) => void;
  triggerShake: () => void;
  dismissCelebration: () => void;
  setNotice: (notice: Notice | null) => void;
  /** Surface a server error as a toast and optionally reload authoritative state. */
  handleServerError: (err: unknown, recovery?: "reload") => void;

  /* --------------------------------------------------------------- derived */
  xpNeeded: () => number;
  buildingByType: (type: BuildingType) => Building | undefined;
  canAfford: (gold: number, elixir: number) => boolean;
}

/* -------------------------------------------------------------------------- */
/* DEFAULTS                                                                    */
/* -------------------------------------------------------------------------- */

const DEFAULT_PLAYER: Player = {
  displayName: "Chieftain",
  realmName: "Everhold",
  crest: "🦁",
  level: 1,
  xp: 0,
  trophies: 40,
  streak: 0,
  buildersTotal: 2,
  buildersBusy: 0,
  resources: { gold: 1200, elixir: 600, gems: 100 },
  pillars: ["mind", "body"],
  guardian: "scholar",
  nemesis: "procrastination",
  timeBudget: "30m",
  seasonGoal: "Build the habit",
  consistency: "starting",
};

function defaultRaid(nemesis: Player["nemesis"]): RaidBoss {
  const opt =
    NEMESIS_OPTIONS.find((n) => n.id === nemesis) ?? NEMESIS_OPTIONS[0];
  return {
    name: opt.boss,
    title: opt.taunt,
    maxHp: 120_000,
    currentHp: 86_400,
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 62).toISOString(),
    yourDamage: 0,
    clanDamage: 33_600,
  };
}

/* -------------------------------------------------------------------------- */
/* STORE                                                                       */
/* -------------------------------------------------------------------------- */

type Persisted = Pick<
  GameState,
  "player" | "buildings" | "quests" | "epicQuest" | "raid" | "seeded"
>;

export const useGame = create<GameState>()(
  persist<GameState, [], [], Persisted>(
    (set, get) => ({
      hydrated: false,
      seeded: false,
      mode: "local",

      player: DEFAULT_PLAYER,
      buildings: seedBuildings(DEFAULT_PLAYER.pillars),
      quests: generateQuests(DEFAULT_PLAYER.pillars, "30m", "starting"),
      epicQuest: null,
      raid: defaultRaid("procrastination"),
      clan: MOCK_CLAN,

      fx: [],
      shake: 0,
      celebration: null,
      notice: null,

      setMode: (mode) => set({ mode }),
      setNotice: (notice) => set({ notice }),

      /* ------------------------------------------------- server snapshot */
      applyServerState: (raw) => {
        const s = raw as ServerState | null;
        if (!s || !s.profile) return;
        const player = toPlayer(s.profile);
        const allQuests = (s.quests ?? []).map(toQuest);
        set({
          player,
          buildings: (s.buildings ?? []).map(toBuilding),
          quests: allQuests.filter((q) => q.cadence !== "EPIC"),
          epicQuest: allQuests.find((q) => q.cadence === "EPIC") ?? null,
          raid: s.raid ? toRaid(s.raid, get().raid) : get().raid,
          clan: toClan(s.clan, player),
          seeded: s.profile.seeded,
        });
      },

      /* ------------------------------------------------------------- seed */
      seedFromOnboarding: (answers) => {
        const pillars = answers.pillars.length
          ? answers.pillars
          : DEFAULT_PLAYER.pillars;
        const primary = PILLARS.find((p) => p.id === pillars[0]);

        const player: Player = {
          displayName: answers.displayName.trim() || "Chieftain",
          realmName: answers.realmName.trim() || "Everhold",
          crest: answers.crest || "🦁",
          level: 1,
          xp: 0,
          trophies: startingTrophies(answers.consistency),
          streak: 0,
          buildersTotal: 2,
          buildersBusy: 0,
          resources: { gold: 1200, elixir: 600, gems: 100 },
          pillars,
          guardian: primary?.guardian ?? "scholar",
          nemesis: answers.nemesis ?? "procrastination",
          timeBudget: answers.timeBudget ?? "30m",
          seasonGoal: answers.seasonGoal.trim() || "Build the habit",
          consistency: answers.consistency ?? "starting",
        };

        set({
          player,
          buildings: seedBuildings(pillars),
          quests: generateQuests(pillars, answers.timeBudget, answers.consistency),
          epicQuest: makeEpicQuest(player.seasonGoal, answers.timeBudget),
          raid: defaultRaid(player.nemesis),
          clan: { ...MOCK_CLAN },
          seeded: true,
          fx: [],
          celebration: null,
        });
      },

      /* Server-aware seed: persists to Supabase when configured, else local. */
      seedRealm: async (answers) => {
        if (get().mode !== "server") {
          get().seedFromOnboarding(answers);
          return;
        }
        try {
          const state = await api.seedRealm(answers);
          get().applyServerState(state);
        } catch {
          // Fall back to a local seed so the wizard never dead-ends; the next
          // authenticated state load will reconcile.
          get().seedFromOnboarding(answers);
        }
      },

      resetGame: () =>
        set({
          player: DEFAULT_PLAYER,
          buildings: seedBuildings(DEFAULT_PLAYER.pillars),
          quests: generateQuests(DEFAULT_PLAYER.pillars, "30m", "starting"),
          epicQuest: null,
          raid: defaultRaid("procrastination"),
          clan: { ...MOCK_CLAN },
          seeded: false,
          fx: [],
          celebration: null,
        }),

      /* --------------------------------------------------- complete quest */
      completeQuest: (questId) => {
        const state = get();
        const quest = state.quests.find((q) => q.id === questId);
        if (!quest || quest.status === "COMPLETED") return null;

        const { xp, gold, elixir, trophies = 0 } = quest.reward;
        const damage = quest.damage;

        const player = state.player;
        const leagueBefore = leagueFor(player.trophies).id;

        // ---- player XP + level roll-up ----------------------------------
        let level = player.level;
        let carry = player.xp + xp;
        let leveledUp = false;
        while (carry >= xpForLevel(level)) {
          carry -= xpForLevel(level);
          level += 1;
          leveledUp = true;
        }

        const trophiesAfter = player.trophies + trophies;
        const leagueAfter = leagueFor(trophiesAfter).id;
        const promoted = leagueAfter !== leagueBefore;

        // ---- building XP + level roll-up --------------------------------
        let buildingLeveled: BuildingType | null = null;
        const buildings = state.buildings.map((b) => {
          if (b.type !== quest.building) return b;
          const meta = BUILDINGS[b.type];
          let bxp = b.xp + Math.round(xp * 0.6);
          let blevel = b.level;
          while (blevel < meta.maxLevel && bxp >= upgradeXpRequired(blevel)) {
            bxp -= upgradeXpRequired(blevel);
            blevel += 1;
            buildingLeveled = b.type;
          }
          return {
            ...b,
            xp: bxp,
            level: blevel,
            status:
              blevel >= meta.maxLevel
                ? ("MAX_LEVEL" as const)
                : ("ACTIVE" as const),
          };
        });

        // Unlock the Clan Monument once the realm hits level 5.
        const unlocked = buildings.map((b) =>
          b.type === "CLAN_MONUMENT" && b.status === "LOCKED" && level >= 5
            ? { ...b, status: "ACTIVE" as const }
            : b,
        );

        // ---- raid boss --------------------------------------------------
        const raid = {
          ...state.raid,
          currentHp: Math.max(0, state.raid.currentHp - damage),
          yourDamage: state.raid.yourDamage + damage,
          clanDamage: state.raid.clanDamage + damage,
        };

        // ---- clan monument ---------------------------------------------
        const clan = {
          ...state.clan,
          monumentXp: state.clan.monumentXp + Math.round(xp * 0.5),
          weeklyXp: state.clan.weeklyXp + xp,
          members: state.clan.members.map((m) =>
            m.isYou ? { ...m, weeklyXp: m.weeklyXp + xp, level } : m,
          ),
        };

        set({
          quests: state.quests.map((q) =>
            q.id === questId
              ? {
                  ...q,
                  status: "COMPLETED" as const,
                  completedValue: q.targetValue ?? 1,
                }
              : q,
          ),
          buildings: unlocked,
          raid,
          clan,
          player: {
            ...player,
            level,
            xp: carry,
            trophies: trophiesAfter,
            streak: player.streak + 1,
            resources: {
              gold: player.resources.gold + gold,
              elixir: player.resources.elixir + elixir,
              gems: player.resources.gems + (quest.reward.gems ?? 0),
            },
          },
          epicQuest: state.epicQuest
            ? {
                ...state.epicQuest,
                completedValue: Math.min(100, state.epicQuest.completedValue + 3),
              }
            : null,
          celebration: leveledUp
            ? { level, league: promoted ? leagueAfter : null }
            : state.celebration,
        });

        play("questComplete");
        if (leveledUp) {
          get().triggerShake();
          window.setTimeout(() => play("levelUp"), 260);
        }

        // The reward values are server-authored and already stored on the
        // quest, so the optimistic update above matches what the server will
        // return. In server mode we persist + reconcile in the background.
        if (get().mode === "server") {
          api
            .completeQuest(questId, uid("idem"))
            .then((res) => get().applyServerState(res.state))
            .catch((e) => get().handleServerError(e, "reload"));
        }

        return {
          quest,
          xp,
          gold,
          elixir,
          trophies,
          damage,
          leveledUp,
          newLevel: level,
          promoted,
          buildingLeveled,
        };
      },

      /* -------------------------------------------------- upgrade building */
      upgradeBuilding: (type) => {
        const state = get();
        const building = state.buildings.find((b) => b.type === type);
        if (!building) return false;

        const meta = BUILDINGS[type];
        if (building.level >= meta.maxLevel) {
          play("error");
          return false;
        }

        const gold = upgradeCost(building.level);
        const elixir = upgradeElixirCost(building.level);
        if (!state.canAfford(gold, elixir)) {
          play("error");
          return false;
        }

        set({
          player: {
            ...state.player,
            resources: {
              ...state.player.resources,
              gold: state.player.resources.gold - gold,
              elixir: state.player.resources.elixir - elixir,
            },
          },
          buildings: state.buildings.map((b) =>
            b.type === type
              ? {
                  ...b,
                  level: b.level + 1,
                  status:
                    b.level + 1 >= meta.maxLevel
                      ? ("MAX_LEVEL" as const)
                      : ("ACTIVE" as const),
                }
              : b,
          ),
        });

        if (get().mode === "server") {
          api
            .upgradeBuilding(type)
            .then((s) => get().applyServerState(s))
            .catch((e) => get().handleServerError(e, "reload"));
        }

        return true;
      },

      /* ------------------------------------------------------- collectibles */
      collectBubble: (kind, amount) => {
        const state = get();
        set({
          player: {
            ...state.player,
            resources: {
              ...state.player.resources,
              [kind]: state.player.resources[kind] + amount,
            },
          },
        });
        play(kind === "gold" ? "coin" : "elixir");

        if (get().mode === "server") {
          api
            .collectResource(kind, amount)
            .then((s) => get().applyServerState(s))
            .catch((e) => get().handleServerError(e, "reload"));
        }
      },

      /* ------------------------------------------------------------- shop */
      purchaseItem: async (itemId) => {
        if (get().mode !== "server") {
          // Local mode: the shop is a preview only, so just play the sound.
          play("coin");
          return true;
        }
        try {
          const s = await api.purchaseItem(itemId);
          get().applyServerState(s);
          play("coin");
          get().setNotice({ message: "Purchased!", tone: "success" });
          return true;
        } catch (e) {
          get().handleServerError(e);
          return false;
        }
      },

      /* --------------------------------------------- custom quest CRUD */
      createCustomQuest: async (input) => {
        if (get().mode !== "server") {
          // Local mode: build the quest client-side so the board still updates.
          const reward = {
            xp: Math.round(50 * (input.difficulty === 4 ? 1.6 : input.difficulty === 3 ? 1.25 : input.difficulty === 2 ? 1 : 0.8)),
            gold: 0,
            elixir: 0,
            trophies: Math.max(1, input.difficulty * 6),
          };
          reward.gold = Math.round(reward.xp * 0.55);
          reward.elixir = Math.round(reward.xp * 0.3);
          const q: Quest = {
            id: uid("q"),
            title: input.title,
            description: input.description ?? "",
            category: input.category,
            type: input.type ?? "BOOLEAN",
            cadence: "DAILY",
            status: "AVAILABLE",
            difficulty: input.difficulty,
            targetValue: input.targetValue ?? undefined,
            completedValue: 0,
            unit: input.unit ?? undefined,
            building:
              input.category === "FITNESS"
                ? "TRAINING_GROUNDS"
                : input.category === "FINANCE"
                  ? "TREASURY"
                  : input.category === "DISCIPLINE" || input.category === "RECOVERY"
                    ? "DEFENSE_TOWER"
                    : "ACADEMY",
            reward,
            damage: Math.round(reward.xp * 2.4 * (1 + input.difficulty * 0.15)),
            isCustom: true,
          };
          set((s) => ({ quests: [...s.quests, q] }));
          play("select");
          return true;
        }
        try {
          await api.createQuest(input);
          const s = await api.getState();
          get().applyServerState(s);
          play("select");
          return true;
        } catch (e) {
          get().handleServerError(e);
          return false;
        }
      },

      deleteCustomQuest: async (questId) => {
        set((s) => ({ quests: s.quests.filter((q) => q.id !== questId) }));
        play("back");
        if (get().mode === "server") {
          try {
            await api.deleteQuest(questId);
          } catch (e) {
            get().handleServerError(e, "reload");
          }
        }
      },

      /* --------------------------------------------- server error handling */
      handleServerError: (err: unknown, recovery?: "reload") => {
        const message =
          err instanceof ApiError ? err.message : "Sync failed. Retrying…";
        get().setNotice({ message, tone: "error" });
        window.setTimeout(() => get().setNotice(null), 3200);
        // For state-mutating failures, pull the authoritative state back so the
        // optimistic update can't drift from the server.
        if (recovery === "reload" && get().mode === "server") {
          api.getState().then((s) => get().applyServerState(s)).catch(() => {});
        }
      },

      /* ------------------------------------------------------------- fx */
      pushFx: (fx) => {
        const id = uid("fx");
        set((s) => ({ fx: [...s.fx, { ...fx, id }] }));
        window.setTimeout(() => get().clearFx(id), 1300);
      },
      clearFx: (id) => set((s) => ({ fx: s.fx.filter((f) => f.id !== id) })),
      triggerShake: () => set((s) => ({ shake: s.shake + 1 })),
      dismissCelebration: () => set({ celebration: null }),

      /* -------------------------------------------------------- derived */
      xpNeeded: () => xpForLevel(get().player.level),
      buildingByType: (type) => get().buildings.find((b) => b.type === type),
      canAfford: (gold, elixir) => {
        const r = get().player.resources;
        return r.gold >= gold && r.elixir >= elixir;
      },
    }),
    {
      name: "lifeclash.game",
      version: 1,
      // The server renders the store's *initial* value. Reading localStorage
      // during the first client render would produce a hydration mismatch, so
      // rehydration is deferred to <StoreHydrator/> inside an effect.
      skipHydration: true,
      partialize: (s) => ({
        player: s.player,
        buildings: s.buildings,
        quests: s.quests,
        epicQuest: s.epicQuest,
        raid: s.raid,
        seeded: s.seeded,
      }),
    },
  ),
);
