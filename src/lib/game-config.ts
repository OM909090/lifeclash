import type {
  Building,
  BuildingType,
  Guardian,
  GuardianId,
  League,
  LeagueId,
  Pillar,
  PillarId,
  Quest,
  SeasonTier,
  ConsistencyId,
  NemesisId,
  TimeBudgetId,
} from "@/types/game";

/* ========================================================================== */
/* BUILDINGS                                                                   */
/* ========================================================================== */

export interface BuildingMeta {
  type: BuildingType;
  name: string;
  domain: string;
  blurb: string;
  guardian: GuardianId | null;
  maxLevel: number;
  /** Fixed isometric grid slot — see LIFECLASH-SPEC.md FR-3.6. */
  x: number;
  y: number;
}

/**
 * Fixed placement keeps the 24h build safe (no drag-and-drop editor) and gives
 * every village a readable silhouette: Town Hall centred, pillars around it.
 * Grid is 6x6, coordinates are 0-indexed.
 */
export const BUILDINGS: Record<BuildingType, BuildingMeta> = {
  TOWN_HALL: {
    type: "TOWN_HALL",
    name: "Town Hall",
    domain: "Your life, overall",
    blurb:
      "The heart of your realm. Its level is your level — every quest you finish raises it.",
    guardian: null,
    maxLevel: 15,
    x: 3,
    y: 3,
  },
  ACADEMY: {
    type: "ACADEMY",
    name: "Academy",
    domain: "Learning · study · code",
    blurb:
      "Where knowledge is forged. Study sessions, courses and reading raise its arcane spire.",
    guardian: "scholar",
    maxLevel: 12,
    x: 1,
    y: 2,
  },
  TRAINING_GROUNDS: {
    type: "TRAINING_GROUNDS",
    name: "Training Grounds",
    domain: "Fitness · health · sport",
    blurb:
      "The arena of the body. Every workout, run and rep strengthens the colosseum walls.",
    guardian: "warrior",
    maxLevel: 12,
    x: 5,
    y: 2,
  },
  TREASURY: {
    type: "TREASURY",
    name: "Treasury",
    domain: "Finance · career · work",
    blurb:
      "The vault of your future. Saving, budgeting and career wins pile the gold higher.",
    guardian: "merchant",
    maxLevel: 12,
    x: 5,
    y: 4,
  },
  DEFENSE_TOWER: {
    type: "DEFENSE_TOWER",
    name: "Defense Tower",
    domain: "Streaks · discipline · sleep",
    blurb:
      "Your discipline made visible. The beacon burns bright on a streak and dims when you miss.",
    guardian: "sentinel",
    maxLevel: 12,
    x: 1,
    y: 4,
  },
  CLAN_MONUMENT: {
    type: "CLAN_MONUMENT",
    name: "Clan Monument",
    domain: "Your clan · together",
    blurb:
      "Raised by every member of your clan. Collective XP carves the next ring of stone.",
    guardian: null,
    maxLevel: 10,
    x: 3,
    y: 5,
  },
};

export const BUILDING_ORDER: BuildingType[] = [
  "TOWN_HALL",
  "ACADEMY",
  "TRAINING_GROUNDS",
  "TREASURY",
  "DEFENSE_TOWER",
  "CLAN_MONUMENT",
];

/** Gold cost to take a building from `level` to `level + 1`. */
export function upgradeCost(level: number): number {
  return Math.round(320 * Math.pow(1.55, level - 1));
}

/** Building XP required to unlock the next level. */
export function upgradeXpRequired(level: number): number {
  return Math.round(180 * Math.pow(1.4, level - 1));
}

/** Elixir cost — charged alongside gold from level 3 up. */
export function upgradeElixirCost(level: number): number {
  return level < 3 ? 0 : Math.round(120 * Math.pow(1.4, level - 3));
}

/* ========================================================================== */
/* PILLARS (onboarding step 2 → buildings)                                     */
/* ========================================================================== */

export const PILLARS: Pillar[] = [
  {
    id: "mind",
    label: "Mind",
    emoji: "🧠",
    blurb: "Learning, coding, reading",
    building: "ACADEMY",
    guardian: "scholar",
    from: "#7A8BFF",
    to: "#2E3A9E",
  },
  {
    id: "body",
    label: "Body",
    emoji: "💪",
    blurb: "Training, sport, health",
    building: "TRAINING_GROUNDS",
    guardian: "warrior",
    from: "#FF7A6E",
    to: "#96211D",
  },
  {
    id: "wealth",
    label: "Wealth",
    emoji: "💰",
    blurb: "Saving, career, money",
    building: "TREASURY",
    guardian: "merchant",
    from: "#FFD447",
    to: "#A8720C",
  },
  {
    id: "discipline",
    label: "Discipline",
    emoji: "🔥",
    blurb: "Streaks, habits, follow-through",
    building: "DEFENSE_TOWER",
    guardian: "sentinel",
    from: "#FFA95C",
    to: "#C1471B",
  },
  {
    id: "recovery",
    label: "Recovery",
    emoji: "😴",
    blurb: "Sleep, rest, recharge",
    building: "DEFENSE_TOWER",
    guardian: "sentinel",
    from: "#8FD4FF",
    to: "#1E4E8F",
  },
  {
    id: "focus",
    label: "Focus",
    emoji: "🎯",
    blurb: "Deep work, no distractions",
    building: "ACADEMY",
    guardian: "scholar",
    from: "#B78CFF",
    to: "#5A21B5",
  },
];

/* ========================================================================== */
/* GUARDIANS — the CoC hero reskin (KIRO-DESIGN-BRIEF §2)                      */
/* ========================================================================== */

export const GUARDIANS: Guardian[] = [
  {
    id: "scholar",
    name: "The Scholar",
    title: "Keeper of the Rune-Book",
    blurb:
      "A hooded sage whose glowing tome records every hour you spend learning.",
    pillar: "Mind · Learning",
    building: "ACADEMY",
    level: 60,
    element: "Arcane",
    elementEmoji: "📘",
    banner: "#5B6BE1",
    bannerDark: "#2E3A9E",
    accent: "#5FE8FF",
  },
  {
    id: "warrior",
    name: "The Warrior",
    title: "Champion of the Iron Ring",
    blurb:
      "An armored bruiser who answers every rep with a swing of the war-hammer.",
    pillar: "Body · Fitness",
    building: "TRAINING_GROUNDS",
    level: 55,
    element: "Might",
    elementEmoji: "💪",
    banner: "#E0453F",
    bannerDark: "#96211D",
    accent: "#D7DEE3",
  },
  {
    id: "merchant",
    name: "The Merchant",
    title: "Warden of the Golden Scales",
    blurb:
      "A gilded treasurer who weighs every coin you save and every deal you close.",
    pillar: "Wealth · Finance",
    building: "TREASURY",
    level: 50,
    element: "Fortune",
    elementEmoji: "🪙",
    banner: "#F0B429",
    bannerDark: "#A8720C",
    accent: "#2FBF71",
  },
  {
    id: "sentinel",
    name: "The Sentinel",
    title: "Bearer of the Everflame",
    blurb:
      "A shield-and-torch watch-guardian whose beacon burns as long as your streak.",
    pillar: "Discipline · Streaks",
    building: "DEFENSE_TOWER",
    level: 65,
    element: "Resolve",
    elementEmoji: "🔥",
    banner: "#3E8BE0",
    bannerDark: "#1E4E8F",
    accent: "#FF9A3C",
  },
];

export function guardianById(id: GuardianId): Guardian {
  return GUARDIANS.find((g) => g.id === id) ?? GUARDIANS[0];
}

/* ========================================================================== */
/* ONBOARDING OPTION SETS                                                      */
/* ========================================================================== */

export const CRESTS = ["🦁", "🐉", "🦅", "🐺", "🦉", "🐢", "🦌", "🐝"];

export const CONSISTENCY_OPTIONS: {
  id: ConsistencyId;
  label: string;
  blurb: string;
  emoji: string;
  league: LeagueId;
  trophies: number;
  difficulty: number;
}[] = [
  {
    id: "starting",
    label: "Just starting out",
    blurb: "Clean slate. We'll keep the first quests small and winnable.",
    emoji: "🌱",
    league: "WOOD",
    trophies: 40,
    difficulty: 1,
  },
  {
    id: "onoff",
    label: "On and off",
    blurb: "Some good weeks, some lost ones. We'll build the floor first.",
    emoji: "🌤️",
    league: "STONE",
    trophies: 180,
    difficulty: 2,
  },
  {
    id: "steady",
    label: "Pretty steady",
    blurb: "You show up most days. Expect real targets from day one.",
    emoji: "⚡",
    league: "BRONZE",
    trophies: 460,
    difficulty: 3,
  },
  {
    id: "disciplined",
    label: "Highly disciplined",
    blurb: "You want a challenge. Starting league and quest sizes scale up.",
    emoji: "👑",
    league: "SILVER",
    trophies: 820,
    difficulty: 4,
  },
];

export const NEMESIS_OPTIONS: {
  id: NemesisId;
  label: string;
  emoji: string;
  boss: string;
  taunt: string;
}[] = [
  {
    id: "procrastination",
    label: "Procrastination",
    emoji: "🐉",
    boss: "The Procrastination Dragon",
    taunt: "You'll start tomorrow. You always do.",
  },
  {
    id: "distraction",
    label: "Distraction",
    emoji: "📱",
    boss: "The Procrastination Dragon · Scroll-Wing",
    taunt: "Just one more scroll. What harm could it do?",
  },
  {
    id: "energy",
    label: "Low energy",
    emoji: "🪫",
    boss: "The Procrastination Dragon · Ash-Lung",
    taunt: "You're too tired. Rest another day.",
  },
  {
    id: "planning",
    label: "No plan",
    emoji: "🌫️",
    boss: "The Procrastination Dragon · Fog-Maw",
    taunt: "Where would you even begin?",
  },
  {
    id: "quitting",
    label: "Giving up too soon",
    emoji: "🥀",
    boss: "The Procrastination Dragon · Cinder-Heart",
    taunt: "Three days in and you'll fold. Like always.",
  },
];

export const TIME_BUDGETS: {
  id: TimeBudgetId;
  label: string;
  minutes: number;
  emoji: string;
  blurb: string;
  scale: number;
}[] = [
  {
    id: "15m",
    label: "15 min",
    minutes: 15,
    emoji: "🌱",
    blurb: "Tiny wins, every single day",
    scale: 0.7,
  },
  {
    id: "30m",
    label: "30 min",
    minutes: 30,
    emoji: "🌿",
    blurb: "The sweet spot for most realms",
    scale: 1,
  },
  {
    id: "1h",
    label: "1 hour",
    minutes: 60,
    emoji: "🌳",
    blurb: "Serious, sustainable progress",
    scale: 1.4,
  },
  {
    id: "2h",
    label: "2 hr+",
    minutes: 120,
    emoji: "🏔️",
    blurb: "Full send. Bring a shield.",
    scale: 1.9,
  },
];

export const SEASON_GOAL_PRESETS = [
  { label: "Get fit", emoji: "🏋️" },
  { label: "Crack a placement", emoji: "🎓" },
  { label: "Save money", emoji: "🪙" },
  { label: "Ship a project", emoji: "🚀" },
  { label: "Fix my sleep", emoji: "😴" },
];

/* ========================================================================== */
/* LEAGUES — Consistency Trophies (KIRO-DESIGN-BRIEF §5)                       */
/* ========================================================================== */

export const LEAGUES: League[] = [
  { id: "WOOD", name: "Wood", minTrophies: 0, from: "#C08A5A", to: "#6E401F", ring: "#4D2815" },
  { id: "STONE", name: "Stone", minTrophies: 150, from: "#D6DBD9", to: "#6C7375", ring: "#3B4245" },
  { id: "BRONZE", name: "Bronze", minTrophies: 400, from: "#F0A868", to: "#9A4F16", ring: "#5C2E0B" },
  { id: "SILVER", name: "Silver", minTrophies: 750, from: "#F2F6FA", to: "#8996A3", ring: "#4A5560" },
  { id: "GOLD", name: "Gold", minTrophies: 1200, from: "#FFE680", to: "#D8930C", ring: "#7A4E06" },
  { id: "CRYSTAL", name: "Crystal", minTrophies: 1800, from: "#B9F0FF", to: "#2E9BC7", ring: "#12566F" },
  { id: "LEGEND", name: "Legend", minTrophies: 2600, from: "#FFC7FB", to: "#8C31D6", ring: "#4A0F73" },
];

export function leagueFor(trophies: number): League {
  let current = LEAGUES[0];
  for (const l of LEAGUES) if (trophies >= l.minTrophies) current = l;
  return current;
}

export function nextLeague(trophies: number): League | null {
  const idx = LEAGUES.findIndex((l) => l.id === leagueFor(trophies).id);
  return LEAGUES[idx + 1] ?? null;
}

export function leagueById(id: LeagueId): League {
  return LEAGUES.find((l) => l.id === id) ?? LEAGUES[0];
}

/* ========================================================================== */
/* PLAYER LEVEL CURVE                                                          */
/* ========================================================================== */

/** Total XP needed to advance from `level` to `level + 1`. */
export function xpForLevel(level: number): number {
  return Math.round(420 * Math.pow(1.18, level - 1));
}

/* ========================================================================== */
/* QUEST TEMPLATES                                                             */
/* ========================================================================== */

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  category: Quest["category"];
  type: Quest["type"];
  cadence: Quest["cadence"];
  difficulty: number;
  building: BuildingType;
  /** Base target at the 30-min budget; scaled by the chosen time budget. */
  baseTarget?: number;
  unit?: string;
  pillar: PillarId;
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  /* ------------------------------------------------------------------- mind */
  {
    id: "study-session",
    title: "Study Session",
    description: "Sit down with one topic and go deep. No tabs, no phone.",
    category: "LEARNING",
    type: "DURATION",
    cadence: "DAILY",
    difficulty: 3,
    building: "ACADEMY",
    baseTarget: 30,
    unit: "min",
    pillar: "mind",
  },
  {
    id: "solve-problems",
    title: "Slay 5 Problems",
    description: "Five practice problems. Wrong answers still count as swings.",
    category: "LEARNING",
    type: "COUNT",
    cadence: "DAILY",
    difficulty: 3,
    building: "ACADEMY",
    baseTarget: 5,
    unit: "problems",
    pillar: "mind",
  },
  {
    id: "read-pages",
    title: "Read the Old Pages",
    description: "Read anything that isn't a feed. Ten pages is plenty.",
    category: "LEARNING",
    type: "COUNT",
    cadence: "DAILY",
    difficulty: 1,
    building: "ACADEMY",
    baseTarget: 10,
    unit: "pages",
    pillar: "mind",
  },
  /* ------------------------------------------------------------------- body */
  {
    id: "workout",
    title: "Train Your Body",
    description: "Gym, run, ride, court — anything that leaves you breathing hard.",
    category: "FITNESS",
    type: "DURATION",
    cadence: "DAILY",
    difficulty: 3,
    building: "TRAINING_GROUNDS",
    baseTarget: 30,
    unit: "min",
    pillar: "body",
  },
  {
    id: "steps",
    title: "March 6,000 Steps",
    description: "Get outside and move. The realm looks better from a walk.",
    category: "FITNESS",
    type: "COUNT",
    cadence: "DAILY",
    difficulty: 2,
    building: "TRAINING_GROUNDS",
    baseTarget: 6000,
    unit: "steps",
    pillar: "body",
  },
  {
    id: "stretch",
    title: "Mobility Drill",
    description: "Ten quiet minutes of stretching. Your future joints say thanks.",
    category: "FITNESS",
    type: "DURATION",
    cadence: "DAILY",
    difficulty: 1,
    building: "TRAINING_GROUNDS",
    baseTarget: 10,
    unit: "min",
    pillar: "body",
  },
  /* ----------------------------------------------------------------- wealth */
  {
    id: "log-spend",
    title: "Count the Coin",
    description: "Log yesterday's spending. Awareness is the whole quest.",
    category: "FINANCE",
    type: "BOOLEAN",
    cadence: "DAILY",
    difficulty: 1,
    building: "TREASURY",
    pillar: "wealth",
  },
  {
    id: "no-spend",
    title: "Seal the Vault",
    description: "One full day without an impulse purchase.",
    category: "FINANCE",
    type: "BOOLEAN",
    cadence: "DAILY",
    difficulty: 2,
    building: "TREASURY",
    pillar: "wealth",
  },
  {
    id: "career-step",
    title: "Advance the Craft",
    description: "One concrete career move: apply, message, ship, or practice.",
    category: "FINANCE",
    type: "BOOLEAN",
    cadence: "DAILY",
    difficulty: 3,
    building: "TREASURY",
    pillar: "wealth",
  },
  /* ------------------------------------------------------------- discipline */
  {
    id: "morning-rise",
    title: "Hold the Dawn",
    description: "Up at your target time. No snooze. The tower is watching.",
    category: "DISCIPLINE",
    type: "BOOLEAN",
    cadence: "DAILY",
    difficulty: 2,
    building: "DEFENSE_TOWER",
    pillar: "discipline",
  },
  {
    id: "keep-streak",
    title: "Feed the Beacon",
    description: "Complete any other quest today to keep the flame lit.",
    category: "DISCIPLINE",
    type: "STREAK",
    cadence: "DAILY",
    difficulty: 2,
    building: "DEFENSE_TOWER",
    pillar: "discipline",
  },
  /* --------------------------------------------------------------- recovery */
  {
    id: "sleep-window",
    title: "Rest the Realm",
    description: "Lights out inside your sleep window. Seven hours minimum.",
    category: "RECOVERY",
    type: "BOOLEAN",
    cadence: "DAILY",
    difficulty: 2,
    building: "DEFENSE_TOWER",
    pillar: "recovery",
  },
  {
    id: "screen-curfew",
    title: "Douse the Glass",
    description: "No screens for the last 30 minutes before bed.",
    category: "RECOVERY",
    type: "DURATION",
    cadence: "DAILY",
    difficulty: 2,
    building: "DEFENSE_TOWER",
    baseTarget: 30,
    unit: "min",
    pillar: "recovery",
  },
  /* ------------------------------------------------------------------ focus */
  {
    id: "deep-work",
    title: "Deep Work Siege",
    description: "One unbroken block on the hardest thing on your list.",
    category: "FOCUS",
    type: "DURATION",
    cadence: "DAILY",
    difficulty: 4,
    building: "ACADEMY",
    baseTarget: 45,
    unit: "min",
    pillar: "focus",
  },
  {
    id: "inbox-zero",
    title: "Clear the War Table",
    description: "Empty the inbox and pick tomorrow's three priorities.",
    category: "FOCUS",
    type: "BOOLEAN",
    cadence: "DAILY",
    difficulty: 2,
    building: "ACADEMY",
    pillar: "focus",
  },
  /* ----------------------------------------------------------------- weekly */
  {
    id: "weekly-training",
    title: "Five Trainings This Week",
    description: "Stack five sessions before the week closes.",
    category: "FITNESS",
    type: "COUNT",
    cadence: "WEEKLY",
    difficulty: 4,
    building: "TRAINING_GROUNDS",
    baseTarget: 5,
    unit: "sessions",
    pillar: "body",
  },
  {
    id: "weekly-study",
    title: "Ten Hours in the Academy",
    description: "Ten hours of real study across the week.",
    category: "LEARNING",
    type: "COUNT",
    cadence: "WEEKLY",
    difficulty: 4,
    building: "ACADEMY",
    baseTarget: 10,
    unit: "hours",
    pillar: "mind",
  },
];

/* ========================================================================== */
/* SEASON REWARD TRACK                                                         */
/* ========================================================================== */

export const SEASON_TIERS: SeasonTier[] = [
  { tier: 1, trophies: 0, reward: "Banner: First Light", emoji: "🚩" },
  { tier: 2, trophies: 120, reward: "80 Gems", emoji: "💚" },
  { tier: 3, trophies: 280, reward: "Decoration: Rune Lantern", emoji: "🏮" },
  { tier: 4, trophies: 480, reward: "2,500 Gold", emoji: "🪙" },
  { tier: 5, trophies: 720, reward: "Skin: Ivy Academy", emoji: "🌿", premium: true },
  { tier: 6, trophies: 1000, reward: "1,800 Elixir", emoji: "🧪" },
  { tier: 7, trophies: 1350, reward: "Decoration: Guardian Statue", emoji: "🗿" },
  { tier: 8, trophies: 1750, reward: "220 Gems", emoji: "💚" },
  { tier: 9, trophies: 2200, reward: "Skin: Obsidian Town Hall", emoji: "🏰", premium: true },
  { tier: 10, trophies: 2800, reward: "Title: Dragonsbane", emoji: "👑", premium: true },
];

export const SEASON = {
  name: "Season 1 · Rise of the Realm",
  endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 19).toISOString(),
};

/* ========================================================================== */
/* STARTING VILLAGE                                                            */
/* ========================================================================== */

/**
 * Seeds the village from the pillars chosen in onboarding step 2.
 * Town Hall always exists. Clan Monument starts LOCKED until level 5.
 */
export function seedBuildings(pillars: PillarId[], level = 1): Building[] {
  const wanted = new Set<BuildingType>(["TOWN_HALL"]);
  for (const p of pillars) {
    const pillar = PILLARS.find((x) => x.id === p);
    if (pillar) wanted.add(pillar.building);
  }
  wanted.add("CLAN_MONUMENT");

  return BUILDING_ORDER.filter((t) => wanted.has(t)).map((type) => {
    const meta = BUILDINGS[type];
    const locked = type === "CLAN_MONUMENT" && level < 5;
    return {
      id: `bld_${type.toLowerCase()}`,
      type,
      level: type === "TOWN_HALL" ? Math.max(1, level) : 1,
      xp: 0,
      x: meta.x,
      y: meta.y,
      status: locked ? "LOCKED" : "ACTIVE",
    } satisfies Building;
  });
}
