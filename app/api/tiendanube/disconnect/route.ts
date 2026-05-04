import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("onboarding_data")
    .update({
      tn_api_token: null,
      tn_disconnected_at: new Date().toISOString(),
    })
    .eq("client_id", user.id);

  await supabase
    .from("clients")
    .update({ status: "inactive" })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
