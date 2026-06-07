import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Borrar datos en orden (FK safe)
  await Promise.all([
    admin.from("subscriptions").delete().eq("client_id", user.id),
    admin.from("onboarding_data").delete().eq("client_id", user.id),
  ]);
  await admin.from("clients").delete().eq("id", user.id);
  await admin.auth.admin.deleteUser(user.id);

  // Cerrar sesión
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
