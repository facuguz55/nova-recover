import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);

  const appId = process.env.TIENDANUBE_APP_ID;
  if (!appId) return NextResponse.json({ error: "App no configurada" }, { status: 500 });

  // state anti-CSRF: lo guardamos en cookie httpOnly y lo validamos en el callback
  const state = randomBytes(16).toString("hex");
  const redirectUri = `${appUrl}/api/tiendanube/callback`;
  const scopes = "read_products read_customers read_orders write_orders";
  const authUrl = `https://www.tiendanube.com/apps/${appId}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("tn_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
