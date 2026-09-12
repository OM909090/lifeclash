import { callRpc, readJson } from "@/lib/api/server";

export const dynamic = "force-dynamic";

/** POST /api/v1/quests — create a custom quest. Reward is computed server-side. */
export async function POST(req: Request) {
  const body = await readJson(req);
  return callRpc("lc_create_quest", { p: body });
}
