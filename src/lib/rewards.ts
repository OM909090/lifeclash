/**
 * Reward engine — the ONLY place reward numbers are produced.
 *
 * In the shipped product this logic lives on the server (see LIFECLASH-SPEC.md
 * §FR-2.5 / NFR-2.1: the client never calculates XP or currency). For the
 * frontend milestone it runs locally but is deliberately isolated behind the
 * same shape as `POST /api/v1/quests/{id}/complete`, so swapping to a Supabase
 * edge function / route handler later is a transport change only.
 */

import {
  QUEST_TEMPLATES,
  TIME_BUDGETS,
  CONSISTENCY_OPTIONS,
  PILLARS,
  type QuestTemplate,
} from "./game-config";
import type {
  ConsistencyId,
  PillarId,
  Quest,
  Reward,
  TimeBudgetId,
} from "@/types/game";
import { uid } from "./utils";

/* -------------------------------------------------------------------------- */
/* XP FORMULA — LIFECLASH-SPEC.md §15                                          */
/* XP = BaseXP × Difficulty × Quality × Consistency                            */
/* -------------------------------------------------------------------------- */

const BASE_XP = 50;

const DIFFICULTY_MULTIPLIER: Record<number, number> = {
  1: 0.8,
  2: 1.0,
  3: 1.25,
  4: 1.6,
};

export function difficultyLabel(d: number): string {
  return ["Easy", "Medium", "Hard", "Epic"][Math.min(3, Math.max(0, d - 1))];
}

export function computeReward(
  difficulty: number,
  cadence: Quest["cadence"],
  budgetScale: number,
): Reward {
  const diff = DIFFICULTY_MULTIPLIER[difficulty] ?? 1;
  const cadenceMult = cadence === "WEEKLY" ? 4.2 : cadence === "EPIC" ? 9 : 1;

  const xp = Math.round(BASE_XP * diff * cadenceMult * budgetScale);
  return {
    xp,
    gold: Math.round(xp * 0.55),
    elixir: Math.round(xp * 0.3),
    trophies: Math.max(1, Math.round(diff * 6 * (cadence === "DAILY" ? 1 : 2.5))),
  };
}

/** Raid damage derived from quest value — never sent by the client in prod. */
export function computeDamage(reward: Reward, difficulty: number): number {
  return Math.round(reward.xp * 2.4 * (1 + difficulty * 0.15));
}

/* -------------------------------------------------------------------------- */
/* QUEST GENERATION                                                            */
/* -------------------------------------------------------------------------- */

function scaleTarget(template: QuestTemplate, scale: number): number | undefined {
  if (template.baseTarget === undefined) return undefined;
  const raw = template.baseTarget * scale;
  // Round steps to the nearest 500, everything else to a clean integer.
  if (template.unit === "steps") return Math.round(raw / 500) * 500;
  if (raw >= 20) return Math.round(raw / 5) * 5;
  return Math.max(1, Math.round(raw));
}

function toQuest(
  template: QuestTemplate,
  scale: number,
  difficultyShift: number,
): Quest {
  const difficulty = Math.min(4, Math.max(1, template.difficulty + difficultyShift));
  const reward = computeReward(difficulty, template.cadence, scale);
  const target = scaleTarget(template, scale);

  return {
    id: `${template.id}_${uid("q")}`,
    title: template.title,
    description: template.description,
    category: template.category,
    type: template.type,
    cadence: template.cadence,
    status: "AVAILABLE",
    difficulty,
    targetValue: target,
    completedValue: 0,
    unit: template.unit,
    building: template.building,
    reward,
    damage: computeDamage(reward, difficulty),
  };
}

/**
 * Seeds the starting quest board from the onboarding answers:
 *  - which quests appear   ← step 2 (pillars)
 *  - how big they are      ← step 5 (time budget)
 *  - how hard they are     ← step 3 (current consistency)
 */
export function generateQuests(
  pillars: PillarId[],
  timeBudget: TimeBudgetId | null,
  consistency: ConsistencyId | null,
): Quest[] {
  const budget = TIME_BUDGETS.find((b) => b.id === timeBudget) ?? TIME_BUDGETS[1];
  const level = CONSISTENCY_OPTIONS.find((c) => c.id === consistency);
  const shift = level ? Math.round((level.difficulty - 2.5) / 1.5) : 0;

  const active = pillars.length > 0 ? pillars : (["mind", "body"] as PillarId[]);

  const daily = QUEST_TEMPLATES.filter(
    (t) => t.cadence === "DAILY" && active.includes(t.pillar),
  );
  const weekly = QUEST_TEMPLATES.filter(
    (t) => t.cadence === "WEEKLY" && active.includes(t.pillar),
  );

  // Two dailies per chosen pillar keeps the board full but not overwhelming.
  const picked: QuestTemplate[] = [];
  for (const pillar of active) {
    const forPillar = daily.filter((t) => t.pillar === pillar);
    picked.push(...forPillar.slice(0, 2));
  }
  // Always leave the streak quest on the board — it anchors the Defense Tower.
  const streak = QUEST_TEMPLATES.find((t) => t.id === "keep-streak");
  if (streak && !picked.some((p) => p.id === streak.id)) picked.push(streak);

  picked.push(...weekly.slice(0, 2));

  return picked.map((t) => toQuest(t, budget.scale, shift));
}

/** The pinned season objective from onboarding step 6. */
export function makeEpicQuest(goal: string, timeBudget: TimeBudgetId | null): Quest {
  const budget = TIME_BUDGETS.find((b) => b.id === timeBudget) ?? TIME_BUDGETS[1];
  const reward = computeReward(4, "EPIC", budget.scale);
  return {
    id: `epic_${uid("q")}`,
    title: goal || "Your Season Goal",
    description:
      "Your season objective, pinned in the Town Hall. Every daily quest moves it forward.",
    category: "FOCUS",
    type: "MILESTONE",
    cadence: "EPIC",
    status: "IN_PROGRESS",
    difficulty: 4,
    targetValue: 100,
    completedValue: 8,
    unit: "%",
    building: "TOWN_HALL",
    reward,
    damage: computeDamage(reward, 4),
  };
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

export function startingTrophies(consistency: ConsistencyId | null): number {
  return CONSISTENCY_OPTIONS.find((c) => c.id === consistency)?.trophies ?? 40;
}

export function pillarLabel(id: PillarId): string {
  return PILLARS.find((p) => p.id === id)?.label ?? id;
}
