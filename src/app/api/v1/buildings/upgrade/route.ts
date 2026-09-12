import { callRpc, errorResponse, readJson } from "@/lib/api/server";

export const dynamic = "force-dynamic";

/** POST /api/v1/buildings/upgrade — { type }. */
export async function POST(req: Request) {
  const body = await readJson<{ type?: string }>(req);
  if (!body.type) {
    return errorResponse("VALIDATION_ERROR", "type is required.", 400);
  }
  return callRpc("lc_upgrade_building", { p_type: body.type });
}
