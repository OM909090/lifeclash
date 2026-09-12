import { callRpc, readJson } from "@/lib/api/server";

export const dynamic = "force-dynamic";

/** POST /api/v1/onboarding — seed the realm from wizard answers. */
export async function POST(req: Request) {
  const body = await readJson(req);
  return callRpc("lc_seed_realm", { p: body });
}
