import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect("/login");

  const appId = process.env.TIENDANUBE_APP_ID;
  if (!appId) return NextResponse.json({ error: "App no configurada" }, { status: 500 });

  const authUrl = `https://www.tiendanube.com/apps/${appId}/authorize`;
  return NextResponse.redirect(authUrl);
}
