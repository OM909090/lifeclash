import { callRpc, errorResponse, readJson } from "@/lib/api/server";

export const dynamic = "force-dynamic";

/** POST /api/v1/resources/collect — { kind, amount }. Amount is clamped server-side. */
export async function POST(req: Request) {
  const body = await readJson<{ kind?: string; amount?: number }>(req);
  if (body.kind !== "gold" && body.kind !== "elixir") {
    return errorResponse("VALIDATION_ERROR", "kind must be gold or elixir.", 400);
  }
  return callRpc("lc_collect_resource", {
    p_kind: body.kind,
    p_amount: Math.trunc(Number(body.amount) || 0),
  });
}
