"use client";

import type { ServerState } from "./serialize";
import type { OnboardingAnswers } from "@/types/game";

/**
 * Thin browser client for the /api/v1 backend. Every call goes through the
 * authenticated route handlers, which forward to the server-authoritative RPCs.
 */

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function req<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(`/api/v1${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = (payload as { error?: { code?: string; message?: string } })
      .error;
    throw new ApiError(
      err?.code ?? "INTERNAL_ERROR",
      err?.message ?? "Request failed.",
      res.status,
    );
  }
  return payload as T;
}

/* Reward payload returned by lc_complete_quest (state stripped where noted). */
export interface CompleteQuestResponse {
  questId: string;
  xp: number;
  gold: number;
  elixir: number;
  trophies: number;
  damage: number;
  leveledUp: boolean;
  newLevel: number;
  promoted: boolean;
  buildingLeveled: string | null;
  state: ServerState;
}

export const api = {
  getState: () => req<ServerState>("/state"),

  seedRealm: (answers: OnboardingAnswers) =>
    req<ServerState>("/onboarding", { method: "POST", json: answers }),

  completeQuest: (questId: string, idempotencyKey: string) =>
    req<CompleteQuestResponse>("/quests/complete", {
      method: "POST",
      json: { questId, idempotencyKey },
    }),

  createQuest: (payload: {
    title: string;
    category: string;
    difficulty: number;
    type?: string;
    targetValue?: number | null;
    unit?: string | null;
    description?: string;
  }) => req<unknown>("/quests", { method: "POST", json: payload }),

  updateQuest: (id: string, payload: Record<string, unknown>) =>
    req<unknown>(`/quests/${id}`, { method: "PATCH", json: payload }),

  deleteQuest: (id: string) =>
    req<{ deleted: string }>(`/quests/${id}`, { method: "DELETE" }),

  upgradeBuilding: (type: string) =>
    req<ServerState>("/buildings/upgrade", { method: "POST", json: { type } }),

  collectResource: (kind: "gold" | "elixir", amount: number) =>
    req<ServerState>("/resources/collect", {
      method: "POST",
      json: { kind, amount },
    }),

  purchaseItem: (itemId: string) =>
    req<ServerState>("/shop/purchase", { method: "POST", json: { itemId } }),
};
