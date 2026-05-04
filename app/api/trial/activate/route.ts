import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Verificar si ya tiene suscripción
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("client_id", user.id)
    .single();

  if (existing) {
    await admin.from("subscriptions").update({ status: "trial" }).eq("id", existing.id);
  } else {
    const { error: subError } = await admin
      .from("subscriptions")
      .insert({ client_id: user.id, status: "trial" });
    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }
  }

  // Marcar cliente como activo
  await admin
    .from("clients")
    .update({ status: "active" })
    .eq("id", user.id);

  // Marcar onboarding como completado
  await admin
    .from("onboarding_data")
    .update({ completed_at: new Date().toISOString() })
    .eq("client_id", user.id);

  return NextResponse.json({ success: true });
}
