import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

/**
 * Shared plumbing for the /api/v1 route handlers.
 *
 * The real work lives in the Postgres SECURITY DEFINER functions; these
 * handlers authenticate the request against the session cookie and forward to
 * the matching RPC, translating raised error tokens into the HTTP status codes
 * documented in LIFECLASH-SPEC.md §9/§10.
 */

/** Error token (raised in SQL) → { HTTP status, error code }. */
const ERROR_MAP: Record<string, { status: number; code: string }> = {
  UNAUTHORIZED: { status: 401, code: "UNAUTHORIZED" },
  FORBIDDEN: { status: 403, code: "FORBIDDEN" },
  QUEST_NOT_OWNED: { status: 403, code: "QUEST_NOT_OWNED" },
  NOT_FOUND: { status: 404, code: "NOT_FOUND" },
  QUEST_ALREADY_COMPLETED: { status: 409, code: "QUEST_ALREADY_COMPLETED" },
  ALREADY_OWNED: { status: 409, code: "ALREADY_OWNED" },
  INSUFFICIENT_GOLD: { status: 422, code: "INSUFFICIENT_GOLD" },
  INSUFFICIENT_ELIXIR: { status: 422, code: "INSUFFICIENT_ELIXIR" },
  INSUFFICIENT_GEMS: { status: 422, code: "INSUFFICIENT_GEMS" },
  BUILDING_MAX_LEVEL: { status: 422, code: "BUILDING_MAX_LEVEL" },
  BUILDING_LOCKED: { status: 422, code: "BUILDING_LOCKED" },
  VALIDATION_ERROR: { status: 400, code: "VALIDATION_ERROR" },
};

export function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

/** Find a known error token inside a Postgres/PostgREST error message. */
function classify(message: string): { status: number; code: string } {
  for (const token of Object.keys(ERROR_MAP)) {
    if (message.includes(token)) return ERROR_MAP[token];
  }
  return { status: 500, code: "INTERNAL_ERROR" };
}

/**
 * Authenticate, call a Postgres RPC, and return its JSON — or the mapped error.
 * `transform` lets a handler reshape the successful payload.
 */
export async function callRpc(
  fn: string,
  args: Record<string, unknown>,
  transform?: (data: unknown) => unknown,
) {
  const supabase = getServerClient();
  if (!supabase) {
    return errorResponse(
      "NOT_CONFIGURED",
      "Supabase is not configured on the server.",
      503,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return errorResponse("UNAUTHORIZED", "You must be signed in.", 401);
  }

  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    const { status, code } = classify(error.message);
    return errorResponse(code, humanize(code, error.message), status);
  }

  return NextResponse.json(transform ? transform(data) : data);
}

/** Whether the request carries a valid session (used by read handlers). */
export async function currentUser() {
  const supabase = getServerClient();
  if (!supabase) return { supabase: null, user: null };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Friendlier messages for the known business errors. */
function humanize(code: string, fallback: string): string {
  const messages: Record<string, string> = {
    UNAUTHORIZED: "You must be signed in.",
    FORBIDDEN: "You can't do that.",
    QUEST_NOT_OWNED: "That quest isn't yours.",
    NOT_FOUND: "Not found.",
    QUEST_ALREADY_COMPLETED: "This quest is already complete.",
    ALREADY_OWNED: "You already own that item.",
    INSUFFICIENT_GOLD: "Not enough gold.",
    INSUFFICIENT_ELIXIR: "Not enough elixir.",
    INSUFFICIENT_GEMS: "Not enough gems.",
    BUILDING_MAX_LEVEL: "This building is already at max level.",
    BUILDING_LOCKED: "That building is locked.",
    VALIDATION_ERROR: "Please check your input.",
    INTERNAL_ERROR: "Something went wrong. Please try again.",
  };
  return messages[code] ?? fallback;
}

/** Safely parse a JSON request body, tolerating an empty body. */
export async function readJson<T = Record<string, unknown>>(
  req: Request,
): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}
