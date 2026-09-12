import { callRpc, readJson } from "@/lib/api/server";

export const dynamic = "force-dynamic";

/** PATCH /api/v1/quests/:id — edit a custom quest. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await readJson(req);
  return callRpc("lc_update_quest", { p_id: params.id, p: body });
}

/** DELETE /api/v1/quests/:id — remove a custom quest. */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  return callRpc("lc_delete_quest", { p_id: params.id });
}
