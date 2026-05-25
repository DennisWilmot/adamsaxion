import { requireAdminUser } from "@/server/pricewar/admin-auth";
import { createPlayerFlag } from "@/server/pricewar/admin-players";
import { jsonError, jsonOk } from "@/server/pricewar/http";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminUser();
  if ("error" in auth) return jsonError(auth.error);

  const { id } = await context.params;

  let body: { reason?: string; severity?: string; notes?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError({ code: "INVALID_SUBMIT", message: "Invalid request body." });
  }

  if (!body.reason?.trim() || !body.severity?.trim()) {
    return jsonError({ code: "INVALID_SUBMIT", message: "Reason and severity required." });
  }

  const flag = await createPlayerFlag({
    userId: id,
    reason: body.reason.trim(),
    severity: body.severity.trim(),
    ...(body.notes?.trim() ? { notes: body.notes.trim() } : {}),
    adminEmail: auth.user.email ?? "admin",
  });

  return jsonOk({ flag }, 201);
}
