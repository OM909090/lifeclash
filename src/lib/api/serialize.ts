/**
 * Maps the authoritative server snapshot (snake_case JSON from lc_get_state)
 * into the camelCase shapes the store and UI already use. Keeping this in one
 * place means the components never learn the DB column names.
 */

import type {
  Building,
  BuildingStatus,
  BuildingType,
  Clan,
  Player,
  Quest,
  RaidBoss,
} from "@/types/game";
import { MOCK_CLAN } from "@/lib/mock-social";

/* Raw shapes as returned by Postgres (only the fields we read). */
interface RawProfile {
  display_name: string;
  realm_name: string;
  crest: string;
  email?: string | null;
  avatar_url?: string | null;
  auth_provider?: string | null;
  created_at?: string | null;
  level: number;
  xp: number;
  trophies: number;
  streak: number;
  builders_total: number;
  builders_busy: number;
  gold: number;
  elixir: number;
  gems: number;
  pillars: string[];
  guardian: string;
  nemesis: string;
  time_budget: string;
  season_goal: string;
  consistency: string;
  seeded: boolean;
}

interface RawBuilding {
  id: string;
  type: string;
  level: number;
  xp: number;
  x: number;
  y: number;
  status: string;
}

interface RawQuest {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  cadence: string;
  status: string;
  difficulty: number;
  target_value: number | null;
  completed_value: number;
  unit: string | null;
  building: string;
  reward_xp: number;
  reward_gold: number;
  reward_elixir: number;
  reward_trophies: number;
  damage: number;
  is_custom: boolean;
}

interface RawClan {
  name: string;
  tag: string;
  description: string;
  monument_level: number;
  monument_xp: number;
  monument_target: number;
  weekly_goal: number;
  weekly_xp: number;
}

interface RawRaid {
  name: string;
  title: string;
  max_hp: number;
  current_hp: number;
  clan_damage: number;
  ends_at: string;
  yourDamage: number;
}

export interface ServerState {
  profile: RawProfile | null;
  buildings: RawBuilding[];
  quests: RawQuest[];
  clan: RawClan | null;
  raid: RawRaid | null;
}

export function toPlayer(p: RawProfile): Player {
  return {
    displayName: p.display_name,
    realmName: p.realm_name,
    crest: p.crest,
    email: p.email ?? undefined,
    avatarUrl: p.avatar_url ?? undefined,
    authProvider: p.auth_provider ?? undefined,
    memberSince: p.created_at ?? undefined,
    level: p.level,
    xp: p.xp,
    trophies: p.trophies,
    streak: p.streak,
    buildersTotal: p.builders_total,
    buildersBusy: p.builders_busy,
    resources: { gold: p.gold, elixir: p.elixir, gems: p.gems },
    pillars: p.pillars as Player["pillars"],
    guardian: p.guardian as Player["guardian"],
    nemesis: p.nemesis as Player["nemesis"],
    timeBudget: p.time_budget as Player["timeBudget"],
    seasonGoal: p.season_goal,
    consistency: p.consistency as Player["consistency"],
  };
}

export function toBuilding(b: RawBuilding): Building {
  return {
    id: b.id,
    type: b.type as BuildingType,
    level: b.level,
    xp: b.xp,
    x: b.x,
    y: b.y,
    status: b.status as BuildingStatus,
  };
}

export function toQuest(q: RawQuest): Quest {
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    category: q.category as Quest["category"],
    type: q.type as Quest["type"],
    cadence: q.cadence as Quest["cadence"],
    status: q.status as Quest["status"],
    difficulty: q.difficulty,
    targetValue: q.target_value ?? undefined,
    completedValue: q.completed_value,
    unit: q.unit ?? undefined,
    building: q.building as BuildingType,
    reward: {
      xp: q.reward_xp,
      gold: q.reward_gold,
      elixir: q.reward_elixir,
      trophies: q.reward_trophies,
    },
    damage: q.damage,
    isCustom: q.is_custom,
  };
}

export function toRaid(r: RawRaid, fallback: RaidBoss): RaidBoss {
  return {
    name: r.name,
    title: r.title,
    maxHp: r.max_hp,
    currentHp: r.current_hp,
    endsAt: r.ends_at,
    yourDamage: r.yourDamage ?? 0,
    clanDamage: r.clan_damage,
  };
}

/**
 * Merges the authoritative clan numbers (monument, weekly XP) with the seeded
 * roster used for visual density, splicing the live player in as "you".
 * Real multiplayer rosters replace MOCK_CLAN once more players join.
 */
export function toClan(c: RawClan | null, player: Player): Clan {
  const base = c
    ? {
        name: c.name,
        tag: c.tag,
        description: c.description,
        monumentLevel: c.monument_level,
        monumentXp: c.monument_xp,
        monumentTarget: c.monument_target,
        weeklyGoal: c.weekly_goal,
        weeklyXp: c.weekly_xp,
      }
    : {
        name: MOCK_CLAN.name,
        tag: MOCK_CLAN.tag,
        description: MOCK_CLAN.description,
        monumentLevel: MOCK_CLAN.monumentLevel,
        monumentXp: MOCK_CLAN.monumentXp,
        monumentTarget: MOCK_CLAN.monumentTarget,
        weeklyGoal: MOCK_CLAN.weeklyGoal,
        weeklyXp: MOCK_CLAN.weeklyXp,
      };

  return {
    ...base,
    members: MOCK_CLAN.members.map((m) =>
      m.isYou
        ? {
            ...m,
            name: player.displayName || "You",
            crest: player.crest,
            level: player.level,
            trophies: player.trophies,
            streak: player.streak,
          }
        : m,
    ),
  };
}
