import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { reprovision } from "@/lib/provision";
import { maybeEncrypt } from "@/lib/crypto";

async function registerWebhook(storeId: number, accessToken: string, appUrl: string) {
  const webhookUrl = `${appUrl}/api/tiendanube/webhooks/app-uninstalled`;

  // Primero verificar si ya existe para no duplicar
  const listRes = await fetch(`https://api.tiendanube.com/v1/${storeId}/webhooks`, {
    headers: {
      Authentication: `bearer ${accessToken}`,
      "User-Agent": "Nova Recover (facuiguzman1@gmail.com)",
    },
  });

  if (listRes.ok) {
    const existing: { event: string }[] = await listRes.json();
    const alreadyRegistered = existing.some((w) => w.event === "app/uninstalled");
    if (alreadyRegistered) return;
  }

  await fetch(`https://api.tiendanube.com/v1/${storeId}/webhooks`, {
    method: "POST",
    headers: {
      Authentication: `bearer ${accessToken}`,
      "User-Agent": "Nova Recover (facuiguzman1@gmail.com)",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: "app/uninstalled",
      url: webhookUrl,
    }),
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${appUrl}/onboarding?tn_error=no_code`);
  }

  // Validar state para prevenir CSRF en el OAuth
  const cookieStore = await cookies();
  const savedState = cookieStore.get("tn_oauth_state")?.value;
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${appUrl}/onboarding?tn_error=invalid_state`);
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
    .select("id, n8n_client_id, completed_at")
    .eq("client_id", user.id)
    .single();

  if (existing) {
    await supabase.from("onboarding_data").update({
      tn_store_id: String(user_id),
      tn_api_token: maybeEncrypt(access_token),
      tn_disconnected_at: null,
    }).eq("id", existing.id);

    // Si ya estaba provisionado, recrear workflows con el token nuevo
    if (existing.n8n_client_id) {
      reprovision(user.id).catch((e) => console.error("Reprovision error:", e));
    }
  } else {
    const storeName = (user.user_metadata?.store_name as string | undefined) ?? "";
    await supabase.from("onboarding_data").insert({
      client_id: user.id,
      tn_store_id: String(user_id),
      tn_api_token: maybeEncrypt(access_token),
      email_sender_name: storeName,
    });
  }

  // Registrar webhook app/uninstalled en TiendaNube para esta tienda
  await registerWebhook(user_id, access_token, appUrl);

  const redirectPath = existing?.completed_at ? "/dashboard?tn_reconnected=1" : "/onboarding?tn_connected=1";
  const res = NextResponse.redirect(`${appUrl}${redirectPath}`);
  res.cookies.delete("tn_oauth_state");
  return res;
}
