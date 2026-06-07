import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/sanitize";
import { runProvision } from "@/lib/provision";

const INTERNAL_SECRET = process.env.PROVISION_INTERNAL_SECRET!;

export async function POST(req: Request) {
  let userId: string | null = null;

  const authHeader = req.headers.get("x-internal-secret");
  if (authHeader && INTERNAL_SECRET && authHeader === INTERNAL_SECRET) {
    const body = await req.json().catch(() => ({}));
    const rawUserId = body.user_id;
    if (!rawUserId || !isValidUUID(rawUserId)) {
      return NextResponse.json({ error: "user_id inválido" }, { status: 400 });
    }
    userId = rawUserId;
  } else {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    userId = user.id;
  }

  try {
    const result = await runProvision(userId!);
    if (!result.success && result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Provision error:", err);
    return NextResponse.json({ error: "Error interno al provisionar" }, { status: 500 });
  }
}
