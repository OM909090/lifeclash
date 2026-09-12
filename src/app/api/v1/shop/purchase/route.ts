import { callRpc, errorResponse, readJson } from "@/lib/api/server";

export const dynamic = "force-dynamic";

/** POST /api/v1/shop/purchase — { itemId }. Price is authoritative on the server. */
export async function POST(req: Request) {
  const body = await readJson<{ itemId?: string }>(req);
  if (!body.itemId) {
    return errorResponse("VALIDATION_ERROR", "itemId is required.", 400);
  }
  return callRpc("lc_purchase_item", { p_item: body.itemId });
}
