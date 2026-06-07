import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);

  const appId = process.env.TIENDANUBE_APP_ID;
  if (!appId) return NextResponse.json({ error: "App no configurada" }, { status: 500 });

  const redirectUri = `${appUrl}/api/tiendanube/callback`;
  const scopes = "read_products read_customers read_orders write_orders";
  const authUrl = `https://www.tiendanube.com/apps/${appId}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
  return NextResponse.redirect(authUrl);
}
