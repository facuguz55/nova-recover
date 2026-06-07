import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { EMAIL_TEMPLATES } from "@/lib/email-templates";
import { reprovision } from "@/lib/provision";

const VALID_IDS = new Set(EMAIL_TEMPLATES.map((t) => t.id));

export async function PATCH(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const templateId = String(body.template_id ?? "").trim();
  const emailSubject = String(body.email_subject ?? "").trim().slice(0, 120);

  if (templateId && !VALID_IDS.has(templateId)) {
    return NextResponse.json({ error: "Template inválido" }, { status: 400 });
  }
  if (!emailSubject) {
    return NextResponse.json({ error: "El asunto no puede estar vacío" }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await admin.from("onboarding_data").update({
    ...(templateId ? { email_template_id: templateId } : {}),
    email_subject: emailSubject,
  }).eq("client_id", user.id);

  // Recrear workflows con el nuevo template
  reprovision(user.id).catch((e) => console.error("Reprovision (email settings):", e));

  return NextResponse.json({ success: true });
}
