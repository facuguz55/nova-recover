import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Rutas permitidas para redirect — previene open redirect attacks
const ALLOWED_REDIRECTS = ["/onboarding", "/dashboard", "/login"];

function isSafeRedirect(path: string): boolean {
  // Solo rutas internas, sin dominios externos, sin protocolo
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return ALLOWED_REDIRECTS.some(allowed => path.startsWith(allowed));
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/onboarding";

  // Validar que el redirect es seguro
  const next = isSafeRedirect(nextParam) ? nextParam : "/onboarding";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
