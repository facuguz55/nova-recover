import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function sanitize(str: string) {
  return str.trim().replace(/[<>"']/g, "").slice(0, 100);
}

export async function PATCH(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = sanitize(String(body.name ?? ""));
  const storeName = String(body.store_name ?? "").trim().replace(/[<>"']/g, "").slice(0, 60);

  if (!name) return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await Promise.all([
    admin.from("clients").update({ name }).eq("id", user.id),
    admin.from("onboarding_data").update({ email_sender_name: storeName }).eq("client_id", user.id),
    admin.auth.admin.updateUserById(user.id, { user_metadata: { name, store_name: storeName } }),
  ]);

  return NextResponse.json({ success: true });
}
