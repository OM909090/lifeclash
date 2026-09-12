/**
 * LifeClash domain types.
 *
 * These mirror the Prisma models in LIFECLASH-SPEC.md §6 so that the frontend
 * can be pointed at the real Supabase-backed API later without reshaping
 * component props. Anything the server will eventually own (xp/gold/level math)
 * is computed in `lib/rewards.ts` and nowhere else.
 */

/* ------------------------------------------------------------------ buildings */

export type BuildingType =
  | "TOWN_HALL"
  | "ACADEMY"
  | "TRAINING_GROUNDS"
  | "TREASURY"
  | "DEFENSE_TOWER"
  | "CLAN_MONUMENT";

export type BuildingStatus = "LOCKED" | "ACTIVE" | "UPGRADING" | "MAX_LEVEL";

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  xp: number;
  /** Grid coordinate on the isometric board. */
  x: number;
  y: number;
  status: BuildingStatus;
}

/* --------------------------------------------------------------------- pillars */

export type PillarId =
  | "mind"
  | "body"
  | "wealth"
  | "discipline"
  | "recovery"
  | "focus";

export interface Pillar {
  id: PillarId;
  label: string;
  emoji: string;
  blurb: string;
  building: BuildingType;
  guardian: GuardianId;
  /** Tailwind gradient stops for the selection card. */
  from: string;
  to: string;
}

/* ------------------------------------------------------------------- guardians */

export type GuardianId = "scholar" | "warrior" | "merchant" | "sentinel";

export interface Guardian {
  id: GuardianId;
  name: string;
  title: string;
  blurb: string;
  pillar: string;
  building: BuildingType;
  level: number;
  element: string;
  elementEmoji: string;
  /** Banner + card accent colours. */
  banner: string;
  bannerDark: string;
  accent: string;
}

/* ---------------------------------------------------------------------- quests */

export type QuestCategory =
  | "LEARNING"
  | "FITNESS"
  | "FINANCE"
  | "DISCIPLINE"
  | "FOCUS"
  | "RECOVERY";

export type QuestType = "BOOLEAN" | "DURATION" | "COUNT" | "MILESTONE" | "STREAK";

export type QuestStatus =
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CLAIMED"
  | "EXPIRED";

export type QuestCadence = "DAILY" | "WEEKLY" | "EPIC";

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  type: QuestType;
  cadence: QuestCadence;
  status: QuestStatus;
  /** 1–4 → EASY / MEDIUM / HARD / EPIC */
  difficulty: number;
  targetValue?: number;
  completedValue: number;
  unit?: string;
  building: BuildingType;
  reward: Reward;
  /** Raid damage this quest deals to the weekly boss on completion. */
  damage: number;
  /** True for user-authored quests (deletable/editable). */
  isCustom?: boolean;
}

export interface Reward {
  xp: number;
  gold: number;
  elixir: number;
  gems?: number;
  /** Consistency Points — the league/trophy currency. */
  trophies?: number;
}

/* --------------------------------------------------------------------- economy */

export interface Resources {
  gold: number;
  elixir: number;
  gems: number;
}

/* --------------------------------------------------------------------- leagues */

export type LeagueId =
  | "WOOD"
  | "STONE"
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "CRYSTAL"
  | "LEGEND";

export interface League {
  id: LeagueId;
  name: string;
  minTrophies: number;
  /** Badge gradient stops. */
  from: string;
  to: string;
  ring: string;
}

/* ---------------------------------------------------------------------- player */

export interface Player {
  displayName: string;
  realmName: string;
  crest: string;
  /** Account identity (populated in server mode). */
  email?: string;
  avatarUrl?: string;
  authProvider?: string;
  memberSince?: string;
  level: number;
  xp: number;
  trophies: number;
  streak: number;
  buildersTotal: number;
  buildersBusy: number;
  resources: Resources;
  pillars: PillarId[];
  guardian: GuardianId;
  nemesis: NemesisId;
  timeBudget: TimeBudgetId;
  seasonGoal: string;
  consistency: ConsistencyId;
}

/* ------------------------------------------------------------------ onboarding */

export type ConsistencyId = "starting" | "onoff" | "steady" | "disciplined";
export type NemesisId =
  | "procrastination"
  | "distraction"
  | "energy"
  | "planning"
  | "quitting";
export type TimeBudgetId = "15m" | "30m" | "1h" | "2h";

export interface OnboardingAnswers {
  realmName: string;
  displayName: string;
  crest: string;
  pillars: PillarId[];
  consistency: ConsistencyId | null;
  nemesis: NemesisId | null;
  timeBudget: TimeBudgetId | null;
  seasonGoal: string;
}

/* ---------------------------------------------------------------- social / raid */

export interface RaidBoss {
  name: string;
  title: string;
  maxHp: number;
  currentHp: number;
  endsAt: string;
  yourDamage: number;
  clanDamage: number;
}

export interface ClanMemberSummary {
  id: string;
  name: string;
  role: "OWNER" | "LEADER" | "OFFICER" | "MEMBER";
  level: number;
  weeklyXp: number;
  trophies: number;
  streak: number;
  crest: string;
  isYou?: boolean;
}

export interface Clan {
  name: string;
  tag: string;
  description: string;
  monumentLevel: number;
  monumentXp: number;
  monumentTarget: number;
  weeklyGoal: number;
  weeklyXp: number;
  members: ClanMemberSummary[];
}

export type LeaderboardScope = "GLOBAL" | "FRIENDS" | "CLAN";

export interface LeaderboardRow {
  rank: number;
  name: string;
  crest: string;
  level: number;
  weeklyXp: number;
  trophies: number;
  streak: number;
  league: LeagueId;
  isYou?: boolean;
}

/* --------------------------------------------------------------------- seasons */

export interface SeasonTier {
  tier: number;
  trophies: number;
  reward: string;
  emoji: string;
  premium?: boolean;
}

/* ------------------------------------------------------------------- ui / fx */

export type ModalId =
  | "quests"
  | "upgrade"
  | "raid"
  | "clan"
  | "shop"
  | "settings"
  | "leaderboard"
  | "season"
  | "info"
  | "profile";

export interface FloatingFx {
  id: string;
  label: string;
  /** Screen coordinates in px. */
  x: number;
  y: number;
  tone: "xp" | "gold" | "elixir" | "gem" | "damage" | "trophy";
}
