import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${appUrl}/onboarding?tn_error=no_code`);
  }

  const appId = process.env.TIENDANUBE_APP_ID;
  const appSecret = process.env.TIENDANUBE_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.redirect(`${appUrl}/onboarding?tn_error=not_configured`);
  }

  // Intercambiar code por access_token
  const tokenRes = await fetch("https://www.tiendanube.com/apps/authorize/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/onboarding?tn_error=token_failed`);
  }

  const { access_token, user_id } = await tokenRes.json();

  // Guardar en Supabase
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);

  const { data: existing } = await supabase
    .from("onboarding_data")
    .select("id")
    .eq("client_id", user.id)
    .single();

  if (existing) {
    await supabase.from("onboarding_data").update({
      tn_store_id: String(user_id),
      tn_api_token: access_token,
    }).eq("id", existing.id);
  } else {
    await supabase.from("onboarding_data").insert({
      client_id: user.id,
      tn_store_id: String(user_id),
      tn_api_token: access_token,
    });
  }

  return NextResponse.redirect(`${appUrl}/onboarding?tn_connected=1`);
}
