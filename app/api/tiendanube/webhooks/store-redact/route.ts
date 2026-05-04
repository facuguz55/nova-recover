import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.TIENDANUBE_APP_SECRET) return false;
  const hmac = crypto.createHmac("sha256", process.env.TIENDANUBE_APP_SECRET).update(body).digest("hex");
  return hmac === signature;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-linkedstore-token");

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { store_id } = JSON.parse(body);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Eliminar datos del store de nuestra base
  const { data: onboarding } = await supabase
    .from("onboarding_data")
    .select("client_id")
    .eq("tn_store_id", String(store_id))
    .single();

  if (onboarding) {
    await supabase.from("onboarding_data").delete().eq("tn_store_id", String(store_id));
    await supabase.from("subscriptions").delete().eq("client_id", onboarding.client_id);
    await supabase.from("clients").delete().eq("id", onboarding.client_id);
  }

  return NextResponse.json({ success: true });
}
