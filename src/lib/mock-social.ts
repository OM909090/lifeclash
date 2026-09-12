/**
 * Mock social data for the frontend milestone.
 *
 * Everything here is replaced by Supabase queries in the backend phase — the
 * shapes match the DTOs in LIFECLASH-SPEC.md §7.7 / §7.11 so the swap is a
 * data-source change, not a component change.
 */

import type {
  Clan,
  ClanMemberSummary,
  LeaderboardRow,
  LeaderboardScope,
} from "@/types/game";
import { leagueFor } from "./game-config";

const MEMBERS: ClanMemberSummary[] = [
  { id: "u1", name: "Aarav", role: "OWNER", level: 24, weeklyXp: 4820, trophies: 2140, streak: 46, crest: "🐉" },
  { id: "u2", name: "Ishita", role: "LEADER", level: 22, weeklyXp: 4410, trophies: 1980, streak: 38, crest: "🦉" },
  { id: "you", name: "You", role: "OFFICER", level: 1, weeklyXp: 0, trophies: 40, streak: 0, crest: "🦁", isYou: true },
  { id: "u3", name: "Kabir", role: "OFFICER", level: 19, weeklyXp: 3760, trophies: 1610, streak: 27, crest: "🦅" },
  { id: "u4", name: "Meera", role: "MEMBER", level: 18, weeklyXp: 3120, trophies: 1440, streak: 31, crest: "🐺" },
  { id: "u5", name: "Rohan", role: "MEMBER", level: 16, weeklyXp: 2680, trophies: 1180, streak: 12, crest: "🦌" },
  { id: "u6", name: "Sana", role: "MEMBER", level: 15, weeklyXp: 2240, trophies: 980, streak: 19, crest: "🐝" },
  { id: "u7", name: "Dev", role: "MEMBER", level: 13, weeklyXp: 1890, trophies: 820, streak: 8, crest: "🐢" },
  { id: "u8", name: "Priya", role: "MEMBER", level: 12, weeklyXp: 1540, trophies: 690, streak: 14, crest: "🦊" },
  { id: "u9", name: "Arjun", role: "MEMBER", level: 10, weeklyXp: 1180, trophies: 520, streak: 5, crest: "🦈" },
];

export const MOCK_CLAN: Clan = {
  name: "Code Warriors",
  tag: "#CODE",
  description: "Students defeating procrastination, one quest at a time.",
  monumentLevel: 7,
  monumentXp: 4_500,
  monumentTarget: 6_000,
  weeklyGoal: 30_000,
  weeklyXp: 25_640,
  members: MEMBERS,
};

const GLOBAL_NAMES = [
  ["Vihaan", "🐉", 41, 9820, 3210, 118],
  ["Ananya", "🦅", 38, 9140, 2980, 96],
  ["Zoya", "🦉", 36, 8710, 2840, 87],
  ["Aarav", "🐺", 34, 8120, 2610, 74],
  ["Kiaan", "🦁", 32, 7640, 2380, 69],
  ["Ishita", "🦌", 31, 7180, 2210, 61],
  ["Neel", "🐝", 29, 6720, 2040, 58],
  ["Tara", "🦊", 28, 6310, 1890, 52],
  ["Kabir", "🐢", 26, 5880, 1740, 47],
  ["Diya", "🦈", 25, 5420, 1620, 44],
] as const;

const FRIEND_NAMES = [
  ["Ishita", "🦉", 22, 4410, 1980, 38],
  ["Kabir", "🦅", 19, 3760, 1610, 27],
  ["Meera", "🐺", 18, 3120, 1440, 31],
  ["Rohan", "🦌", 16, 2680, 1180, 12],
  ["Sana", "🐝", 15, 2240, 980, 19],
  ["Dev", "🐢", 13, 1890, 820, 8],
] as const;

function toRows(
  source: readonly (readonly [string, string, number, number, number, number])[],
): LeaderboardRow[] {
  return source.map(([name, crest, level, weeklyXp, trophies, streak], i) => ({
    rank: i + 1,
    name,
    crest,
    level,
    weeklyXp,
    trophies,
    streak,
    league: leagueFor(trophies).id,
  }));
}

/**
 * Builds a leaderboard with the live player spliced into the correct position
 * by weekly XP, so the podium reacts as the demo completes quests.
 */
export function buildLeaderboard(
  scope: LeaderboardScope,
  you: { name: string; crest: string; level: number; weeklyXp: number; trophies: number; streak: number },
): LeaderboardRow[] {
  const base =
    scope === "GLOBAL"
      ? toRows(GLOBAL_NAMES)
      : scope === "FRIENDS"
        ? toRows(FRIEND_NAMES)
        : MOCK_CLAN.members
            .filter((m) => !m.isYou)
            .map((m, i) => ({
              rank: i + 1,
              name: m.name,
              crest: m.crest,
              level: m.level,
              weeklyXp: m.weeklyXp,
              trophies: m.trophies,
              streak: m.streak,
              league: leagueFor(m.trophies).id,
            }));

  const rows: LeaderboardRow[] = [
    ...base,
    {
      rank: 0,
      name: you.name || "You",
      crest: you.crest,
      level: you.level,
      weeklyXp: you.weeklyXp,
      trophies: you.trophies,
      streak: you.streak,
      league: leagueFor(you.trophies).id,
      isYou: true,
    },
  ];

  rows.sort((a, b) => b.weeklyXp - a.weeklyXp || b.trophies - a.trophies);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

/** Recent clan activity feed — "chat-lite" per the brief. */
export const CLAN_FEED = [
  { id: "f1", who: "Aarav", crest: "🐉", text: "cleared a 90-min Deep Work Siege", xp: 190, when: "12m ago" },
  { id: "f2", who: "Ishita", crest: "🦉", text: "hit a 38-day streak 🔥", xp: 60, when: "34m ago" },
  { id: "f3", who: "Kabir", crest: "🦅", text: "dealt 2,140 damage to the Dragon", xp: 140, when: "1h ago" },
  { id: "f4", who: "Meera", crest: "🐺", text: "upgraded Training Grounds to Lv 7", xp: 0, when: "2h ago" },
  { id: "f5", who: "Sana", crest: "🐝", text: "finished Five Trainings This Week", xp: 420, when: "3h ago" },
  { id: "f6", who: "Rohan", crest: "🦌", text: "sealed the vault — no-spend day", xp: 50, when: "5h ago" },
];
