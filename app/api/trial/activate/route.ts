import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Rate limit: máximo 5 intentos por usuario por hora
  const { allowed } = rateLimit(`trial:${user.id}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiados intentos. Esperá un momento." }, { status: 429 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id, status")
    .eq("client_id", user.id)
    .single();

  // No permitir activar trial si ya tiene una suscripción activa o pagada
  if (existing && (existing.status === "active")) {
    return NextResponse.json({ error: "Ya tenés una suscripción activa" }, { status: 400 });
  }

  if (existing) {
    await admin.from("subscriptions").update({ status: "trial" }).eq("id", existing.id);
  } else {
    const { error: subError } = await admin
      .from("subscriptions")
      .insert({ client_id: user.id, status: "trial" });
    if (subError) {
      return NextResponse.json({ error: "Error al activar el trial" }, { status: 500 });
    }
  }

  await admin.from("clients").update({ status: "active" }).eq("id", user.id);
  await admin.from("onboarding_data").update({ completed_at: new Date().toISOString() }).eq("client_id", user.id);

  // Provisionar workflows con secret interno
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    await fetch(`${appUrl}/api/provision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.PROVISION_INTERNAL_SECRET ?? "",
      },
      body: JSON.stringify({ user_id: user.id }),
    });
  } catch (e) {
    console.error("Provision error (trial):", e);
  }

  return NextResponse.json({ success: true });
}
