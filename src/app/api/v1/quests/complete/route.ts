import { callRpc, errorResponse, readJson } from "@/lib/api/server";

export const dynamic = "force-dynamic";

/** POST /api/v1/quests/complete — { questId, idempotencyKey }. Server-authored. */
export async function POST(req: Request) {
  const body = await readJson<{ questId?: string; idempotencyKey?: string }>(req);
  if (!body.questId || !body.idempotencyKey) {
    return errorResponse(
      "VALIDATION_ERROR",
      "questId and idempotencyKey are required.",
      400,
    );
  }
  return callRpc("lc_complete_quest", {
    p_quest_id: body.questId,
    p_idempotency: body.idempotencyKey,
  });
}
