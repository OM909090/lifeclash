import { callRpc } from "@/lib/api/server";

export const dynamic = "force-dynamic";

/** GET /api/v1/state — the full authoritative snapshot for the signed-in user. */
export async function GET() {
  return callRpc("lc_get_state", {});
}
